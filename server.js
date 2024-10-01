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
    
    // Asegurarse de que sea el cumpleaños de este año
    birthdate.setFullYear(today.getFullYear());
  
    // Si ya pasó el cumpleaños este año, programar para el próximo año
    // if (birthdate < today) {
    //   birthdate.setFullYear(today.getFullYear() + 1);
    // }
  
    // Establecer la hora predeterminada para el envío del correo, por ejemplo, 9:00 AM
    birthdate.setHours(12, 35, 0, 0);  // 9:00 AM, 0 minutos, 0 segundos, 0 milisegundos
  
    // Programar la tarea de envío de correo
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
  

// Ruta para obtener todos los leads guardados
app.get('/api/leads', async (req, res) => {
    try {
      const leads = await Lead.find(); // Obtener todos los leads de MongoDB
      res.json(leads); // Enviar los leads como respuesta
    } catch (error) {
      res.status(500).send({ message: "Error al obtener los leads.", error });
    }
  });

  // Función para reprogramar los correos de cumpleaños al reiniciar el servidor
async function reprogramarCumpleaños() {
    try {
      const leads = await Lead.find();  // Obtener todos los leads
  
      leads.forEach(lead => {
        const birthdate = new Date(lead.birthdate);
        const today = new Date();
        birthdate.setFullYear(today.getFullYear());
  
        if (birthdate >= today) {
          // Si el cumpleaños es hoy o en el futuro, reprograma el correo
          scheduleBirthdayEmail(lead);
        } else {
          // Si el cumpleaños ya pasó este año, programa para el próximo año
          birthdate.setFullYear(today.getFullYear() + 1);
          scheduleBirthdayEmail(lead);
        }
      });
      console.log(leads)
  
      console.log('Cumpleaños reprogramados.');
    } catch (error) {
      console.error('Error al reprogramar los cumpleaños:', error);
    }
  }
  reprogramarCumpleaños();

// Puerto
const PORT = process.env.PORT || 3535;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
