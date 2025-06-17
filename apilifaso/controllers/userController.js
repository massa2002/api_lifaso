const UserModel = require('../models/userModel');


const { uploadImageToStorage } = require('../utils/storageUtil');
const admin = require('../utils/firebaseAdmin');

const db = admin.firestore();
class UserController {
  static formatDateToFrench(date) {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }


static async createSimpleUser(req, res) {
  try {
    const { nom, prenom, email, mot_de_passe, telephone } = req.body;

    if (!email || !mot_de_passe || !telephone || !nom || !prenom) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await db.collection('users').where('email', '==', email).get();
    if (!existingUser.empty) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    // Générer le numéro utilisateur
    let numero = '0001';
    const lastUser = await db.collection('users').orderBy('numero', 'desc').limit(1).get();
    if (!lastUser.empty) {
      const lastNumero = parseInt(lastUser.docs[0].data().numero, 10);
      numero = (lastNumero + 1).toString().padStart(4, '0');
    }

    const date_creation = UserController.formatDateToFrench(new Date());

    const newUser = await UserModel.createUser({
      nom,
      prenom,
      email,
      mot_de_passe,
      telephone,
      numero,
      statut: 'user',
      date_creation
    });

    return res.status(201).json({ user: newUser });
  } catch (error) {
    console.error('Erreur création simple utilisateur :', error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
}



static async updateUser(req, res, next) {
  try {
    const userId = req.params.id;
    const {
      nom,
      prenom,
      email,
      mot_de_passe,
      telephone,
      statut,
      date_naissance,
      adresse,
      flotte,
      moyen_transport
    } = req.body;

    // Gestion des uploads multiples
    let photoUrl = '';
    let pieceIdentiteUrl = '';
    let permisConduireUrl = '';
    let carteGriseUrl = '';

  
    if (req.files) {
      if (req.files.photo && req.files.photo[0]) {
        photoUrl = await uploadImageToStorage(req.files.photo[0]);
      }
      if (req.files.piece_identite && req.files.piece_identite[0]) {
        pieceIdentiteUrl = await uploadImageToStorage(req.files.piece_identite[0]);
      }
      if (req.files.permis_conduire && req.files.permis_conduire[0]) {
        permisConduireUrl = await uploadImageToStorage(req.files.permis_conduire[0]);
      }
      if (req.files.carte_grise && req.files.carte_grise[0]) {
        carteGriseUrl = await uploadImageToStorage(req.files.carte_grise[0]);
      }
    }

    
    const updateData = {
      nom,
      prenom,
      email,
      mot_de_passe,
      telephone,
      statut,
      date_naissance,
      adresse,
      flotte,
      moyen_transport,
    };

    if (photoUrl) updateData.photo = photoUrl;
    if (pieceIdentiteUrl) updateData.photo_piece_identite = pieceIdentiteUrl;
    if (permisConduireUrl) updateData.photo_permis_conduire = permisConduireUrl;
    if (carteGriseUrl) updateData.photo_carte_grise = carteGriseUrl;

  
    const updatedUser = await UserModel.updateUser(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour.' });
  }
}

  
  static async getAllUsers(req, res, next) {
  try {
    const users = await UserModel.getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    res.status(500).json({ message: "Erreur serveur interne." });
  }
}
  
  

  static async getUserById(req, res, next) {
    try {
      const user = await UserModel.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

 
  
  static async deleteUser(req, res, next) {
    try {
      await UserModel.deleteUser(req.params.id);
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = UserController;