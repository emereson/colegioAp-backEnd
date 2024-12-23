const pkg = require('whatsapp-web.js'); // Importa el módulo completo
const puppeteer = require('puppeteer');

// Extrae Client y NoAuth desde el objeto importado
const { Client, NoAuth } = pkg;

const clientWhatsApp = new Client({
  authStrategy: new NoAuth(),
  puppeteer: {
    executablePath: puppeteer.executablePath(),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

module.exports = clientWhatsApp;
