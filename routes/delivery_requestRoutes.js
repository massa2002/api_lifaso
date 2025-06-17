const express = require('express');
const router = express.Router();
const DeliveryRequestController = require('../controllers/delivery_request_controler');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const authMiddleware = require('../middlewares/authMiddleware'); // Ajoute ceci

router.post(
  '/',
  authMiddleware, // Ajoute le middleware ici
  upload.single('photo'),
  DeliveryRequestController.createDeliveryRequest
);
router.get('/visibility', DeliveryRequestController.getDeliveryRequests);
router.get('/', DeliveryRequestController.getAllDeliveryRequests);
router.delete('/:id', DeliveryRequestController.deleteDeliveryRequest);
router.patch('/step/:id', DeliveryRequestController.updateDeliveryStep);

module.exports = router;