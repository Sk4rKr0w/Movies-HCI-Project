// back-end/config/mail.js
const nodemailer = require('nodemailer');

// Questa funzione restituisce un transporter configurato su Ethereal
async function createTestTransporter() {
  // crea un account di test automatico (Ethereal)
  const testAccount = await nodemailer.createTestAccount();

  // configura il transporter con i dati di Ethereal
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure, // true per 465, false per altri
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

module.exports = { createTestTransporter };
