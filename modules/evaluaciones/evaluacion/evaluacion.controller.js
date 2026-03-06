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
  const { year, aula, estado } = req.query;

  const semanaWhere = {};
  const aulaWhere = {};
  const evaluacionWhere = {};

  if (year && year.length > 0) {
    semanaWhere.year = year;
  }

  if (aula && aula.length > 0) {
    aulaWhere.name = aula;
  }

  if (estado && estado.length > 0) {
    evaluacionWhere.status = estado;
  }

  const evaluaciones = await Evaluaciones.findAll({
    where: evaluacionWhere,
    include: [
      { model: SemanaEvaluacion, as: 'semana_evaluacion', where: semanaWhere },
      { model: Classroom, as: 'aula', where: aulaWhere },
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

  // Array para llevar el registro de TODO lo que se suba y poder borrarlo si algo falla
  const imagenesSubidasParaRollback = [];

  try {
    const preguntasListasParaBD = [];

    // Usamos for...of para procesar todo de forma secuencial
    for (let i = 0; i < preguntasArray.length; i++) {
      const pregunta = preguntasArray[i];
      const { titulo_pregunta, descripcion_pregunta, tipo_pregunta } = pregunta;

      let respuestas = pregunta.respuestas;

      // --- A. PRE-PROCESAMIENTO DE RESPUESTAS ---
      // Asegurarnos de que respuestas sea un objeto/array manipulable antes de inyectar imágenes
      if (typeof respuestas === 'string') {
        try {
          respuestas = JSON.parse(respuestas);
        } catch (err) {
          throw new AppError(
            `El formato de respuestas en la pregunta ${i + 1} no es un JSON válido.`,
            400,
          );
        }
      }

      // Normalización si viene como objeto indexado desde FormData en lugar de Array
      if (
        tipo_pregunta === 'ALTERNATIVAS' &&
        respuestas !== null &&
        typeof respuestas === 'object' &&
        !Array.isArray(respuestas)
      ) {
        respuestas = Object.values(respuestas);
      }

      // --- B. SUBIDA DE IMAGEN PRINCIPAL DE LA PREGUNTA ---
      let imagenSubidaPregunta = null;

      if (req.files && Array.isArray(req.files)) {
        const filePregunta = req.files.find(
          (f) => f.fieldname === `imagen_pregunta_${i}`,
        );
        if (filePregunta) {
          imagenSubidaPregunta = await uploadImage(filePregunta); // Sube al VPS
          imagenesSubidasParaRollback.push(imagenSubidaPregunta);
        }
      }

      // --- C. SUBIDA DE IMÁGENES PARA LAS ALTERNATIVAS ---
      if (tipo_pregunta === 'ALTERNATIVAS' && Array.isArray(respuestas)) {
        for (let j = 0; j < respuestas.length; j++) {
          if (req.files && Array.isArray(req.files)) {
            // Buscamos el archivo con el formato: imagen_pregunta_0_alternativa_1
            const fieldNameAlt = `imagen_pregunta_${i}_alternativa_${j}`;
            const fileAlt = req.files.find((f) => f.fieldname === fieldNameAlt);

            if (fileAlt) {
              const imgAltSubida = await uploadImage(fileAlt); // Sube al VPS
              imagenesSubidasParaRollback.push(imgAltSubida);

              // Inyectamos el nombre de la imagen en el JSON de la respuesta
              respuestas[j].imagen = imgAltSubida;
            }
          }
        }
      }

      // --- D. VALIDACIÓN CON JOI (AHORA SÍ, CON LAS IMÁGENES INYECTADAS) ---
      const { error, value: opcionesValidadas } = validarRespuestasJSON(
        tipo_pregunta,
        respuestas,
      );

      if (error) {
        const msg = error.details
          ? error.details.map((e) => e.message).join(', ')
          : error.message;
        throw new AppError(
          `Error estructural en la pregunta ${i + 1}: ${msg}`,
          400,
        );
      }

      // --- E. PREPARAMOS EL OBJETO PARA LA BD ---
      preguntasListasParaBD.push({
        titulo_pregunta,
        descripcion_pregunta,
        tipo_pregunta,
        respuestas: opcionesValidadas,
        imagen_pregunta: imagenSubidaPregunta,
      });
    }

    // --- 4. TRANSACCIÓN EN BASE DE DATOS ---
    const nuevaEvaluacion = await db.transaction(async (t) => {
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

      const preguntasFinales = preguntasListasParaBD.map((p) => ({
        ...p,
        evaluacion_id: evaluacion.id,
      }));

      await PreguntaEvaluacion.bulkCreate(preguntasFinales, { transaction: t });

      return evaluacion;
    });

    // --- 5. RESPUESTA EXITOSA ---
    res.status(201).json({
      status: 'success',
      message:
        '¡La evaluación se ha creado con todas sus preguntas correctamente!',
      evaluacion: nuevaEvaluacion,
    });
  } catch (error) {
    console.error(
      '🔥 Error detectado. Iniciando limpieza de archivos huérfanos...',
      error,
    );

    // Rollback de imágenes: borramos todo lo que se alcanzó a subir antes del error
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

    // Si el error ya es un AppError (como el de validación o formato), lo pasamos tal cual
    if (error.isOperational) {
      return next(error);
    }

    // Si es un error de BD u otro tipo, lanzamos uno genérico 500
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

  // Arrays de control para limpieza
  const imagenesNuevasSubidas = [];
  let imagenesParaBorrar = [];

  // Función auxiliar para extraer todas las imágenes (principales y alternativas) de un array de preguntas
  const extraerImagenes = (preguntas) => {
    const imagenes = [];
    preguntas.forEach((p) => {
      if (p.imagen_pregunta) imagenes.push(p.imagen_pregunta);
      if (p.tipo_pregunta === 'ALTERNATIVAS' && p.respuestas) {
        let resp =
          typeof p.respuestas === 'string'
            ? JSON.parse(p.respuestas)
            : p.respuestas;
        if (Array.isArray(resp)) {
          resp.forEach((r) => {
            if (r.imagen) imagenes.push(r.imagen);
          });
        }
      }
    });
    return imagenes;
  };

  try {
    const preguntasProcesadas = [];

    // 1. PROCESAMIENTO SECUENCIAL (Igual que en create)
    for (let i = 0; i < preguntasArray.length; i++) {
      const pregunta = preguntasArray[i];
      const { id, titulo_pregunta, descripcion_pregunta, tipo_pregunta } =
        pregunta;

      let respuestas = pregunta.respuestas;

      // --- A. Pre-procesamiento de Respuestas ---
      if (typeof respuestas === 'string') {
        try {
          respuestas = JSON.parse(respuestas);
        } catch (err) {
          throw new AppError(
            `El formato de respuestas en la pregunta ${i + 1} no es válido.`,
            400,
          );
        }
      }
      if (
        tipo_pregunta === 'ALTERNATIVAS' &&
        respuestas !== null &&
        typeof respuestas === 'object' &&
        !Array.isArray(respuestas)
      ) {
        respuestas = Object.values(respuestas);
      }

      // --- B. Subida de Imagen Principal ---
      let imagenFinal = null;

      // Si la pregunta ya existía, conservamos su imagen vieja por defecto
      if (id) {
        const preguntaVieja = evaluacion.preguntas_evaluacion.find(
          (p) => p.id === Number(id),
        );
        imagenFinal = preguntaVieja?.imagen_pregunta || null;
      }

      // Si viene un archivo nuevo para la pregunta, lo subimos y reemplazamos
      if (req.files && Array.isArray(req.files)) {
        const filePregunta = req.files.find(
          (f) => f.fieldname === `imagen_pregunta_${i}`,
        );
        if (filePregunta) {
          imagenFinal = await uploadImage(filePregunta);
          imagenesNuevasSubidas.push(imagenFinal);
        }
      }

      // --- C. Subida de Imágenes para Alternativas ---
      if (tipo_pregunta === 'ALTERNATIVAS' && Array.isArray(respuestas)) {
        for (let j = 0; j < respuestas.length; j++) {
          if (req.files && Array.isArray(req.files)) {
            const fieldNameAlt = `imagen_pregunta_${i}_alternativa_${j}`;
            const fileAlt = req.files.find((f) => f.fieldname === fieldNameAlt);

            if (fileAlt) {
              const imgAltSubida = await uploadImage(fileAlt);
              imagenesNuevasSubidas.push(imgAltSubida);
              // Reemplazamos/Inyectamos la nueva imagen en el JSON (sobrescribe la url vieja si existía)
              respuestas[j].imagen = imgAltSubida;
            }
          }
        }
      }

      // --- D. Validación con Joi ---
      const { error, value: opcionesValidadas } = validarRespuestasJSON(
        tipo_pregunta,
        respuestas,
      );
      if (error) {
        const msg = error.details
          ? error.details.map((e) => e.message).join(', ')
          : error.message;
        throw new AppError(
          `Error estructural en la pregunta ${i + 1}: ${msg}`,
          400,
        );
      }

      // --- E. Consolidación de la Pregunta ---
      preguntasProcesadas.push({
        id: id ? Number(id) : undefined, // Importante para saber si es update o create
        titulo_pregunta,
        descripcion_pregunta,
        tipo_pregunta,
        respuestas: opcionesValidadas,
        imagen_pregunta: imagenFinal,
        evaluacion_id: evaluacion.id,
      });
    }

    // 2. LÓGICA DE DIFF PARA BORRADO DE IMÁGENES
    // Comparamos el estado actual de la BD con el estado final que acabamos de armar
    const imagenesViejas = extraerImagenes(evaluacion.preguntas_evaluacion);
    const imagenesNuevas = extraerImagenes(preguntasProcesadas);

    // Todas las imágenes viejas que ya no estén en el array nuevo, se van a la basura
    imagenesParaBorrar = imagenesViejas.filter(
      (img) => !imagenesNuevas.includes(img),
    );

    // 3. TRANSACCIÓN EN BD
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

      // B. Identificar qué IDs de preguntas se mantienen
      const idsNuevos = preguntasProcesadas
        .filter((p) => p.id)
        .map((p) => p.id);

      // C. Borrar de la BD las preguntas que se eliminaron en el frontend
      await PreguntaEvaluacion.destroy({
        where: {
          evaluacion_id: evaluacion.id,
          id: { [Op.notIn]: idsNuevos },
        },
        transaction: t,
      });

      // D. Upsert manual (Update para las que tienen ID, Create para las nuevas)
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

    // 4. LIMPIEZA DE ARCHIVOS VÍCTIMAS (Solo si la BD guardó todo bien)
    if (imagenesParaBorrar.length > 0) {
      const borradosUnicos = [...new Set(imagenesParaBorrar)];
      borradosUnicos.forEach((img) => deleteImage(img).catch(console.error));
    }

    // 5. RESPUESTA AL CLIENTE
    res.status(200).json({
      status: 'success',
      message: 'Evaluación actualizada correctamente.',
      evaluacion,
    });
  } catch (error) {
    // Si algo falla, hacemos rollback de las imágenes NUEVAS que se alcanzaron a subir hoy
    if (imagenesNuevasSubidas.length > 0) {
      imagenesNuevasSubidas.forEach((img) =>
        deleteImage(img).catch(console.error),
      );
    }

    if (error.isOperational) {
      return next(error);
    }
    return next(new AppError(error.message, 500));
  }
});

export const remove = catchAsync(async (req, res, next) => {
  const { evaluacion } = req;

  // 1. EXTRAER TODAS LAS IMÁGENES (Principal y Alternativas)
  const imagenesABorrar = [];

  evaluacion.preguntas_evaluacion.forEach((p) => {
    // A. Imagen principal de la pregunta
    if (p.imagen_pregunta) {
      imagenesABorrar.push(p.imagen_pregunta);
    }

    // B. Imágenes dentro de las alternativas
    if (p.tipo_pregunta === 'ALTERNATIVAS' && p.respuestas) {
      let resp;
      try {
        resp =
          typeof p.respuestas === 'string'
            ? JSON.parse(p.respuestas)
            : p.respuestas;
      } catch (err) {
        resp = [];
      }

      if (Array.isArray(resp)) {
        resp.forEach((r) => {
          if (r.imagen) {
            imagenesABorrar.push(r.imagen);
          }
        });
      }
    }
  });

  try {
    // 2. TRANSACCIÓN SEGURA EN BASE DE DATOS
    await db.transaction(async (t) => {
      // Usamos un bucle for...of clásico que SÍ respeta el await secuencial,
      // o alternativamente podríamos usar un bulk destroy si tuvieras el modelo importado.
      for (const p of evaluacion.preguntas_evaluacion) {
        await p.destroy({ transaction: t });
      }

      // Finalmente destruimos la evaluación padre
      await evaluacion.destroy({ transaction: t });
    });

    // 3. LIMPIEZA DE ARCHIVOS FÍSICOS EN VPS
    if (imagenesABorrar.length > 0) {
      // Eliminamos posibles duplicados usando Set
      const borradosUnicos = [...new Set(imagenesABorrar)];

      // allSettled es ideal aquí: si una imagen falla al borrarse,
      // no detiene el borrado de las demás ni tumba la respuesta al usuario.
      Promise.allSettled(
        borradosUnicos.map((nombreArchivo) => deleteImage(nombreArchivo)),
      ).catch((err) => console.error('Error general limpiando archivos:', err));
    }

    return res.status(200).json({
      status: 'success',
      message: `La evaluación "${evaluacion.nombre_evaluacion}" y todos sus archivos han sido eliminados permanentemente.`,
    });
  } catch (error) {
    console.error('Error durante la eliminación de la evaluación:', error);
    return next(
      new AppError(
        'No se pudo completar la eliminación. Inténtalo de nuevo.',
        500,
      ),
    );
  }
});
