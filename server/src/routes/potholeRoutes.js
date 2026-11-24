const express = require('express');
const router = express.Router();
const potholeController = require('../controllers/potholeController');
const upload = require('../middleware/upload');

// Step 3 & 4: YOLO Computer Vision Detection & Severity Assessment
router.post('/detect', upload.single('photo'), potholeController.detect);

// Step 5 & 7: Create Pothole Report
router.post('/reports', potholeController.createReport);

// Step 8: View & Filter Pothole Reports
router.get('/reports', potholeController.getReports);

// Step 8: Update Pothole Repair Status
router.put('/reports/:id/status', potholeController.updateStatus);

// Step 8: Data Analysis & Statistical Summary
router.get('/stats', potholeController.getStats);

// Step 6: Geospatial Risk Mapping Markers
router.get('/map-markers', potholeController.getMapMarkers);

module.exports = router;
