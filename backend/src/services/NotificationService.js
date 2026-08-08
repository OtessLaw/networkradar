const nodemailer = require('nodemailer');

async function sendEmail(to, subject, body) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Mock Email to ${to}: ${subject}`);
    return;
  }
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: '"NetworkRadar" <noreply@networkradar.gh>',
    to,
    subject,
    text: body
  });
}

async function sendSMS(phone, message) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Mock SMS to ${phone}: ${message}`);
    return;
  }
  // Pluggable SMS provider integration would go here
}

module.exports = {
  sendEmail,
  sendSMS
};
