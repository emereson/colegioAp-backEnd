const { Client, NoAuth } = require('whatsapp-web.js');

// Inicializar el cliente de WhatsApp
const clientWhatsApp = new Client({
  authStrategy: new NoAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

clientWhatsApp.on('qr', (qr) => {
  console.log(qr);
});

clientWhatsApp.on('ready', () => {
  console.log('Client is ready!');
});

module.exports = { clientWhatsApp };
