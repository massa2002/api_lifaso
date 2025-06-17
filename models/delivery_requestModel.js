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


 static async updateStep(id, updateData) {
    const docRef = db.collection('delivery_requests').doc(id);

    // Mise à jour de la demande dans delivery_requests
    await docRef.update(updateData);

    // Si on met à jour l'étape, on synchronise aussi dans delivery_status
    if (updateData.etape) {
      const deliveryStatusRef = db.collection('delivery_status').doc(id);
      
      // Mise à jour dans delivery_status
      await deliveryStatusRef.update({
        etape: updateData.etape,
        date_update: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Récupérer la demande mise à jour
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  }
static async getAll() {
  const snapshot = await db.collection('delivery_requests').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

static async getAllVisible() {
  const snapshot = await db.collection('delivery_requests').get();
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(doc => doc.visibility === undefined || doc.visibility === true);
}

  static async delete(id) {
    await db.collection('delivery_requests').doc(id).delete();
    return true;
  }
}

module.exports = DeliveryRequestModel;