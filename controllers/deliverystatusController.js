const DeliveryStatusModel = require('../models/deliverystatusModel');

class DeliveryStatusController {
  static async createStatus(req, res) {
    try {
      const { delivery_request_id } = req.body;
      if (!delivery_request_id) {
        return res.status(400).json({ message: "Le champ 'delivery_request_id' est requis." });
      }
      const status = await DeliveryStatusModel.createStatus(delivery_request_id);
      res.status(201).json(status);
    } catch (error) {
      console.error('Erreur création status livraison:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { etape } = req.body;
      if (!etape) {
        return res.status(400).json({ message: "Le champ 'etape' est requis." });
      }
      const updated = await DeliveryStatusModel.updateStatus(id, etape);
      res.status(200).json(updated);
    } catch (error) {
      console.error('Erreur mise à jour status livraison:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  }
}

module.exports = DeliveryStatusController;
