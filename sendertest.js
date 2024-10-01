require('dotenv').config();
const nodemailer = require('nodemailer');

// Configuración del transporte de Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true para puerto 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Datos del "lead" que recibirá el correo
const lead = {
  name: "Juan",
  email: "surimanw@gmail.com",
  birthdate: "1990-09-30"  // Fecha de nacimiento (puede ser útil si la manejas luego)
};

// Opciones de correo
const mailOptions = {
  from: `"Felicidades" <felicitaciones@sender.picoai.app>`,
  to: lead.email,
  subject: `¡Feliz Cumpleaños, ${lead.name}!`,
  html: `<h1>¡Feliz Cumpleaños!</h1><p>Te deseamos lo mejor en tu día especial, ${lead.name}.</p>`
};

// Enviar el correo al ejecutar el servidor
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error(`Error al enviar el correo a ${lead.email}:`, error);
  } else {
    console.log(`Correo enviado a ${lead.email}:`, info.response);
  }
});

// Terminar la ejecución después del envío
transporter.close();
