const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/suggest', aiController.suggest);
router.post('/assess-emergency', aiController.assessEmergency);
router.post('/check-duplicate', aiController.checkDuplicate);

module.exports = router;
