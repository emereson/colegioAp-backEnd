const { Client, NoAuth } = require('whatsapp-web.js');

// Inicializar el cliente de WhatsApp
const clientWhatsApp = new Client({
  authStrategy: new NoAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
  webVersionCache: {
    type: 'remote',
    remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1014631230-alpha.html`,
  },
});

clientWhatsApp.on('qr', (qr) => {
  console.log(qr);
});

clientWhatsApp.on('ready', () => {
  console.log('Client is ready!');
});

module.exports = { clientWhatsApp };
