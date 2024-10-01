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

// Enviar correo al cargar nuevo lead
async function sendNotyEmail(lead) {

    try {
      await transporter.sendMail({
        from: `"Bienvenido a Florinda Coffee House" <felicitaciones@sender.picoai.app>`,
        to: lead.email,
        subject: `Gracias por tu visita ${lead.name}!`,
        html: `
        <div
  style="color:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';line-height:18px">
  <div>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" height="100%" bgcolor="#f9f9f9">
      <tbody>
        <tr>
          <td>
            <div style="margin:0 auto;max-width:600px;padding:20px 10px">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" height="100%">
                <tbody>
                  <tr>
                    <td>
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tbody>
                          <tr>
                            <td>
                              <a href="#" title="Florinda Coffee"
                                style="color:#ff6154!important;display:block;text-align:left!important;text-decoration:none"
                                target="_blank">
                                🎉
                                <span
                                  style="color:#ff6154;font-family:'Helvetica Neue',Helvetica,Arial,'Lucida Grande',sans-serif;font-size:23px;font-weight:500;line-height:33px;margin-left:5px;vertical-align:top">FlorindaCoffee</span>
                                  🎉
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td height="20"></td>
                  </tr>
                  <tr>
                    <td>
                      <div style="background-color:#fff;border-radius:3px;margin-bottom:20px;padding:20px">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#ffffff">
                          <tbody>
                            <tr>
                              <td style="font-size:16px;line-height:23px">
                                <p style="margin:0px">
                                  <strong><a href="#" style="color:#ff6154!important;text-decoration:none"
                                      target="_blank">¡Bienvenido a Florinda! 🌟</a></strong>
                                  Nos alegra mucho tenerte con nosotros. En Florinda, no solo servimos comida deliciosa 🍽️,
                                  sino que también creamos un ambiente donde las experiencias y los momentos inolvidables
                                  se comparten ❤️.
                                  Queremos que te sientas como en casa desde el primer día. 
                                  Imagina disfrutar de una comida exquisita, rodeado de tus seres queridos 
                                  👨‍👩‍👧‍👦, mientras compartes momentos especiales. Estamos aquí para ofrecerte un servicio excepcional
                                  y sabores que enamoran 😍.
                                </p>
                                <p style="margin:0 0 20px">
                                  Para agradecerte por elegirnos, te invitamos a disfrutar de un 
                                  [descuento/platillo gratis/bebida de cortesía] en tu próxima visita. 🎁 
                                  Queremos asegurarnos de que tu experiencia sea memorable y llena de alegría.
                                </p>
                                <a rel="noopener"
                                  href="https://wa.me/+541165492404?text=Hola,%20buenas%20tardes,%20me%20gustaría%20acceder%20a%20mi%20descuento."
                                  style="background-color:#ff6154;border-radius:3px;color:#fff!important;display:block;font-size:15px;font-weight:600!important;height:20px!important;letter-spacing:0;line-height:20px;margin-bottom:30px;padding:20px 0;text-align:center;text-decoration:none;white-space:nowrap;width:100%"
                                  target="_blank">ACCEDE A TU DESCUENTO</a>
                                <p style="word-break:break-all">
                                  ¡Síguenos en Instagram!
                                  Descubre nuestras delicias y momentos especiales en @florindacoffee 🍰✨
                                </p>
                                <p style="margin:0 0 20px;padding:0">
                                  Dudas o consultas florindacoffee@gmail.com
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div style="color:#6f6f6f;font-size:12px;margin:54px auto auto;text-align:center;width:510px"
                        align="center">
                        <p>Café de Especialidad-Viennoiserie-Patisserie-Brunch Estamos en Caballito:📍Av Acoyte 272
                        <p>Armor Template®
                          Transformando ideas en soluciones efectivas.
                          © 2022 Armor Template. Todos los derechos reservados. <a href="#"
                            style="color:#6f6f6f!important;text-decoration:underline" target="_blank">unsubscribe
                            here</a>.</p>
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

        `
      });

      console.log(`Correo de BIENVENIDA enviado a ${lead.email}`);
    } catch (error) {
      console.error(`Error al enviar el correo de cumpleaños a ${lead.email}:`, error);
    }
  
}

