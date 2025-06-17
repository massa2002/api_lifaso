const express = require('express');
const router = express.Router();
const RetraitController = require('../controllers/retraitcontroller');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, RetraitController.createRetrait);
router.get('/all', authMiddleware, RetraitController.getMyRetraits);

module.exports = router;