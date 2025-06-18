const express = require('express');
const router = express.Router();
const DeliveryRequestController = require('../controllers/delivery_request_controler');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); 
const authMiddleware = require('../middlewares/authMiddleware');

// Créer une demande de livraison avec image
router.post(
  '/',
  authMiddleware, // Auth obligatoire
  upload.single('photo'), // le champ 'photo' vient du formulaire
  DeliveryRequestController.createDeliveryRequest
);

// Voir les demandes visibles
router.get('/visibility', DeliveryRequestController.getDeliveryRequests);

// Voir toutes les demandes
router.get('/', DeliveryRequestController.getAllDeliveryRequests);

// Supprimer une demande
router.delete('/:id', DeliveryRequestController.deleteDeliveryRequest);

// Mettre à jour l'étape de livraison
router.patch('/step/:id', DeliveryRequestController.updateDeliveryStep);

module.exports = router;
