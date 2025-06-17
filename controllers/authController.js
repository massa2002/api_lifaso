const jwt = require('jsonwebtoken'); 
const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/tokenUtil');
const nodemailer = require('nodemailer'); 


class AuthController {
  static async login(req, res, next) {
    try {
      const { email, mot_de_passe } = req.body;
      console.log("Login attempt with email:", email);
  
      // Recherche de l'utilisateur par email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      console.log("User found:", user);
  
      // Vérification du mot de passe
      const isPasswordValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      // Génération du token avec le rôle
      const token = generateToken(user.id, user.statut);
      // Réponse sans inclure le token directement
      res.status(200).json({
        token: token,
        user_id: user.id,
        statut: user.statut,
       
        
      });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
 static async requestPasswordReset(req, res) {
    try {
        const { email } = req.body;
        const user = await UserModel.findByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Récupérer le nom et le prénom de l'utilisateur
        const { nom, prenom } = user;
        console.log("Nom de l'utilisateur:", nom);
        console.log("Prénom de l'utilisateur:", prenom);

        const baseUrl = process.env.BASE_URL;
        const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        const resetLink = `${baseUrl}/modifier_motdepasse?token=${resetToken}`;

        const transporter = nodemailer.createTransport({
            host: 'mail.asdm.lu',
            port: 465,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            }
        });

        await transporter.sendMail({
            from: '"Enquete Soleil" <gestionenquete@asdm.lu>',
            to: email,
            subject: 'Réinitialisation du mot de passe',
            html: `
                <html>
                    <body>
                        <h2>Bonjour ${nom || 'Utilisateur'} ${prenom || ''},</h2>
                        <p>Nous avons reçu une demande de réinitialisation de votre mot de passe.
                       </p>
                        
                        <p
                        Cliquez sur le lien ci-dessous pour confirmer :</p>
                        <p><a href="${resetLink}" style="padding: 10px 20px; background-color: #f4970e; color: white; text-decoration: none; border-radius: 5px;">Réinitialiser le mot de passe</a></p>
                        <p>Le lien expirera dans 24H, alors assurez-vous de l'utiliser rapidement!</p>
                        <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer ce message.</p>
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
            `
        });

        res.status(200).json({ message: 'Email de réinitialisation envoyé' });
    } catch (error) {
        console.error('Erreur lors de la demande de réinitialisation:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

  static async resetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;

        console.log("Token reçu:", token);
        console.log("Nouveau mot de passe:", newPassword);

        // Vérifier que le token et le mot de passe sont bien envoyés
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token ou mot de passe manquant' });
        }

        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);

        if (!decoded || !decoded.userId) {
            return res.status(400).json({ message: 'Token invalide ou expiré' });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log("Mot de passe hashé:", hashedPassword);

        // Mettre à jour le mot de passe
        const result = await UserModel.updatePassword(decoded.userId, hashedPassword);
        console.log("Résultat de la mise à jour:", result);

        return res.status(200).json({ message: 'Mot de passe mis à jour avec succès' });
    } catch (error) {
        console.error("Erreur complète :", error); // Affiche l'erreur dans la console
        return res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
}

}

module.exports = AuthController;
