import PreguntaEvaluacion from '../preguntasEvaluacion/preguntaEvaluacion.model.js';
import SemanaEvaluacion from '../semanaEvaluacion/semanaEvaluacion.model.js';
import catchAsync from '../../../utils/catchAsync.js';
import ResultadosEvaluacion from '../resultadosEvaluacion/resultadosEvaluacion.model.js';
import Evaluaciones from '../evaluacion/evaluacion.model.js';
import { Op } from 'sequelize';

export const getExamsByWeek = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { id } = req.params; // ID del Aula

  const semanas = await SemanaEvaluacion.findAll({
    // where: { aula_id: id },
    include: [
      {
        model: Evaluaciones,
        as: 'evaluaciones',
        include: [
          {
            required: false,
            model: ResultadosEvaluacion,
            as: 'resultados_evaluacion',
            where: { estudiante_id: sessionUser.id },
            attributes: ['id', 'estado', 'nota_final', 'puntaje_obtenido'],
          },
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  if (!semanas || semanas.length === 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'No se encontraron semanas con evaluaciones activas.',
    });
  }

  // 🗑️ Toda la lógica de limpieza de respuestas fue eliminada porque
  // ya no traemos las preguntas en esta ruta.

  return res.status(200).json({
    status: 'Success',
    semanas, // Enviamos las semanas directamente
  });
});

export const getExam = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const evaluacion = await Evaluaciones.findOne({
    where: { id: id },
    include: [
      {
        model: PreguntaEvaluacion,
        as: 'preguntas_evaluacion',
      },
      {
        model: SemanaEvaluacion,
        as: 'semana_evaluacion',
      },
    ],
  });

  if (!evaluacion) {
    return res.status(404).json({
      status: 'fail',
      message: 'No se encontró la evaluación solicitada.',
    });
  }

  const examJSON = evaluacion.toJSON();

  // 1. MEZCLAR LAS PREGUNTAS ALEATORIAMENTE (Algoritmo Fisher-Yates)
  let preguntasAleatorias = examJSON.preguntas_evaluacion;
  for (let i = preguntasAleatorias.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [preguntasAleatorias[i], preguntasAleatorias[j]] = [
      preguntasAleatorias[j],
      preguntasAleatorias[i],
    ];
  }

  // 2. LIMITAR A "preguntas_disponibles"
  const limite = examJSON.preguntas_disponibles;
  preguntasAleatorias = preguntasAleatorias.slice(0, limite);

  // 3. LIMPIEZA DE RESPUESTAS (Con corrección para POR RELACIONAR)
  preguntasAleatorias.forEach((pregunta) => {
    if (pregunta.tipo_pregunta === 'ALTERNATIVAS') {
      // De paso, mezclamos las alternativas para que la A, B, C no siempre estén en el mismo orden
      pregunta.respuestas.sort(() => Math.random() - 0.5);
      pregunta.respuestas.forEach((r) => delete r.esCorrecta);
    } else if (pregunta.tipo_pregunta === 'POR RELACIONAR') {
      // Arreglo: Juntamos las respuestas correctas con los distractores para el frontend
      let opcionesMezcladas = [...(pregunta.respuestas.distractores || [])];

      pregunta.respuestas.parejas.forEach((p) => {
        if (p.respuesta_correcta) opcionesMezcladas.push(p.respuesta_correcta);
        delete p.respuesta_correcta; // Ocultamos la respuesta de la pareja
      });

      // Sobrescribimos "distractores" con TODAS las opciones mezcladas
      pregunta.respuestas.distractores = opcionesMezcladas.sort(
        () => Math.random() - 0.5,
      );
    } else if (pregunta.tipo_pregunta === 'COMPLETAR') {
      delete pregunta.respuestas.respuestas_correctas;
    }
  });

  // 4. REASIGNAR EL ARREGLO FINAL AL JSON
  examJSON.preguntas_evaluacion = preguntasAleatorias;

  return res.status(200).json({
    status: 'Success',
    evaluacion: examJSON,
  });
});

