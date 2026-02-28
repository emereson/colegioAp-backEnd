import axios from 'axios';
import FormData from 'form-data';
import logger from './logger.js';
import AppError from './AppError.js';

export const uploadImage = async (file) => {
  const formData = new FormData();

  formData.append('imagen', file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });
  formData.append('imagen2', 'dato_extra');

  const uploadUrl = `${process.env.SERVER_IMAGE}/api/upload`;

  try {
    const formHeaders = formData.getHeaders();

    const browserHeaders = {
      ...formHeaders,
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Origin: process.env.SERVER_IMAGE,
      Referer: `${process.env.SERVER_IMAGE}/`,
    };

    const { data } = await axios.post(uploadUrl, formData, {
      headers: browserHeaders,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (!data.filename) {
      throw new AppError('La respuesta del servidor no incluyó filename.', 502);
    }

    logger.info('Archivo subido a Laravel con éxito:', data.filename);
    return data.filename;
  } catch (error) {
    const status = error.response?.status || 500;
    const dataError = error.response?.data || error.message;

    const msg =
      typeof dataError === 'string' && dataError.includes('<!DOCTYPE html>')
        ? 'Bloqueo WAF/Firewall (406/403)'
        : dataError.message || 'Error desconocido';

    logger.error(`Error subiendo imagen (${status}):`, msg);

    throw new AppError(`Error al subir imagen: ${msg}`, status);
  }
};

export const deleteImage = async (filename) => {
  if (!filename) return;

  const deleteUrl = `${process.env.SERVER_IMAGE}/api/delete-image/${filename}`;
  logger.info(`Intentando eliminar archivo huérfano de Laravel: ${filename}`);

  try {
    await axios.delete(deleteUrl);
    logger.info(`Archivo huérfano ${filename} eliminado con éxito de Laravel.`);
  } catch (error) {
    logger.error(
      `Error al intentar eliminar archivo huérfano ${filename} de Laravel:`,
      error.response?.data || error.message,
    );
  }
};
