import Joi from 'joi';

// 1. Esquema para "ALTERNATIVAS"
const alternativasSchema = Joi.array()
  .items(
    Joi.object({
      id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      texto: Joi.string().required(),
      esCorrecta: Joi.boolean().required(),
    }),
  )
  .min(2)
  .required();

// 2. Esquema para "POR RELACIONAR"
const relacionarSchema = Joi.object({
  parejas: Joi.array()
    .items(
      Joi.object({
        id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
        premisa: Joi.string().required(),
        respuesta_correcta: Joi.string().required(),
      }),
    )
    .min(2)
    .required(),
  distractores: Joi.array().items(Joi.string()).optional().default([]),
}).required();

// 3. Esquema para "COMPLETAR"
const completarSchema = Joi.object({
  texto_base: Joi.string().required(),
  palabras_disponibles: Joi.array().items(Joi.string()).min(1).required(),
  respuestas_correctas: Joi.object()
    .pattern(
      Joi.string(), // El identificador del hueco (ej. "hueco_1")
      Joi.string(), // La palabra correcta (ej. "enseñanza")
    )
    .required(),
}).required();

/**
 * Validador dinámico para la columna JSON 'respuestas'
 * @param {string} tipo_pregunta - 'ALTERNATIVAS', 'POR RELACIONAR' o 'COMPLETAR'
 * @param {object|string} respuestas - El JSON con la configuración de respuestas
 * @returns {object} { error, value }
 */
export const validarRespuestasJSON = (tipo_pregunta, respuestas) => {
  let respuestasObj = respuestas;

  // 1. Parsear si viene como string (común en FormData)
  if (typeof respuestas === 'string') {
    try {
      respuestasObj = JSON.parse(respuestas);
    } catch (err) {
      return {
        error: { message: 'El formato de respuestas no es un JSON válido.' },
        value: null,
      };
    }
  }

  // 2. Normalización de Datos (Frontend fix)
  // Si es ALTERNATIVAS y viene como objeto { "0": {...}, "1": {...} }, lo convertimos a Array []
  if (
    tipo_pregunta === 'ALTERNATIVAS' &&
    respuestasObj !== null &&
    typeof respuestasObj === 'object' &&
    !Array.isArray(respuestasObj)
  ) {
    respuestasObj = Object.values(respuestasObj);
  }

  // 3. Selección de Esquema y Validación
  switch (tipo_pregunta) {
    case 'ALTERNATIVAS':
      return alternativasSchema.validate(respuestasObj, {
        abortEarly: false,
        stripUnknown: true,
      });

    case 'POR RELACIONAR':
      return relacionarSchema.validate(respuestasObj, {
        abortEarly: false,
        stripUnknown: true,
      });

    case 'COMPLETAR':
      return completarSchema.validate(respuestasObj, {
        abortEarly: false,
        stripUnknown: true,
      });

    default:
      return {
        error: {
          message: `El tipo de pregunta "${tipo_pregunta}" no es reconocido por el validador.`,
        },
        value: null,
      };
  }
};
