import Joi from 'joi';

const noteSchema = Joi.object({
  title: Joi.string().required(),
});

export const validateNote = (note) => {
  return noteSchema.validate(note, { abortEarly: true });
};
