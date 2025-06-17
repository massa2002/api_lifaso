const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.asdm.lu",
  port: 465,
  secure: true, 
  auth: {
    user: "gestionenquete@asdm.lu",
    pass: "++Soleil@25",
  },
});

const mailOptions = {
  from: '"Support" <gestionenquete@asdm.lu>',
  to: "sahoudmassahoud@gmail.com",
  subject: "Test Nodemailer SMTP",
  text: "Ceci est un test d'envoi de mail avec Nodemailer.",
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Erreur SMTP :", error);
  } else {
    console.log("E-mail envoyé :", info.response);
  }
});
