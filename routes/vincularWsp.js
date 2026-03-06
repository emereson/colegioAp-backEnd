import express from 'express';
import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import logger from '../utils/logger.js';

const router = express.Router();

export const clientWhatsApp = new Client({
  puppeteer: {
    headless: true,
    executablePath: '/usr/bin/chromium', // 🟢 ESTOS ARGUMENTOS SON OBLIGATORIOS PARA SERVIDORES LINUX / RAILWAY
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // Evita que Chrome colapse por falta de memoria en el servidor
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  },
});

let isAuthenticated = false;
let lastQRCode = null;

// Inicialización única del cliente
const initializeClient = (() => {
  let initialized = false;
  return (req, res, next) => {
    if (!initialized) {
      clientWhatsApp.initialize();
      initialized = true;
      logger.info('Cliente de WhatsApp inicializado.');
    }
    next();
  };
})();

router.use(initializeClient);

// EVENTOS
clientWhatsApp.on('authenticated', () => {
  isAuthenticated = true;
  logger.info('✅ Cliente autenticado.');
});

clientWhatsApp.on('ready', () => {
  logger.info('✅ Cliente listo para usar.');
});

clientWhatsApp.on('disconnected', (reason) => {
  logger.error('❌ Cliente desconectado:', reason);
  isAuthenticated = false;
});

clientWhatsApp.on('qr', async (qr) => {
  try {
    lastQRCode = await qrcode.toDataURL(qr);
    logger.info('🔁 Nuevo código QR generado.');
  } catch (err) {
    logger.error('Error al generar QR:', err);
    lastQRCode = null;
  }
});

// ENDPOINT QR
router.get('/qr', (req, res) => {
  if (isAuthenticated) {
    return res.json({
      status: 'authenticated',
      message: 'El cliente ya está vinculado con WhatsApp.',
    });
  }

  if (lastQRCode) {
    return res.json({
      status: 'pending',
      qrCode: lastQRCode,
    });
  }

  res.status(503).json({
    status: 'waiting',
    message: 'Esperando generación del código QR...',
  });
});

// ENDPOINT estado
router.get('/check-auth', (req, res) => {
  res.send(
    isAuthenticated
      ? 'El cliente ya está vinculado con WhatsApp.'
      : 'El cliente no está vinculado. Por favor, escanee el código QR.',
  );
});

export default router;
