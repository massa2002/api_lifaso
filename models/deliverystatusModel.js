const admin = require('../utils/firebaseAdmin');
const db = admin.firestore();

class DeliveryStatusModel {
  static async createStatus(deliveryRequestId) {
    const data = {
      delivery_request_id: deliveryRequestId,
      date_demande: admin.firestore.FieldValue.serverTimestamp(),
      etape: 'soumis',
    };
    const docRef = await db.collection('delivery_status').doc(deliveryRequestId).set(data);
    return data;
  }

  static async updateStatus(deliveryRequestId, newStep) {
    const updateData = {
      etape: newStep,
      date_update: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('delivery_status').doc(deliveryRequestId).update(updateData);
    const updatedDoc = await db.collection('delivery_status').doc(deliveryRequestId).get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  }

  static async getStatus(deliveryRequestId) {
    const doc = await db.collection('delivery_status').doc(deliveryRequestId).get();
    if (!doc.exists) throw new Error('Status not found');
    return { id: doc.id, ...doc.data() };
  }
}

module.exports = DeliveryStatusModel;
