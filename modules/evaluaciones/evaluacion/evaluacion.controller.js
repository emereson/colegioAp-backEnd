import { Op } from 'sequelize';
import db from '../../../database/config.js';
import Classroom from '../../../models/classroom.model.js';
import AppError from '../../../utils/AppError.js';
import catchAsync from '../../../utils/catchAsync.js';
import { deleteImage, uploadImage } from '../../../utils/serverImage.js';
import PreguntaEvaluacion from '../preguntasEvaluacion/preguntaEvaluacion.model.js';
import { validarRespuestasJSON } from '../preguntasEvaluacion/preguntaEvaluacion.validator.js';
import SemanaEvaluacion from '../semanaEvaluacion/semanaEvaluacion.model.js';
import Evaluaciones from './evaluacion.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const evaluaciones = await Evaluaciones.findAll({
    include: [
      { model: SemanaEvaluacion, as: 'semana_evaluacion' },
      { model: Classroom, as: 'aula' },
      { model: PreguntaEvaluacion, as: 'preguntas_evaluacion' },
    ],
  });

  return res.status(200).json({
    status: 'Success',
    results: evaluaciones.length,
    evaluaciones,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { evaluacion } = req;

  return res.status(200).json({
    status: 'Success',
    evaluacion,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { semanaEvaluacion } = req;
  const {
    nombre_evaluacion,
    fecha_disponible,
    fecha_entrega,
    limite_tiempo,
    puntos,
    preguntas_disponibles,
  } = req.body;

  let preguntasArray = [];
  try {
    preguntasArray =
      typeof req.body.preguntas === 'string'
        ? JSON.parse(req.body.preguntas)
        : req.body.preguntas;
  } catch (error) {
    return next(
      new AppError(
        'El formato de las preguntas es inválido. Se esperaba un JSON.',
        400,
      ),
    );
  }

  if (!preguntasArray || preguntasArray.length === 0) {
    return next(
      new AppError('La evaluación debe tener al menos una pregunta.', 400),
    );
  }
  if (preguntasArray.length < Number(preguntas_disponibles)) {
    return next(
      new AppError(
        'El número de preguntas creadas no puede ser menor que el número de preguntas disponibles.',
        400,
      ),
    );
  }
  for (let i = 0; i < preguntasArray.length; i++) {
    const { tipo_pregunta, respuestas } = preguntasArray[i];
    const { error } = validarRespuestasJSON(tipo_pregunta, respuestas);

    if (error) {
      const msg = error.details
        ? error.details.map((e) => e.message).join(', ')
        : error.message;
      return next(
        new AppError(`Error estructural en la pregunta ${i + 1}: ${msg}`, 400),
      );
    }
  }

  // Array global para rastrear imágenes exitosas (útil por si ocurre un error catastrófico)
  const imagenesSubidasParaRollback = [];

  try {
    // 3. SUBIDA DE IMÁGENES EN PARALELO (Puro poder de Node.js)
    const promesasPreguntas = preguntasArray.map(async (pregunta, i) => {
      const {
        titulo_pregunta,
        descripcion_pregunta,
        tipo_pregunta,
        respuestas,
      } = pregunta;

      // La validación ya la hicimos, solo necesitamos formatear de nuevo las opciones limpias
      const { value: opcionesValidadas } = validarRespuestasJSON(
        tipo_pregunta,
        respuestas,
      );

      let imagenSubida = null;

      // Buscar si esta pregunta en particular trajo un archivo (ej: imagen_pregunta_0)
      if (req.files && req.files.length > 0) {
        const file = req.files.find(
          (f) => f.fieldname === `imagen_pregunta_${i}`,
        );

        if (file) {
          imagenSubida = await uploadImage(file); // Sube al VPS de Laravel
          imagenesSubidasParaRollback.push(imagenSubida); // Guardamos el nombre
        }
      }

      // Retornamos la pregunta estructurada y lista para la Base de Datos
      return {
        titulo_pregunta,
        descripcion_pregunta,
        tipo_pregunta,
        respuestas: opcionesValidadas,
        imagen_pregunta: imagenSubida,
      };
    });

    // 🔴 ESPERAMOS A QUE TODAS LAS SUBIDAS TERMINEN AL MISMO TIEMPO
    const preguntasListasParaBD = await Promise.all(promesasPreguntas);

    // 4. TRANSACCIÓN EN LA BASE DE DATOS (Todo o Nada)
    const nuevaEvaluacion = await db.transaction(async (t) => {
      // A. Crear el registro principal
      const evaluacion = await Evaluaciones.create(
        {
          semana_id: semanaEvaluacion.id,
          aula_id: semanaEvaluacion.aula_id,
          nombre_evaluacion,
          fecha_disponible,
          fecha_entrega,
          limite_tiempo,
          puntos,
          preguntas_disponibles,
        },
        { transaction: t },
      );

      // B. Inyectar el ID de la evaluación a cada pregunta
      const preguntasFinales = preguntasListasParaBD.map((p) => ({
        ...p,
        evaluacion_id: evaluacion.id,
      }));

      // C. Inserción Masiva de las preguntas
      await PreguntaEvaluacion.bulkCreate(preguntasFinales, { transaction: t });

      return evaluacion;
    });

    // 5. RESPUESTA AL CLIENTE
    res.status(201).json({
      status: 'success',
      message:
        '¡La evaluación se ha creado con todas sus preguntas correctamente!',
      evaluacion: nuevaEvaluacion,
    });
  } catch (error) {
    // 6. SISTEMA DE SALVAVIDAS (ROLLBACK DE ARCHIVOS)
    // Si llegamos aquí, es porque falló una subida de imagen O falló la base de datos.
    console.error(
      '🔥 Error detectado. Iniciando limpieza de archivos huérfanos...',
      error,
    );

    // Ejecutamos limpieza en paralelo para no hacer esperar más al servidor
    if (imagenesSubidasParaRollback.length > 0) {
      const promesasDeBorrado = imagenesSubidasParaRollback.map((filename) =>
        deleteImage(filename).catch((err) =>
          console.error(
            `Fallo al borrar archivo residual ${filename}:`,
            err.message,
          ),
        ),
      );
      await Promise.all(promesasDeBorrado);
      console.log('🧹 Limpieza completada.');
    }

    // Le pasamos el error a tu manejador global (AppError o catchAsync)
    return next(
      new AppError(
        'Hubo un error al procesar la evaluación. Los cambios se han revertido.',
        500,
      ),
    );
  }
});

export const update = catchAsync(async (req, res, next) => {
  const { evaluacion } = req;
  const {
    nombre_evaluacion,
    fecha_disponible,
    fecha_entrega,
    limite_tiempo,
    puntos,
    preguntas_disponibles,
    status,
  } = req.body;

  let preguntasArray = [];
  try {
    preguntasArray =
      typeof req.body.preguntas === 'string'
        ? JSON.parse(req.body.preguntas)
        : req.body.preguntas;
  } catch (error) {
    return next(new AppError('Formato de preguntas inválido.', 400));
  }

  const imagenesNuevasSubidas = [];
  const imagenesParaBorrar = [];

  try {
    const promesasPreguntas = preguntasArray.map(async (pregunta, i) => {
      const {
        id,
        titulo_pregunta,
        descripcion_pregunta,
        tipo_pregunta,
        respuestas,
      } = pregunta;

      const { value: opcionesValidadas, error } = validarRespuestasJSON(
        tipo_pregunta,
        respuestas,
      );
      if (error) throw new Error(`Pregunta ${i + 1}: ${error.message}`);

      let imagenFinal = null;

      if (req.files && req.files.length > 0) {
        const file = req.files.find(
          (f) => f.fieldname === `imagen_pregunta_${i}`,
        );
        if (file) {
          imagenFinal = await uploadImage(file);
          imagenesNuevasSubidas.push(imagenFinal);

          // 🟢 OPTIMIZACIÓN: Buscamos la imagen vieja en el array que ya trajo el middleware
          if (id) {
            const preguntaVieja = evaluacion.preguntas_evaluacion.find(
              (p) => p.id === Number(id),
            );
            if (preguntaVieja?.imagen_pregunta) {
              imagenesParaBorrar.push(preguntaVieja.imagen_pregunta);
            }
          }
        }
      }

      return {
        id,
        titulo_pregunta,
        descripcion_pregunta,
        tipo_pregunta,
        respuestas: opcionesValidadas,
        ...(imagenFinal && { imagen_pregunta: imagenFinal }),
        evaluacion_id: evaluacion.id,
      };
    });

    const preguntasProcesadas = await Promise.all(promesasPreguntas);

    await db.transaction(async (t) => {
      // A. Actualizar cabecera
      await evaluacion.update(
        {
          nombre_evaluacion,
          fecha_disponible,
          fecha_entrega,
          limite_tiempo,
          puntos,
          preguntas_disponibles,
          status,
        },
        { transaction: t },
      );

      // B. Identificar eliminaciones
      const idsNuevos = preguntasProcesadas
        .filter((p) => p.id)
        .map((p) => Number(p.id));

      // 🟢 OPTIMIZACIÓN: Filtramos desde memoria para saber qué imágenes borrar físicamente
      evaluacion.preguntas_evaluacion.forEach((p) => {
        if (!idsNuevos.includes(p.id) && p.imagen_pregunta) {
          imagenesParaBorrar.push(p.imagen_pregunta);
        }
      });

      // C. Borrado en DB
      await PreguntaEvaluacion.destroy({
        where: {
          evaluacion_id: evaluacion.id,
          id: { [Op.notIn]: idsNuevos },
        },
        transaction: t,
      });

      // D. Upsert manual (Update o Create)
      for (const pData of preguntasProcesadas) {
        if (pData.id) {
          await PreguntaEvaluacion.update(pData, {
            where: { id: pData.id },
            transaction: t,
          });
        } else {
          await PreguntaEvaluacion.create(pData, { transaction: t });
        }
      }
    });

    // 2. Limpieza de archivos (Solo si la transacción fue exitosa)
    if (imagenesParaBorrar.length > 0) {
      // Eliminamos duplicados por si acaso
      [...new Set(imagenesParaBorrar)].forEach((img) =>
        deleteImage(img).catch(console.error),
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Evaluación actualizada.',
      evaluacion,
    });
  } catch (error) {
    if (imagenesNuevasSubidas.length > 0) {
      imagenesNuevasSubidas.forEach((img) =>
        deleteImage(img).catch(console.error),
      );
    }
    return next(new AppError(error.message, 500));
  }
});

export const remove = catchAsync(async (req, res, next) => {
  const { evaluacion } = req;

  const imagenesABorrar = evaluacion.preguntas_evaluacion
    .map((p) => p.imagen_pregunta)
    .filter((img) => img !== null && img !== '');

  try {
    await db.transaction(async (t) => {
      await evaluacion.preguntas_evaluacion.forEach(async (p) => {
        await p.destroy({ transaction: t });
      });
      await evaluacion.destroy({ transaction: t });
    });

    if (imagenesABorrar.length > 0) {
      Promise.allSettled(
        imagenesABorrar.map((nombreArchivo) => deleteImage(nombreArchivo)),
      ).catch((err) => console.error('Error limpiando archivos:', err));
    }

    return res.status(200).json({
      status: 'success',
      message: `La evaluación "${evaluacion.nombre_evaluacion}" ha sido eliminada permanentemente.`,
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError(
        'No se pudo completar la eliminación. Inténtalo de nuevo.',
        500,
      ),
    );
  }
});