export const validExistResultado = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { id } = req.params;

  const resultadoPrevio = await ResultadosEvaluacion.findOne({
    where: {
      evaluacion_id: id,
      estudiante_id: sessionUser.id,
    },
  });

  if (!resultadoPrevio) {
    return res.status(200).json({
      status: 'Success',
      resultadoPrevio: null,
    });
  }

  // Si está en proceso validamos tiempo
  if (resultadoPrevio.estado === 'EN PROCESO') {
    const ahora = new Date();
    const fin = new Date(resultadoPrevio.fin_evaluacion);

    // Si ya pasó el tiempo límite
    if (ahora > fin) {
      resultadoPrevio.estado = 'EXEDIO LIMITE DE TIEMPO';
      resultadoPrevio.completado = true;

      await resultadoPrevio.save();
    }
  }

  return res.status(200).json({
    status: 'Success',
    resultadoPrevio,
  });
});
export const startExam = catchAsync(async (req, res, next) => {
  const { sessionUser, evaluacion } = req;
  const { aula_id } = req.body;

  // 2. Verificamos si el alumno ya inició este examen antes
  const intentoPrevio = await ResultadosEvaluacion.findOne({
    where: { evaluacion_id: evaluacion.id, estudiante_id: sessionUser.id },
  });

  if (intentoPrevio) {
    return res.status(200).json({
      status: 'Success',
      message: 'Examen ya en progreso',
      resultado: intentoPrevio,
    });
  }

  const fechaInicio = new Date();
  const fechaFin = new Date(
    fechaInicio.getTime() + evaluacion.limite_tiempo * 60000,
  );

  // 4. Creamos el registro "EN PROCESO"
  const nuevoResultado = await ResultadosEvaluacion.create({
    evaluacion_id: evaluacion.id,
    estudiante_id: sessionUser.id,
    aula_id,
    puntaje_obtenido: 0,
    respuestas_enviadas: {},
    inicio_evaluacion: fechaInicio,
    fin_evaluacion: fechaFin,
    estado: 'EN PROCESO',
    completado: false,
  });

  return res.status(201).json({
    status: 'Success',
    resultado: nuevoResultado,
  });
});

export const submitExam = catchAsync(async (req, res, next) => {
  const { resultadoPrevio } = req;
  const { respuestasAlumno } = req.body;

  if (resultadoPrevio.estado !== 'EN PROCESO') {
    return res.status(400).json({
      message: 'Este examen ya fue enviado o calificado anteriormente.',
    });
  }

  const ahora = new Date();
  let estadoFinal = 'CULMINADO';

  // Agregamos 15 segundos de gracia por si hay lag en la red al enviar
  const finMasGracia = new Date(
    resultadoPrevio.fin_evaluacion.getTime() + 15000,
  );

  if (ahora > finMasGracia) {
    estadoFinal = 'EXEDIO LIMITE DE TIEMPO';
  }

  // 2. Traemos el examen para calificar
  const examen = await Evaluaciones.findByPk(resultadoPrevio.evaluacion_id, {
    include: [{ model: PreguntaEvaluacion, as: 'preguntas_evaluacion' }],
  });

  let puntajeTotal = 0;

  // 🟢 LA CLAVE ESTÁ AQUÍ: Dividimos los puntos entre las preguntas_disponibles
  const puntosPorPregunta = examen.puntos / examen.preguntas_disponibles;

  examen.preguntas_evaluacion.forEach((pregunta) => {
    const respuestaEnviada = respuestasAlumno[pregunta.id];
    if (!respuestaEnviada) return;

    let esCorrecta = false;

    switch (pregunta.tipo_pregunta) {
      case 'ALTERNATIVAS':
        const opcionCorrecta = pregunta.respuestas.find((r) => r.esCorrecta);
        esCorrecta = String(opcionCorrecta?.id) === String(respuestaEnviada);
        break;

      case 'POR RELACIONAR':
        const dataRelacion = pregunta.respuestas;
        let parejasCorrectas = 0;
        dataRelacion.parejas.forEach((p) => {
          if (respuestaEnviada[p.id] === p.respuesta_correcta)
            parejasCorrectas++;
        });
        esCorrecta = parejasCorrectas === dataRelacion.parejas.length;
        break;

      case 'COMPLETAR':
        const dataCompletar = pregunta.respuestas;
        let huecosCorrectos = 0;
        const totalHuecos = Object.keys(
          dataCompletar.respuestas_correctas,
        ).length;
        Object.keys(dataCompletar.respuestas_correctas).forEach((hueco) => {
          if (
            respuestaEnviada[hueco]?.trim().toLowerCase() ===
            dataCompletar.respuestas_correctas[hueco].trim().toLowerCase()
          ) {
            huecosCorrectos++;
          }
        });
        esCorrecta = huecosCorrectos === totalHuecos;
        break;
    }

    if (esCorrecta) puntajeTotal += puntosPorPregunta;
  });

  // 3. ACTUALIZAMOS el resultado existente
  await resultadoPrevio.update({
    puntaje_obtenido: parseFloat(puntajeTotal.toFixed(2)), // Maneja decimales por si acaso
    nota_final: Math.round(puntajeTotal), // Asumiendo que tu columna nota_final es entera
    respuestas_enviadas: respuestasAlumno,
    estado: estadoFinal,
    completado: true,
  });

  return res.status(200).json({
    status: 'Success',
    nota: Math.round(puntajeTotal),
    resultado: resultadoPrevio,
  });
});

