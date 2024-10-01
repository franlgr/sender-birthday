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
  html: `  <div
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
                                    Hoy es un día muy especial y queremos celebrarlo contigo. En Florinda, no solo
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
