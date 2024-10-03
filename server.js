require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const path = require('path');
const multer = require('multer');
const fs = require('fs/promises'); // Asegúrate de importar solo 'fs/promises'
const upload = multer({ dest: 'uploads/' });

// Configurar Express
const app = express();
app.use(express.json());
app.use(express.static('dist'));  // Sirve el frontend desde dist
app.set('view engine', 'ejs');


const customHtmlWelcome = path.join(__dirname, 'custom', 'welcome-letter.html');
const customHtmlBefore = path.join(__dirname, 'custom', 'before-letter.html');
const customHtmlBirthday = path.join(__dirname, 'custom', 'birthday-letter.html');

// Servir archivos estáticos desde el directorio "public"
app.use(express.static(path.join(__dirname, 'public')));



// Ruta para renderizar el formulario inicial
app.get('/edit-bienvenido', (req, res) => {
  res.render('welcome-letter');
});

// Ruta para renderizar el formulario inicial
app.get('/edit-recordatorio', (req, res) => {
  res.render('welcome-letter');
});

app.get('/edit-feliz-cumple', (req, res) => {
  res.render('birthday-letter');
});


app.get('/load-birthday-html', async (req, res) => {
  try {
    const customHtml = await fs.readFile(customHtmlBirthday, 'utf8');
    res.send(customHtml);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar el HTML personalizado.');
  }
});

// Ruta para guardar el HTML personalizado
app.post('/save-birthday-html', async (req, res) => {
  const { htmlContent } = req.body;

  try {
    await fs.writeFile(customHtmlBirthday, htmlContent);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al guardar el HTML personalizado:', error);
    res.sendStatus(500);
  }
});


app.get('/load-before-html', async (req, res) => {
  try {
    const customHtml = await fs.readFile(customHtmlBefore, 'utf8');
    res.send(customHtml);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar el HTML personalizado.');
  }
});

// Ruta para guardar el HTML personalizado
app.post('/save-before-html', async (req, res) => {
  const { htmlContent } = req.body;

  try {
    await fs.writeFile(customHtmlBefore, htmlContent);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al guardar el HTML personalizado:', error);
    res.sendStatus(500);
  }
});

// Ruta para cargar el HTML personalizado
app.get('/load-welcome-html', async (req, res) => {
  try {
    const customHtml = await fs.readFile(customHtmlWelcome, 'utf8');
    res.send(customHtml);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar el HTML personalizado.');
  }
});

// Ruta para guardar el HTML personalizado
app.post('/save-welcome-html', async (req, res) => {
  const { htmlContent } = req.body;

  try {
    await fs.writeFile(customHtmlWelcome, htmlContent);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al guardar el HTML personalizado:', error);
    res.sendStatus(500);
  }
});

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
  accept: Boolean,
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


// Definir esquema de MongoDB para almacenar datos de Wi-Fi
const wifiSchema = new mongoose.Schema({
  networkName: String,
  wifiPassword: String,
  createdAt: { type: Date, default: Date.now }
});

const Wifi = mongoose.model('Wifi', wifiSchema);

