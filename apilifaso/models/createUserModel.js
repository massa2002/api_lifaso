const admin = require("../utils/firebaseAdmin");
const db = admin.firestore();

class CreateUserModel {
  // Créer un utilisateur dans Firebase Auth et Firestore
  static async createUser(email, role) {
    try {
      const userRecord = await admin.auth().createUser({
        email: email,
        emailVerified: false,
      });

      await db.collection("users").doc(userRecord.uid).set({
        email: email,
        statut: role,
        date_creation: admin.firestore.FieldValue.serverTimestamp(),
      });

      return userRecord.uid;
    } catch (error) {
      throw new Error("Erreur lors de la création de l'utilisateur: " + error.message);
    }
  }

  // Supprimer un utilisateur dans Firebase Auth et Firestore
  static async deleteUser(userId) {
    try {
      // Supprimer de Firebase Auth
      await admin.auth().deleteUser(userId);

      // Supprimer de Firestore
      await db.collection("users").doc(userId).delete();

     
    } catch (error) {
      throw new Error("Erreur lors de la suppression de l'utilisateur: " + error.message);
    }
  }
}

module.exports = CreateUserModel;
