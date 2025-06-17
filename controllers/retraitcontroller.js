

const RetraitModel = require('../models/retrait_model');

class RetraitController {
  static async createRetrait(req, res) {
    try {
      const userId = req.userId; // injecté par le middleware
      const { numero_retrait, somme, moyen_paiement } = req.body;

      if (!numero_retrait || !somme || !moyen_paiement) {
        return res.status(400).json({ message: "Tous les champs sont requis." });
      }

      const retraitData = {
        userId,
        numero_retrait,
        somme: parseFloat(somme),
        moyen_paiement,
        date: new Date()
      };

      const retrait = await RetraitModel.createRetrait(retraitData);
      res.status(201).json({ retrait });
    } catch (error) {
      console.error('Erreur création retrait :', error);
      res.status(500).json({ message: "Erreur serveur." });
    }
  }

  static async getMyRetraits(req, res) {
    try {
      const userId = req.userId;
      const retraits = await RetraitModel.getAllRetraitsByUser(userId);
      res.status(200).json({ retraits });
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur." });
    }
  }
}

module.exports = RetraitController;