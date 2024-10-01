require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const schedule = require('node-schedule'); // Para programar tareas

// Configurar Express
const app = express();
app.use(express.json());
app.use(express.static('dist'));  // Sirve el frontend desde dist

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Conectado a MongoDB"))
.catch(err => console.log(err));

// Definir esquema de MongoDB para almacenar leads
const leadSchema = new mongoose.Schema({
  name: String,
  email: String,
  birthdate: Date,
  createdAt: { type: Date, default: Date.now }
});

const Lead = mongoose.model('Lead', leadSchema);

// Configurar Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Ruta para recibir leads
app.post('/api/leads', async (req, res) => {
  const { name, email, birthdate } = req.body;

  try {
    const lead = new Lead({ name, email, birthdate });
    await lead.save();

    // Programar envío de correo para la fecha de cumpleaños
    scheduleBirthdayEmail(lead);
console.log(lead)
    res.status(200).send({ message: 'Lead guardado exitosamente.' });
  } catch (error) {
    res.status(500).send({ message: 'Error al guardar el lead.', error });
  }
});

// Función para programar el envío de correos en la fecha de cumpleaños
function scheduleBirthdayEmail(lead) {
  const birthdate = new Date(lead.birthdate);
  const today = new Date();
  birthdate.setFullYear(today.getFullYear());  // Asegurarse de que sea el cumpleaños de este año

  if (birthdate < today) {
    birthdate.setFullYear(today.getFullYear() + 1);  // Si ya pasó, se programa para el próximo año
  }

  const job = schedule.scheduleJob(birthdate, async () => {
    try {
      await transporter.sendMail({
        from: `"Felicidades" <felicitaciones@sender.picoai.app>`,
        to: lead.email,
        subject: `¡Feliz Cumpleaños, ${lead.name}!`,
        html: `<h1>¡Feliz Cumpleaños!</h1><p>Te deseamos lo mejor en tu día especial, ${lead.name}.</p>`
      });

      console.log(`Correo de cumpleaños enviado a ${lead.email}`);
    } catch (error) {
      console.error(`Error al enviar el correo de cumpleaños a ${lead.email}:`, error);
    }
  });
}

// Puerto
const PORT = process.env.PORT || 3535;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
