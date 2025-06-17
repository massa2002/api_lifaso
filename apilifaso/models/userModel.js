const bcrypt = require('bcrypt');
const admin = require('../utils/firebaseAdmin');
const db = admin.firestore();

class UserModel {
  static async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.mot_de_passe, 10);
    const newUser = { ...userData, mot_de_passe: hashedPassword };
  
    // Supprimez les champs avec des valeurs undefined
    Object.keys(newUser).forEach(key => {
      if (newUser[key] === undefined) {
        delete newUser[key];
      }
    });
  
    // Crée l'utilisateur
    const userRef = await db.collection('users').add(newUser);
  
    return { id: userRef.id, ...newUser };
  }
  



  static async findByEmail(email) {
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      return null;
    }
    const userDoc = userSnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  }

  static async updatePassword(userId, hashedPassword) {
    await db.collection('users').doc(userId).update({
      mot_de_passe: hashedPassword
    });
    return true;
  }
  
  static async getAllUsers() {
    const usersSnapshot = await db.collection('users')
        .orderBy('numero', 'asc') // 'asc' pour croissant, 'desc' pour décroissant
        .get();

        return usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => parseInt(a.numero) - parseInt(b.numero));
}
//fonction pour recuper les utilisateurs par id recupere depuis les groupes 


static async getUsersByIds(userIds) {
  if (!userIds || userIds.length === 0) {
    return [];
  }

  // Firestore limite à 30 IDs max par "in"
  const chunks = [];
  while (userIds.length) {
    chunks.push(userIds.splice(0, 30));
  }

  const users = [];
  for (const chunk of chunks) {
    const snapshot = await db.collection('users')
      .where(admin.firestore.FieldPath.documentId(), 'in', chunk)
      .get();

    users.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }

  return users;
}



// Fonction pour récupérer les utilisateurs par ID
  static async getUserById(id) {
    const userDoc = await db.collection('users').doc(id).get();
    if (!userDoc.exists) {
      return null;
    }
    return { id: userDoc.id, ...userDoc.data() };
  }

  static async updateUser(id, updateData) {
    if (updateData.mot_de_passe) {
        updateData.mot_de_passe = await bcrypt.hash(updateData.mot_de_passe, 10);
    }

    // Supprime les champs avec des valeurs undefined
    Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
            delete updateData[key];
        }
    });

    try {
        const userRef = db.collection('users').doc(id);
        await userRef.update(updateData);

        const updatedUserDoc = await userRef.get();
        return { id: updatedUserDoc.id, ...updatedUserDoc.data() };
    } catch (error) {
        console.error('Error updating user in Firestore:', error.message);
        throw new Error('Could not update user');
    }
}


  static async deleteUser(id) {
    await db.collection('users').doc(id).delete();
  }
}

module.exports = UserModel;