// Función para programar el envío de correos en la fecha de cumpleaños
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
    birthdate.setHours(12, 35, 0, 0);  // 9:00 AM, 0 minutos, 0 segundos, 0 milisegundos
  
    console.log('Correo programado', lead.email, ' ', birthdate)
    // Programar la tarea de envío de correo
    const job = schedule.scheduleJob(birthdate, async () => {
      try {
        await transporter.sendMail({
          from: `"Feliz Cumpleaños!" <felicitaciones@sender.picoai.app>`,
          to: lead.email,
          subject: `Florinda Coffee House`,
          html: `
  <div
    style="color:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';line-height:18px">
    <div>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" height="100%" bgcolor="#f9f9f9">
        <tbody>
          <tr>
            <td>
              <div style="margin:0 auto;max-width:600px;padding:20px 10px">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" height="100%">
                  <tbody>
                    <tr>
                      <td>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tbody>
                            <tr>
                              <td>
                                <a href="#" title="Product Hunt"
                                  style="color:#ff6154!important;display:block;text-align:left!important;text-decoration:none"
                                  target="_blank">
                                  🎁
                                  <span
                                    style="color:#ff6154;font-family:'Helvetica Neue',Helvetica,Arial,'Lucida Grande',sans-serif;font-size:23px;font-weight:500;line-height:33px;margin-left:5px;vertical-align:top">FlorindaCoffee</span>
                                      🎁
                                </a>
                              </td>
                              <td style="color:#6f6f6f;font-size:13px;text-align:right" align="right">
                            
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td height="20"></td>
                    </tr>
                    <tr>
                      <td height="20"></td>
                    </tr>
                    <tr>
                      <td>
                        <div style="background-color:#fff;border-radius:3px;margin-bottom:20px;padding:20px">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#ffffff">
                            <tbody>
                              <tr>
                                <td style="font-size:16px;line-height:23px">
                                  <p style="margin:0px">

                                    <strong><a href="#" style="color:#ff6154!important;text-decoration:none"
                                        target="_blank">¡Feliz cumpleaños! 🎉</a></strong>
                                    Hoy es un día muy especial y queremos celebrarlo contigo ${lead.name}. En Florinda, no solo
                                    servimos comida deliciosa 🍽️,
                                    sino que también creamos un ambiente donde las experiencias y los momentos
                                    inolvidables se comparten ❤️.
                                    Para hacer tu cumpleaños aún más especial, tenemos una sorpresa exclusiva: un
                                    [descuento/platillo gratis/bebida de cortesía] en tu próxima visita. 🎁 Queremos
                                    agradecerte por ser parte de nuestra familia y permitirnos acompañarte en tus
                                    momentos especiales.
                                    Imagina disfrutar de una comida exquisita, rodeado de tus seres queridos
                                    👨‍👩‍👧‍👦, mientras celebras. Estamos aquí para que tu celebración sea memorable,
                                    con un ambiente acogedor, un servicio excepcional y, por supuesto, sabores que
                                    enamoran 😍.
                                    Para canjear tu regalo, simplemente presenta esta carta cuando nos visites. Nos
                                    encantaría que compartieras tu alegría con nosotros.
                                    Una vez más, ¡feliz cumpleaños! 🎂 Que este nuevo año esté lleno de momentos
                                    maravillosos, alegría y, por supuesto, ¡deliciosas comidas! 🍰
                                    Con cariño,
                                    Florinda.
                                  </p>
                                  <p style="margin:0 0 20px">
                                    Te agradeceríamos que reservaras una fecha para tu festejo.
                                    Estamos aquí para asegurarnos de que tu celebración sea inolvidable.
                                    No dudes en contactarnos para cualquier consulta o para hacer tu reserva.
                                    Puedes hacerlo clickeando mas abajo!
                                  </p>
                                  <a rel="noopener"
                                    href="https://wa.me/+541165492404?text=Hola,%20buenas%20tardes,%20me%20gustaría%20acceder%20a%20mi%20descuento%20por%20mi%20cumpleaños,%20quiero%20hacer%20una%20reserva%20para%20festejar%20mi%20cumpleaños,%20como%20podemos%20hacer?"
                                    style="background-color:#ff6154;border-radius:3px;color:#fff!important;display:block;font-size:15px;font-weight:600!important;height:20px!important;letter-spacing:0;line-height:20px;margin-bottom:30px;padding:20px 0;text-align:center;text-decoration:none;white-space:nowrap;width:100%"
                                    target="_blank">ACCEDE A TU DESCUENTO</a>

                                  <p style="word-break:break-all">
                                    ¡Síguenos en Instagram!
                                    Descubre nuestras delicias y momentos especiales en @florindacoffee 🍰✨
                                  </p>
                                  <p style="margin:0 0 20px;padding:0">
                                    Dudas o consultas florindacoffee@gmail.com
                                    <br>
                                  </p>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div style="color:#6f6f6f;font-size:12px;margin:54px auto auto;text-align:center;width:510px"
                          align="center">
                          <p>Café de Especialidad-Viennoiserie-Patisserie-Brunch Estamos en Caballito:📍Av Acoyte 272
                            <p>Armor Template®
                              Transformando ideas en soluciones efectivas.
                              © 2022 Armor Template. Todos los derechos reservados. <a href="#"
                                style="color:#6f6f6f!important;text-decoration:underline" target="_blank">unsubscribe
                                here</a>.</p>
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `
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
