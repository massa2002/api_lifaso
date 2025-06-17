const admin = require('../utils/firebaseAdmin');
const db = admin.firestore();


class ChatModel {
  // Créer un message dans Firestore
  static async createMessage(messageData) {
    try {
      const { enquete_id, userId, text, date } = messageData; // Définit la date si elle n'existe pas
      
      // Vérifier que enquete_id est fourni
      if (!enquete_id) {
        throw new Error('enquete_id is required');
      }

      // Ajouter le message dans la collection `messages` (ou le nom que vous avez choisi)
      const newMessageRef = db.collection('messages').doc();
      const newMessage = {
        enquete_id,
        userId,
        text,
        date, // Utilise la date actuelle si aucune n'est fournie
      };

      await newMessageRef.set(newMessage);
      return { id: newMessageRef.id, ...newMessage };
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  // Récupérer les messages pour un `enquete_id` donné
  static async getMessages(enqueteId) {
    try {
      if (!enqueteId) {
        throw new Error('enquete_id is required');
      }
  
      console.log(`Querying Firestore for messages with enquete_id: ${enqueteId}`);
  
      const querySnapshot = await db
        .collection('messages')
        .where('enquete_id', '==', enqueteId)
        .orderBy('date', 'asc') // Tri par date
        .get();
  
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
  
      return {
        success: true,
        data: messages, // Structure explicite
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
  

  // Supprimer un message par ID
  static async deleteMessage(messageId) {
    try {
      // Vérifier que messageId est fourni
      if (!messageId) {
        throw new Error('messageId is required');
      }
     
      // Supprimer le message de Firestore
      await db.collection('messages').doc(messageId).delete();
      return { message: 'Message deleted successfully' };
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
}

module.exports = ChatModel;

