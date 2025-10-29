const express = require('express');
const { Client, NoAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const logger = require('../utils/logger');

const router = express.Router();

const clientWhatsApp = new Client({
  authStrategy: new NoAuth(),
  puppeteer: {
    //    executablePath: puppeteer.executablePath(),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

let isAuthenticated = false;
let lastQRCode = null; // <--- Guardamos el QR aquí

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

// EVENTOS una sola vez (fuera de los endpoints)
clientWhatsApp.on('authenticated', () => {
  isAuthenticated = true;
  logger.info('✅ Cliente autenticado.');
});

clientWhatsApp.on('ready', () => {
  logger.info('✅ Cliente listo para usar.');
});

clientWhatsApp.on('disconnected', (reason) => {
  console.error('❌ Cliente desconectado:', reason);
  isAuthenticated = false;
});

clientWhatsApp.on('qr', async (qr) => {
  try {
    lastQRCode = await qrcode.toDataURL(qr);
    logger.info('🔁 Nuevo código QR generado.');
  } catch (err) {
    console.error('Error al generar QR:', err);
    lastQRCode = null;
  }
});

// ENDPOINT para obtener el código QR
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

// ENDPOINT para verificar el estado de autenticación
router.get('/check-auth', (req, res) => {
  res.send(
    isAuthenticated
      ? 'El cliente ya está vinculado con WhatsApp.'
      : 'El cliente no está vinculado. Por favor, escanee el código QR.'
  );
});

module.exports = { vincularWspRouter: router, clientWhatsApp };
