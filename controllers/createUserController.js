const CreateUserModel = require("../models/createUserModel");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken'); 
class CreateUserController {
  static async sendInvite(req, res) {
    try {
      const { email, statut, organismeid } = req.body;

      if (!email || !statut || !organismeid) {
        return res.status(400).json({ error: "Email, statut et organismeId sont requis" });
      }
     // Remplacez par l'URL de votre application
      const token = jwt.sign({ email, statut, organismeid }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      
      const baseUrl = process.env.BASE_URL;

     
      const signUpLink = `${baseUrl}/creer_compte?token=${token}`;
  const transporter = nodemailer.createTransport({
        host: 'mail.asdm.lu',  
        port: 465, 
        secure: true, 
        auth: {
          user: process.env.USER,
          pass: process.env.PASS,
        }
    });

      // Envoi de l'email
      await transporter.sendMail({
        from: '"Enquetesoleil" <gestionenquete@asdm.lu>',
        to: email,
        subject: "Invitation à rejoindre la plateforme",
        html: `
          <html>
            <body>
              <h2>Bonjour</h2>
              <p>Nous sommes ravis de vous inviter à rejoindre notre plateforme !</p>
              <p>Votre rôle : <strong>${statut}</strong></p>
              <p>Cliquez sur le lien ci-dessous pour créer votre compte (valide 24h) :</p>
              <a href="${signUpLink}" style="padding: 10px 20px; background-color: #f4970e; color: white; text-decoration: none; border-radius: 5px;">S'inscrire</a>
              <p>Si vous avez des questions, contactez-nous.</p>
               <p>Bien cordialement,</p>
              
              <p style="font-size: 12px ; font-family: Calibri"><b>L'équipe de support de l'enquête Soleil</b><br />

<b><span style="color:#f4970e">Volet numérique</span></b><br />

---------------------------------------------<br />

Représentation du Burkina Faso<br />

ONG-D Le Soleil dans la Main<br />

05 BP 6148 Ouaga Patte d'Oie 10010 Ouagadougou<br />

Tél. F : <a href="tel:+226 25 38 15 14">+226 25 38 15 14</a><br />



            </body>
          </html>
        `,
      });

      console.log(`Email d'invitation envoyé à ${email}`);
      res.status(200).json({ message: "Email envoyé avec succès !" });

    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      res.status(500).json({ error: "Erreur lors de l'envoi de l'email: " + error.message });
    }
  }
  static async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "User ID requis" });
      }

      // Supprimer l'utilisateur dans Firebase Auth
      await admin.auth().deleteUser(userId);

      // Supprimer l'utilisateur dans Firestore
      await CreateUserModel.deleteUser(userId);

      res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      res.status(500).json({ error: "Erreur lors de la suppression: " + error.message });
    }
  }
}

module.exports = CreateUserController;
