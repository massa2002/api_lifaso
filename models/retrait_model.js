const admin = require('../utils/firebaseAdmin');
const db = admin.firestore();

class RetraitModel {

  static async createRetrait(data) {
    const retraitRef = db.collection('retraits').doc();
    await retraitRef.set(data);
    return { id: retraitRef.id, ...data };
  }

  static async getAllRetraitsByUser(userId) {
    const snapshot = await db.collection('retraits').where('userId', '==', userId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

module.exports = RetraitModel;