export const getExamReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { sessionUser } = req;

  // 1. Buscamos el resultado del alumno
  const resultado = await ResultadosEvaluacion.findOne({
    where: { evaluacion_id: id, estudiante_id: sessionUser.id },
  });

  if (!resultado) {
    return res.status(404).json({
      status: 'fail',
      message: 'No se encontraron resultados para esta evaluación.',
    });
  }

  const respuestasAlumno = resultado.respuestas_enviadas || {};

  // ================= 2. FILTRO INTELIGENTE DE IDs =================
  // Extraemos solo los IDs de las preguntas que realmente fueron respondidas
  const questionIds = Object.keys(respuestasAlumno).filter((key) => {
    const respuesta = respuestasAlumno[key];

    // Descartar null, undefined o strings vacíos
    if (respuesta === null || respuesta === undefined || respuesta === '') {
      return false;
    }

    // Si es un Array (ej: [null, "Word", null...]), validar que tenga al menos un dato real
    if (Array.isArray(respuesta)) {
      return respuesta.some(
        (item) => item !== null && item !== undefined && item !== '',
      );
    }

    // Si es un Objeto (ej: {} o { hueco_1: 'texto' }), validar que no esté vacío
    if (typeof respuesta === 'object') {
      return Object.keys(respuesta).length > 0;
    }

    // Si es un valor simple (string, número), es válido
    return true;
  });
  // ================================================================

  // 3. Traemos la evaluación filtrando solo las preguntas respondidas
  const evaluacion = await Evaluaciones.findOne({
    where: { id: id },
    include: [
      {
        model: SemanaEvaluacion,
        as: 'semana_evaluacion',
      },
      {
        model: PreguntaEvaluacion,
        as: 'preguntas_evaluacion',
        // Usamos [Op.in] para buscar múltiples IDs correctamente
        where:
          questionIds.length > 0
            ? { id: { [Op.in]: questionIds } }
            : { id: null },
        required: false,
      },
    ],
  });

  if (!evaluacion) {
    return res.status(404).json({ message: 'No se encontró la evaluación.' });
  }

  const examJSON = evaluacion.toJSON();

  // 4. LÓGICA ESTRICTA: Ocultar respuesta correcta si se equivocó
  examJSON.preguntas_evaluacion.forEach((pregunta) => {
    const respuestaEnviada = respuestasAlumno[pregunta.id];
    let esCorrecta = false;

    // Evaluamos si el alumno acertó
    if (respuestaEnviada) {
      switch (pregunta.tipo_pregunta) {
        case 'ALTERNATIVAS':
          const opcionCorrecta = pregunta.respuestas.find((r) => r.esCorrecta);
          esCorrecta = String(opcionCorrecta?.id) === String(respuestaEnviada);
          break;

        case 'POR RELACIONAR':
          const dataRelacion = pregunta.respuestas;
          let parejasCorrectas = 0;
          dataRelacion.parejas.forEach((p) => {
            if (respuestaEnviada[p.id] === p.respuesta_correcta) {
              parejasCorrectas++;
            }
          });
          esCorrecta = parejasCorrectas === dataRelacion.parejas.length;
          break;

        case 'COMPLETAR':
          const dataCompletar = pregunta.respuestas;
          let huecosCorrectos = 0;
          const totalHuecos = Object.keys(
            dataCompletar.respuestas_correctas,
          ).length;
          Object.keys(dataCompletar.respuestas_correctas).forEach((hueco) => {
            if (
              respuestaEnviada[hueco]?.trim().toLowerCase() ===
              dataCompletar.respuestas_correctas[hueco].trim().toLowerCase()
            ) {
              huecosCorrectos++;
            }
          });
          esCorrecta = huecosCorrectos === totalHuecos;
          break;
      }
    }

    // 🟢 Le pasamos al frontend si acertó o no
    pregunta.acertada = esCorrecta;

    // 🔴 SI SE EQUIVOCÓ (o no respondió), ELIMINAMOS LA RESPUESTA CORRECTA DEL JSON
    if (!esCorrecta) {
      if (pregunta.tipo_pregunta === 'ALTERNATIVAS') {
        pregunta.respuestas.forEach((r) => delete r.esCorrecta);
      } else if (pregunta.tipo_pregunta === 'POR RELACIONAR') {
        pregunta.respuestas.parejas.forEach((p) => delete p.respuesta_correcta);
      } else if (pregunta.tipo_pregunta === 'COMPLETAR') {
        delete pregunta.respuestas.respuestas_correctas;
      }
    }
  });

  return res.status(200).json({
    status: 'Success',
    resultado: resultado,
    evaluacion: examJSON,
  });
});
