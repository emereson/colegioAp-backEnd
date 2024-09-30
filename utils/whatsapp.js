const { Client, NoAuth } = require('whatsapp-web.js');
const puppeteer = require('puppeteer');

const clientWhatsApp = new Client({
  authStrategy: new NoAuth(),
  puppeteer: {
    executablePath: puppeteer.executablePath(), // Usar el ejecutable integrado
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

const obtenerQR = () => {
  clientWhatsApp.on('qr', (qr) => {
    console.log(qr);
  });
};
clientWhatsApp.on('ready', () => {
  console.log('Client is ready!');
});

obtenerQR();

// Ejecutar la función cada 6 horas (21,600,000 ms)
setInterval(() => {
  obtenerQR();
}, 42600000);

module.exports = { clientWhatsApp };
