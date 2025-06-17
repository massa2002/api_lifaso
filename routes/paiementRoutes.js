const express = require('express');
const router = express.Router();
const PaiementController = require('../controllers/paiementcontroller');
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware pour l'authentification

// Route pour débiter le solde du wallet
router.post('/debit', authMiddleware, PaiementController.updateWallet);

// Route pour créditer le solde du wallet
router.post('/credit' , authMiddleware, PaiementController.addToWallet);

// ...existing code...

// Récupérer le wallet d'un utilisateur par son id
router.get('/get/:id', authMiddleware, PaiementController.getWalletById);

// Récupérer tous les wallets
router.get('/wallet', authMiddleware, PaiementController.getAllWallets);



module.exports = router;