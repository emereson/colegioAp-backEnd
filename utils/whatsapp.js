const { Client, NoAuth } = require('whatsapp-web.js');

// Inicializar el cliente de WhatsApp
const clientWhatsApp = new Client({
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
  authStrategy: new NoAuth(),
  webVersionCache: {
    type: 'remote',
    remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html`,
  },
});

clientWhatsApp.on('qr', (qr) => {
  console.log(qr);
});

clientWhatsApp.on('ready', () => {
  console.log('Client is ready!');
});

module.exports = { clientWhatsApp };
