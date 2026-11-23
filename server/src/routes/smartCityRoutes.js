const express = require('express');
const router = express.Router();
const smartCityController = require('../controllers/smartCityController');

// Live CCTV Surveillance & AI Detection Feed
router.get('/cctv', smartCityController.getCctvStreams);
router.post('/cctv/auto-report', smartCityController.autoCreateIssueFromCctv);

// Smart City IoT Telemetry Grid
router.get('/iot', smartCityController.getIotSensors);
router.post('/iot/trigger-alert', smartCityController.triggerIotSensorAlert);

// Predictive Road Infrastructure Health & Degradation Index
router.get('/predictive', smartCityController.getPredictiveRoadHealth);

module.exports = router;
