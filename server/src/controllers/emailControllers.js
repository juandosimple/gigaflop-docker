import nodemailer from 'nodemailer';


import dotenv from 'dotenv';

dotenv.config();


// Configuración de transporte dinámica
const createTransporter = () => {
  if (process.env.EMAIL_HOST) {
    // Uso de SMTP genérico (o local)
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 25,
      secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para otros
      auth: process.env.EMAIL_PASS ? {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      } : undefined, // Sin auth si no hay password
      tls: {
        rejectUnauthorized: false
      }
    });
  } else {
    // Fallback Legacy (Gmail directo)
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
};

export const enviarCotizacion = async (req, res) => {
  const { clienteEmail, asunto, htmlCotizacion } = req.body;

  if (!clienteEmail || typeof clienteEmail !== 'string' || clienteEmail.trim() === '') {
    console.error('❌ Email del cliente no definido');
    return res.status(400).json({ error: 'Email del cliente no definido' });
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_USER || 'no-reply@itnow.com.ar',
    to: clienteEmail,
    subject: asunto,
    html: htmlCotizacion
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ mensaje: 'Correo enviado con éxito' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ error: 'Error al enviar el correo' });
  }
};

export async function enviarEmailDeAlerta({ to, subject, html }) {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_USER || 'no-reply@itnow.com.ar',
    to,
    subject,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Error al enviar alerta:', error);
    throw error;
  }
}





export async function enviarEmailConAdjunto(req, res) {
  const { clienteEmail, asunto, htmlCotizacion } = req.body;
  const archivoPDF = req.file;

  if (!clienteEmail || !archivoPDF) {
    return res.status(400).json({ error: 'Faltan datos para enviar el correo' });
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_USER || 'no-reply@itnow.com.ar',
    to: clienteEmail,
    subject: asunto,
    html: htmlCotizacion,
    attachments: [
      {
        filename: archivoPDF.originalname,
        content: archivoPDF.buffer
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ mensaje: 'Correo enviado con PDF adjunto' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ error: 'No se pudo enviar el correo' });
  }
}