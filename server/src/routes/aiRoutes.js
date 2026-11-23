const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const upload = require('../middleware/upload');

// Text & Proximity AI
router.post('/suggest', aiController.suggest);
router.post('/assess-emergency', aiController.assessEmergency);
router.post('/check-duplicate', aiController.checkDuplicate);

// YOLO11n Computer Vision AI
router.post('/yolo11-detect', upload.single('photo'), aiController.detectYolo11);
router.post('/yolo-detect', upload.single('photo'), aiController.detectYolo11);
router.get('/yolo-info', aiController.getYoloModelInfo);

module.exports = router;
