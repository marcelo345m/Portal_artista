const nodemailer = require('nodemailer');

// Crie o transportador (a conta de e-mail que enviará os e-mails)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'seu-email@gmail.com', 
    pass: 'sua-senha' 
  }
});

// Função para enviar um e-mail
function sendEmail(recipient, subject, message) {
  const mailOptions = {
    from: 'seu-email@gmail.com',
    to: recipient,
    subject: subject,
    text: message
  };

  // Enviar o e-mail
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('Erro ao enviar e-mail:', error);
    }
    console.log('E-mail enviado: ' + info.response);
  });
}

// Testando o envio de e-mail
sendEmail('destinatario@example.com', 'Assunto do E-mail', 'Corpo do e-mail');
