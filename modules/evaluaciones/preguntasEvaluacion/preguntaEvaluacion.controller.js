import catchAsync from '../../../utils/catchAsync.js';
import { uploadImage } from '../../../utils/serverImage.js';
import PreguntaEvaluacion from './preguntaEvaluacion.model.js';
import { validarRespuestasJSON } from './preguntaEvaluacion.validator.js';

export const findAll = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const preguntaEvaluaciones = await PreguntaEvaluacion.findAll({
    semana_id: id,
  });

  return res.status(200).json({
    status: 'Success',
    results: preguntaEvaluaciones.length,
    preguntaEvaluaciones,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { preguntaEvaluacion } = req;

  return res.status(200).json({
    status: 'Success',
    preguntaEvaluacion,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { evaluacion } = req;
  const { titulo_pregunta, tipo_pregunta, respuestas } = req.body;

  const { error, value: opcionesValidadas } = validarRespuestasJSON(
    tipo_pregunta,
    respuestas,
  );

  if (error) {
    const mensajesError = error.details
      ? error.details.map((e) => e.message).join(', ')
      : error.message;
    return next(
      new AppError(`Estructura de respuestas inválida: ${mensajesError}`, 400),
    );
  }

  const file = req.file;
  let imagen_pregunta = null;

  if (file) {
    imagen_pregunta = await uploadImage(file);
  }

  const preguntaEvaluacion = await PreguntaEvaluacion.create({
    evaluacion_id: evaluacion.id,
    titulo_pregunta,
    imagen_pregunta,
    tipo_pregunta,
    respuestas: opcionesValidadas,
  });

  res.status(201).json({
    status: 'success',
    message: '¡La pregunta se ha creado exitosamente!',
    preguntaEvaluacion,
  });
});

export const update = catchAsync(async (req, res, next) => {
  const { preguntaEvaluacion } = req;
  const { titulo_pregunta, tipo_pregunta, respuestas } = req.body;

  const { error, value: opcionesValidadas } = validarRespuestasJSON(
    tipo_pregunta,
    respuestas,
  );

  if (error) {
    const mensajesError = error.details
      ? error.details.map((e) => e.message).join(', ')
      : error.message;
    return next(
      new AppError(`Estructura de respuestas inválida: ${mensajesError}`, 400),
    );
  }

  const file = req.file;
  let nuevaImagen = preguntaEvaluacion.imagen_pregunta;
  let imagenViejaParaBorrar = null;

  if (file) {
    nuevaImagen = await uploadImage(file);

    if (preguntaEvaluacion.imagen_pregunta) {
      imagenViejaParaBorrar = preguntaEvaluacion.imagen_pregunta;
    }
  }

  await preguntaEvaluacion.update({
    titulo_pregunta,
    imagen_pregunta: nuevaImagen,
    tipo_pregunta,
    respuestas: opcionesValidadas,
  });

  if (imagenViejaParaBorrar) {
    await deleteImage(imagenViejaParaBorrar);
  }

  res.status(200).json({
    status: 'success',
    message: '¡La pregunta se ha actualizado exitosamente!',
    preguntaEvaluacion,
  });
});

export const remove = catchAsync(async (req, res) => {
  const { evaluacion } = req;

  await evaluacion.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The evaluacion with id: ${evaluacion.id} has been deleted`,
    evaluacion,
  });
});