// Ruta para guardar o actualizar los datos de Wi-Fi
app.post('/api/wifi', async (req, res) => {
  const { networkName, wifiPassword } = req.body;

  if (!networkName || !wifiPassword) {
      return res.status(400).json({ message: 'Faltan datos' });
  }

  try {
      // Buscar un documento existente
      let wifi = await Wifi.findOne(); // Encuentra el primer documento, si existe

      if (wifi) {
          // Si ya existe, actualiza el documento
          wifi.networkName = networkName;
          wifi.wifiPassword = wifiPassword;
          await wifi.save(); // Guardar cambios
          res.status(200).json({ message: 'Datos de Wi-Fi actualizados correctamente' });
      } else {
          // Si no existe, crea un nuevo documento
          wifi = new Wifi({ networkName, wifiPassword });
          await wifi.save(); // Guardar en la base de datos
          res.status(201).json({ message: 'Datos de Wi-Fi guardados correctamente' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Error al guardar los datos de Wi-Fi.', error });
  }
});

// Ruta para recibir leads
app.post('/api/leads', async (req, res) => {
  const { name, email, birthdate, accept } = req.body;

  try {
    const lead = new Lead({ name, email, birthdate, accept });
    await lead.save();

    // Programar envío de correo para la fecha de cumpleaños
    scheduleBirthdayEmail(lead);
    setTimeout(() => {
      sendNotyEmail(lead);
    }, 3000);
    // sendNotyEmail(lead);
console.log(lead)
    res.status(200).send({ message: 'Lead guardado exitosamente.' });
  } catch (error) {
    res.status(500).send({ message: 'Error al guardar el lead.', error });
  }
});

// Ruta para obtener los datos de Wi-Fi
app.get('/api/wifi', async (req, res) => {
  try {
      const wifiData = await Wifi.findOne(); // Obtiene el primer documento de Wi-Fi
      if (!wifiData) {
          return res.status(404).json({ message: 'No se encontraron datos de Wi-Fi.' });
      }
      res.json(wifiData); // Devuelve los datos de Wi-Fi
  } catch (error) {
      res.status(500).json({ message: 'Error al obtener los datos de Wi-Fi.', error });
  }
});


// Enviar correo al cargar nuevo lead
async function sendNotyEmail(lead) {
  try {
    // Lee el contenido del archivo HTML
    const customHtmlContent = await fs.readFile(customHtmlWelcome, 'utf8');

    await transporter.sendMail({
      from: `"Bienvenido a Florinda Coffee House" <felicitaciones@sender.picoai.app>`,
      to: lead.email,
      subject: `Gracias por tu visita ${lead.name}!`,
      html: customHtmlContent // Envía el contenido HTML leído
    });

    console.log(`Correo de BIENVENIDA enviado a ${lead.email}`);
  } catch (error) {
    console.error(`Error al enviar el correo de cumpleaños a ${lead.email}:`, error);
  }
}


// Función para programar el envío de correos en la fecha de cumpleaños
// Función para programar el envío de correos en la fecha de cumpleaños y 5 días antes
function scheduleBirthdayEmail(lead) {
  const birthdate = new Date(lead.birthdate);
  const today = new Date();
  
  // Asegurarse de que sea el cumpleaños de este año
  birthdate.setFullYear(today.getFullYear());

  // Si ya pasó el cumpleaños este año, programar para el próximo año
  if (birthdate < today) {
    birthdate.setFullYear(today.getFullYear() + 1);
  }

  // Establecer la hora predeterminada para el envío del correo, por ejemplo, 9:00 AM
  birthdate.setHours(10, 0, 0, 0);  // 10:00 AM

  // Enviar el correo de cumpleaños
  console.log('Correo de Cumpleaños programado para', lead.email, 'en', birthdate);
  const jobBirthday = schedule.scheduleJob(birthdate, async () => {
    try {
      const customHtmlContent = await fs.readFile(customHtmlBirthday, 'utf8');
      await transporter.sendMail({
        from: `"Feliz Cumpleaños!" <felicitaciones@sender.picoai.app>`,
        to: lead.email,
        subject: `Florinda Coffee House`,
        html: customHtmlContent
      });

      console.log(`Correo de Cumpleaños enviado a ${lead.email}`);
    } catch (error) {
      console.error(`Error al enviar el correo de cumpleaños a ${lead.email}:`, error);
    }
  });

  // Programar el envío de un correo 5 días antes del cumpleaños
  const reminderDate = new Date(birthdate);
  reminderDate.setDate(birthdate.getDate() - 5);  // 5 días antes del cumpleaños
  console.log('Correo de Recordatorio programado para', lead.email, 'en', reminderDate);
  
  const jobReminder = schedule.scheduleJob(reminderDate, async () => {
    try {
      const customHtmlBefore = await fs.readFile(customHtmlBefore, 'utf8');
      await transporter.sendMail({
        from: `"Recordatorio de Cumpleaños" <recordatorio@sender.picoai.app>`,
        to: lead.email,
        subject: `Florinda Coffee House - ¡Pronto es tu cumpleaños!`,
        html: customHtmlBefore
      });

      console.log(`Correo de Recordatorio enviado a ${lead.email}`);
    } catch (error) {
      console.error(`Error al enviar el correo de recordatorio a ${lead.email}:`, error);
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
      // console.log(leads)
  
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
