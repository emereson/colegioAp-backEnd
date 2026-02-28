import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({ storage });

export const toUpper = (value) =>
  typeof value === 'string' ? value.toUpperCase() : value;
