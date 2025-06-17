const admin = require('../utils/firebaseAdmin');
const db = admin.firestore();

class PaiementModel {

  static async updateWallet(userId, montant) {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error('Utilisateur non trouvé');
    }

    const userData = userDoc.data();
    const soldeActuel = userData.solde || 0;

    if (soldeActuel < montant) {
      throw new Error('Solde insuffisant');
    }

    await userRef.update({
      solde: soldeActuel - montant
    });

    return true;
  }

  // Ajoute ceci dans PaiementModel (paiementModel.js)
static async addToWallet(userId, montant) {
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new Error('Utilisateur non trouvé');
  }

  const userData = userDoc.data();
  const soldeActuel = userData.solde || 0;

  await userRef.update({
    solde: soldeActuel + montant
  });

  return true;
}
}

module.exports = PaiementModel;