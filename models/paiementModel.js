const admin = require('../utils/firebaseAdmin');
const db = admin.firestore();

class PaiementModel {

  static async addToWallet(userId, montant) {
  const userRef = db.collection('wallet').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    await userRef.set({ solde: montant });
  } else {
    const userData = userDoc.data();
    const soldeActuel = userData.solde || 0;
    await userRef.update({ solde: soldeActuel + montant });
  }

  // Ajout dans la sous-collection "transactions"
  await userRef.collection('transactions').add({
    type: 'ajout',
    somme: montant,
    date: new Date()
  });

  return true;
}

static async updateWallet(userId, montant) {
  const userRef = db.collection('wallet').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    await userRef.set({ solde: 0 - montant });
  } else {
    const userData = userDoc.data();
    const soldeActuel = userData.solde || 0;
    if (soldeActuel < montant) throw new Error('Solde insuffisant');
    await userRef.update({ solde: soldeActuel - montant });
  }

  // Ajout dans la sous-collection "transactions"
  await userRef.collection('transactions').add({
    type: 'retrait',
    somme: montant,
    date: new Date()
  });

  return true;
}
static async getWalletById(userId) {
  const userRef = db.collection('wallet').doc(userId);
  const userDoc = await userRef.get();
  if (!userDoc.exists) return null;

  // Récupérer les transactions
  const transactionsSnap = await userRef.collection('transactions').orderBy('date', 'desc').get();
  const transactions = transactionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
console.log('Transactions récupérées pour l\'utilisateur:', userId, transactions);
  return { id: userDoc.id, ...userDoc.data(), transactions };
}

static async getAllWallets() {
  const snapshot = await db.collection('wallet').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
}

module.exports = PaiementModel;