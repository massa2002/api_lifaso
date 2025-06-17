const PaiementModel = require('../models/paiementModel');

class PaiementController {
  // Débiter le solde (déjà fait dans DeliveryRequestController)
  // Ici, on crédite le solde de l'utilisateur
 static async updateWallet(req, res) {
    try {
     const userId = req.userId;
     console.log('ID utilisateur pour le débit du wallet :', userId);
      const { montant } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "userId requis dans la requête." });
      }
      if (!montant || isNaN(montant)) {
        return res.status(400).json({ message: "Montant valide requis." });
      }

      await PaiementModel.updateWallet(userId, parseFloat(montant));
      return res.status(200).json({ message: "Solde débité avec succès." });
    } catch (error) {
      console.error('Erreur débit wallet :', error);
      res.status(400).json({ message: error.message || "Erreur serveur." });
    }
  }
  static async addToWallet(req, res) {
  try {
    const userId = req.userId; // ✅ Toujours comme ça
    const { montant } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId requis dans la requête." });
    }
    if (!montant || isNaN(montant)) {
      return res.status(400).json({ message: "Montant valide requis." });
    }

    const success = await PaiementModel.addToWallet(userId, parseFloat(montant));
    if (success) {
      return res.status(200).json({ message: "Solde crédité avec succès." });
    } else {
      return res.status(500).json({ message: "Erreur lors du crédit du solde." });
    }
  } catch (error) {
    console.error('Erreur crédit wallet :', error);
    res.status(500).json({ message: error.message || "Erreur serveur." });
  }
}

static async getWalletById(req, res) {
  try {
    const userId = req.params.id;
    const wallet = await PaiementModel.getWalletById(userId);
    if (!wallet) {
      return res.status(404).json({ message: "Wallet non trouvé." });
    }
    console.log('Wallet récupéré pour l\'utilisateur:', userId, wallet);
    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur serveur." });
  }
}

static async getAllWallets(req, res) {
  try {
    const wallets = await PaiementModel.getAllWallets();
    res.status(200).json(wallets);
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur serveur." });
  }
}
}

module.exports = PaiementController;