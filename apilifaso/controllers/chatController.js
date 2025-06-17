const ChatModel = require('../models/chatModel');
const admin = require('../utils/firebaseAdmin');
const db = admin.firestore();
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const UserModel = require('../models/userModel');
const SurveyModel = require('../models/SurveyModel');

const getReceiverIds = async () => {
    try {
        const superAdminsSnapshot = await db.collection('users').where('statut', '==', 'superadmin').get();

        if (superAdminsSnapshot.empty) {
            console.log("Aucun superadmin trouvé.");
            return [];
        }

        let superAdminIds = [];
        superAdminsSnapshot.forEach(doc => {
            superAdminIds.push(doc.id);
        });

        return superAdminIds;
    } catch (error) {
        console.error("Erreur lors de la récupération des superadmins:", error);
        return [];
    }
};

class ChatController {
    static async createMessage(req, res) {
        try {
            const { enquete_id, userId, text } = req.body;

            if (!enquete_id || !userId || !text) {
                return res.status(400).json({ message: 'enquete_id, userId, and text are required' });
            }

            const now = new Date();

            // 1. Créer un message global (unique pour tous)
            const messageRef = await db.collection('messages').add({
                enquete_id,
                userId,
                text,
                read: false,
                date: now,
            });

            // 2. Récupérer tous les superadmins comme destinataires
            const receiverIds = await getReceiverIds();
            if (receiverIds.length === 0) {
                return res.status(400).json({ message: 'Aucun superadmin trouvé pour recevoir le message' });
            }

            const dateToBeSend = new Date(now.getTime() + 2 * 60000); // 2 minutes plus tard

            // 3. Créer une notification individuelle pour chaque superadmin avec une référence au message
            const batch = db.batch();
            receiverIds.forEach(receiverId => {
                // On utilise l'enquete_id pour créer un identifiant unique par enquête et par superadmin
                const notificationRef = db.collection('notifications').doc(`${enquete_id}_${receiverId}`);
                batch.set(notificationRef, {
                    // référence vers le message global
                    senderId: userId,
                    receiverId,
                    dateToBeSend,
                    read: false,
                }, { merge: true });
            });

            await batch.commit();
            // 4. Récupérer les infos de l'utilisateur
            const user = await UserModel.getUserById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            const { nom, prenom } = user;

            // Formater la date au format "16 janvier 2025"
            const mois = [
                'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
            ];
            const jour = now.getDate();
            const moisNom = mois[now.getMonth()];
            const annee = now.getFullYear();
            const dateFormatee = `${jour} ${moisNom} ${annee}`;

            // Créer l'objet de mise à jour
            const updateData = {
                derniere_modification: [
                    {
                        nom,
                        prenom,
                        date: dateFormatee
                    }
                ]
            };

            // Mettre à jour l'enquête avec `derniere_modification`
            await SurveyModel.updateSurvey(enquete_id, updateData);


            res.status(201).json({ message: "Message global créé et notifications envoyées aux superadmins" });
        } catch (error) {
            console.error('Error creating message:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getMessagesByEnqueteId(req, res) {
        try {
            const { enqueteId, receiverId } = req.params;
    
            if (!enqueteId || !receiverId) {
                return res.status(400).json({ message: 'enqueteId and receiverId are required' });
            }
    
            // 🔹 Récupérer les messages liés à l'enquête
            const messagesSnapshot = await db
                .collection('messages')
                .where('enquete_id', '==', enqueteId)
                .orderBy('date', 'asc')
                .get();
    
            let messages = [];
            if (!messagesSnapshot.empty) {
                messagesSnapshot.forEach(doc => {
                    messages.push({ id: doc.id, ...doc.data() });
                });
            }
    
            // 🔹 Vérifier si le receiverId est un superadmin
            const receiverIds = await getReceiverIds();
    
            if (!receiverIds || receiverIds.length === 0) {
                return res.status(500).json({ message: 'Impossible de récupérer les superadmins' });
            }
    
            const isSuperAdmin = receiverIds.includes(receiverId);
    
            // 🔹 Si c'est un superadmin, mettre à jour les messages et supprimer la notification
            if (isSuperAdmin && messages.length > 0) {
                const batch = db.batch();
    
                messagesSnapshot.forEach(doc => {
                    batch.update(doc.ref, { read: true });
                });
    
                const notificationRef = db.collection('notifications').doc(`${enqueteId}_${receiverId}`);
                batch.delete(notificationRef);
    
                await batch.commit();
            }
    
            // Retourner les messages (vide si aucun message trouvé)
            res.status(200).json(messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Supprimer un message
    static async deleteMessage(req, res) {
        try {
            const { messageId, senderId, receiverId } = req.params;

            if (!messageId) {
                return res.status(400).json({ message: 'messageId is required' });
            }

            await db.collection('messages').doc(messageId).delete();

            // 🔹 Supprimer la notification associée
            await db.collection('notifications').doc(`${enqueteId}_${receiverId}`).delete();

            res.status(200).json({ message: 'Message deleted successfully' });
        } catch (error) {
            console.error('Error deleting message:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

}
async function processUnreadMessageNotifications() {
    const now = new Date();

    const notificationsSnapshot = await db.collection('notifications')
        .where('dateToBeSend', '<=', now) // Récupérer les notifications expirées
        .get();

    const notifications = notificationsSnapshot.docs.map(doc => {
        const [enquete_id, receiverId] = doc.id.split('_'); // Extraire enquete_id et receiverId
        return { id: doc.id, enquete_id, receiverId, ...doc.data() };
    });

    for (const notif of notifications) {
        // 🔹 Envoyer l'e-mail avec enquete_id
        await sendEmailNotification(notif.receiverId, notif.senderId, notif.enquete_id);

        // 🔹 Supprimer la notification après l’envoi
        await db.collection('notifications').doc(notif.id).delete();
    }


}



async function sendEmailNotification(receiverId, senderId, enquete_id) {
    const transporter = nodemailer.createTransport({
        host: 'mail.asdm.lu',
        port: 465,
        secure: true,
        auth: {
            user: process.env.USER,
            pass: process.env.PASS,
        }
    });

    try {
        // 🔹 Récupérer l'email du receiver
        const receiverDoc = await db.collection('users').doc(receiverId).get();
        const receiverEmail = receiverDoc.exists ? receiverDoc.data().email : null;

        // 🔹 Récupérer l'email du sender
        const senderDoc = await db.collection('users').doc(senderId).get();
        const senderEmail = senderDoc.exists ? senderDoc.data().email : null;

        if (!receiverEmail) {
            console.error(`Email non trouvé pour receiverId: ${receiverId}`);
            return;
        }

        if (!senderEmail) {
            console.error(`Email non trouvé pour senderId: ${senderId}`);
            return;
        }

        // 🔹 Récupérer l'enquête
        const enqueteDoc = await db.collection('enquete').doc(enquete_id).get();
        if (!enqueteDoc.exists) {
            console.error(`Enquête non trouvée pour enquete_id: ${enquete_id}`);
            return;
        }

        const enqueteData = enqueteDoc.data();
        const enqueteNumero = enqueteData.numero || 'Inconnu';
        const groupId = enqueteData.groups;

        let adminEmails = [];

        if (groupId) {
            // 🔹 Récupérer le groupe
            const groupDoc = await db.collection('groups').doc(groupId).get();
            if (groupDoc.exists) {
                const groupData = groupDoc.data();
                const adminIds = groupData.administrateurs || [];

                // 🔹 Récupérer les emails des administrateurs
                for (const adminId of adminIds) {
                    const userDoc = await db.collection('users').doc(adminId).get();
                    if (userDoc.exists && userDoc.data().email) {
                        adminEmails.push(userDoc.data().email);
                    } else {
                        console.warn(`Email non trouvé pour administrateur: ${adminId}`);
                    }
                }
            } else {
                console.error(`Groupe non trouvé pour groupId: ${groupId}`);
            }
        } else {
            console.error(`Pas de group ID pour l'enquête ${enquete_id}`);
        }

        // 🔹 Construire la liste complète des destinataires
        const allReceivers = [receiverEmail, ...adminEmails];

        if (allReceivers.length === 0) {
            console.error('Aucun destinataire trouvé pour l\'envoi de l\'email.');
            return;
        }

        
        const mailOptions = {
            from: '"Enquete soleil" <gestionenquete@asdm.lu>',
            to: allReceivers, // Liste contenant receiver + admins
            subject: `Nouveau message pour l'enquête N°${enqueteNumero}`,
            html: `
                <html>
                    <body>
                        <h2>Bonjour,</h2>
                        <p>Vous avez un nouveau message de ${senderEmail} concernant l'enquête N°${enqueteNumero}.</p>
                        <p>Connectez-vous pour le lire.</p>
                          <p><a href="https://app.enquetesoleil.com" style="display:inline-block;padding:10px 20px;margin-top:10px;color:white;background:#f4970e;text-decoration:none;border-radius:5px;">Voir l'enquête</a></p>
                        <p>Bien cordialement,</p>
                        <p style="font-size: 12px ; font-family: Calibri"><b>L'équipe de support de l'enquête Soleil</b><br />
                        <b><span style="color:#f4970e">Volet numérique</span></b><br />
                        ---------------------------------------------<br />
                        Représentation du Burkina Faso<br />
                        ONG-D Le Soleil dans la Main<br />
                        05 BP 6148 Ouaga Patte d'Oie 10010 Ouagadougou<br />
                        Tél. F : <a href="tel:+226 25 38 15 14">+226 25 38 15 14</a><br />
                   
                    </body>
                </html>
            `
        };

        // 🔹 Envoyer l'email
        await transporter.sendMail(mailOptions);

       

    } catch (error) {
        console.error('Erreur envoi e-mail:', error);
    }
}


cron.schedule('* * * * *', async () => { 
    await processUnreadMessageNotifications();
});

module.exports = { sendEmailNotification };



cron.schedule('* * * * *', async () => { 

    await processUnreadMessageNotifications();
});



module.exports = ChatController;
