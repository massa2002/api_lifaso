const DeliveryRequestModel = require('../models/delivery_requestModel');
const { uploadImageToStorage } = require('../utils/storageUtil');
const PaiementModel = require('../models/paiementModel');

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
        userId
      } = req.body;

      let photoUrl = '';
      if (req.file) {
        photoUrl = await uploadImageToStorage(req.file);
      }

      // Si paiement_effectue est true, on met à jour le wallet de l'utilisateur
      if ((paiement_effectue === 'true' || paiement_effectue === true) && userId) {
        try {
          await PaiementModel.updateWallet(userId, parseFloat(prix) || 0);
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
        etape: 'publier' // Ajout du champ étape à la création
      });

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
      const { etape } = req.body; // exemple: "acceptee", "en_cours", "livree", etc.

      if (!etape) {
        return res.status(400).json({ message: "Le champ 'etape' est requis." });
      }

      const updated = await DeliveryRequestModel.updateStep(id, etape);
      res.status(200).json({ message: "Étape mise à jour", delivery_request: updated });
    } catch (error) {
      console.error('Erreur mise à jour étape livraison :', error);
      res.status(500).json({ message: "Erreur serveur." });
    }
  }
}

module.exports = DeliveryRequestController;