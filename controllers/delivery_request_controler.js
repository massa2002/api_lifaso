const DeliveryRequestModel = require('../models/delivery_requestModel');
const { uploadImageToStorage } = require('../utils/storageUtil');
const PaiementModel = require('../models/paiementModel');
const DeliveryStatusModel = require('../models/deliverystatusModel');
class DeliveryRequestController {
  static async createDeliveryRequest(req, res) {
    try {
      
      const {
        nom_receveur,
        prenom_receveur,
        description,
        poids_estime,
        dimensions,
        adresse_depart,
        adresse_arrivee,
        payer_a_livraison,
        prix,
        paiement_effectue,
        user_id,
        toCoord,
        fromCoord,
        
      } = req.body;
console.log('Données reçues pour la création de la demande de livraison :', req.body);
      let photoUrl = '';
      if (req.file) {
        photoUrl = await uploadImageToStorage(req.file);
      }

      // Si paiement_effectue est true, on met à jour le wallet de l'utilisateur
      if ((paiement_effectue === 'true' || paiement_effectue === true) && user_id) {
        try {
          await PaiementModel.updateWallet(user_id, parseFloat(prix) || 0);
        } catch (err) {
          return res.status(400).json({ message: err.message });
        }
      }

      const newRequest = await DeliveryRequestModel.create({
        nom_receveur,
        prenom_receveur,
        description,
        poids_estime,
        dimensions,
        photo: photoUrl,
        adresse_depart,
        adresse_arrivee,
        payer_a_livraison: payer_a_livraison === 'true' || payer_a_livraison === true,
        prix: parseFloat(prix) || 0,
        paiement_effectue: paiement_effectue === 'true' || paiement_effectue === true,
        date_creation: new Date(),
        etape: 'publier' ,
        user_id: user_id,
        toCoord,
        fromCoord,
        visibility: true // Par défaut, la demande est visible
      });
     await DeliveryStatusModel.createStatus(newRequest.id);

      res.status(201).json({ delivery_request: newRequest });
    } catch (error) {
      console.error('Erreur création demande de livraison :', error);
      res.status(500).json({ message: "Erreur serveur." });
    }
  }

  static async getAllDeliveryRequests(req, res) {
    try {
      const requests = await DeliveryRequestModel.getAll();
      res.status(200).json(requests);
    } catch (error) {
      console.error('Erreur récupération demandes de livraison :', error);
      res.status(500).json({ message: "Erreur serveur." });
    }
  }

  static async deleteDeliveryRequest(req, res) {
    try {
      const { id } = req.params;
      await DeliveryRequestModel.delete(id);
      res.status(200).json({ message: 'Demande de livraison supprimée.' });
    } catch (error) {
      console.error('Erreur suppression demande de livraison :', error);
      res.status(500).json({ message: "Erreur serveur." });
    }
  }

  // Nouvelle méthode pour mettre à jour l'étape d'une livraison
  static async updateDeliveryStep(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Aucune donnée à mettre à jour." });
    }

    const updated = await DeliveryRequestModel.updateStep(id, updateData);
    res.status(200).json({ message: "Mise à jour effectuée", delivery_request: updated });
  } catch (error) {
    console.error('Erreur mise à jour livraison :', error);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

static async getAllDeliveryRequests(req, res) {
  try {
    const requests = await DeliveryRequestModel.getAll();
    console.log('Demandes de livraison récupérées :', requests);
    res.status(200).json(requests);
  } catch (error) {
    console.error('Erreur récupération demandes de livraison :', error);
    res.status(500).json({ message: "Erreur serveur." });
  }
}

static async getDeliveryRequests(req, res) {
  try {
    const requests = await DeliveryRequestModel.getAllVisible();
    console.log('Demandes de livraison récupérées :', requests);
    res.status(200).json(requests);
  } catch (error) {
    console.error('Erreur récupération demandes de livraison :', error);
    res.status(500).json({ message: "Erreur serveur." });
  }
}
}

module.exports = DeliveryRequestController;