const admin = require('../utils/firebaseAdmin');
const db = admin.firestore();

class DeliveryRequestModel {
  static async create(data) {
    const docRef = await db.collection('delivery_requests').add(data);
    const doc = await docRef.get();
    return { id: docRef.id, ...doc.data() };
  }

  static async getAll() {
    const snapshot = await db.collection('delivery_requests').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }


static async updateStep(id, etape) {
  const docRef = db.collection('delivery_requests').doc(id);
  await docRef.update({ etape, date_update: new Date() });
  const updatedDoc = await docRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
}

  static async delete(id) {
    await db.collection('delivery_requests').doc(id).delete();
    return true;
  }
}

module.exports = DeliveryRequestModel;