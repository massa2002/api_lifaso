const express = require('express');
const { check, validationResult } = require('express-validator');
const UserController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); 


const router = express.Router();


// Les autres routes nécessitent une authentification
router.get('/', authMiddleware, UserController.getAllUsers);
router.get('/:id', authMiddleware, UserController.getUserById);
// Exemple à ajouter dans ton fichier de routes
router.post('/simple', UserController.createSimpleUser);
router.delete('/:id', authMiddleware, UserController.deleteUser);
router.put('/:id', authMiddleware, upload.single('photo'), UserController.updateUser);

module.exports = router;