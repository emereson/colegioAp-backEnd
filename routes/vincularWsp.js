const express = require('express');
const pkg = require('whatsapp-web.js');
const puppeteer = require('puppeteer');
const qrcode = require('qrcode');
const clientWhatsApp = require('../utils/whatsapp');

const { Client, NoAuth } = pkg;
const router = express.Router();

// Configuración del cliente de WhatsApp
exports.clientWhatsApp = new Client({
  authStrategy: new NoAuth(),
  puppeteer: {
    executablePath: puppeteer.executablePath(),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

let isAuthenticated = false; // Estado de autenticación

// Middleware para inicializar el cliente solo una vez
const initializeClient = (() => {
  let initialized = false;
  return (req, res, next) => {
    if (!initialized) {
      clientWhatsApp.initialize();
      initialized = true;
      console.log('Cliente de WhatsApp inicializado.');
    }
    next();
  };
})();

router.use(initializeClient);

// Escucha el evento de autenticación
clientWhatsApp.on('authenticated', () => {
  isAuthenticated = true;
  console.log('Autenticación exitosa en WhatsApp.');
});

// Escucha el evento cuando el cliente está listo
clientWhatsApp.on('ready', () => {
  console.log('Cliente de WhatsApp está listo.');
});

// Escucha el evento de desconexión
clientWhatsApp.on('disconnected', (reason) => {
  console.error(`Cliente desconectado: ${reason}`);
  isAuthenticated = false;
});

// Endpoint para escanear el código QR
router.get('/qr', async (req, res) => {
  let responded = false;

  // Genera el código QR si el cliente no está autenticado
  if (!isAuthenticated) {
    clientWhatsApp.on('qr', async (qr) => {
      if (!responded) {
        try {
          const qrCodeHTML = await qrcode.toDataURL(qr);
          res.send(`
            <html>
              <body style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
                <div style="text-align: center;">
                  <h1>Escanea el código QR para vincular WhatsApp</h1>
                  <img src="${qrCodeHTML}" alt="Código QR de WhatsApp" style="margin-top: 20px; width: 200px; height: 200px;"/>
                </div>
              </body>
            </html>
          `);
          responded = true;
        } catch (error) {
          res.status(500).send('Error generando el código QR.');
        }
      }
    });
  } else {
    res.send(`
      <html>
        <body style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
          <div style="text-align: center;">
            <h1>El cliente de WhatsApp ya está vinculado.</h1>
          </div>
        </body>
      </html>
    `);
  }
});

// Endpoint para verificar si el cliente está vinculado
router.get('/check-auth', (req, res) => {
  res.send(
    isAuthenticated
      ? 'El cliente ya está vinculado con WhatsApp.'
      : 'El cliente no está vinculado. Por favor, escanee el código QR.'
  );
});

const vincularWspRouter = router;

module.exports = vincularWspRouter;
