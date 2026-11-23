const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, requireRoles } = require('../middleware/auth');

router.get('/summary', analyticsController.getSummary);
router.get('/taluks', analyticsController.getTalukStats);
router.get('/leaderboard', analyticsController.getLeaderboard);
router.get('/export-csv', authenticate, requireRoles('ADMIN', 'OFFICER'), analyticsController.exportCsv);

module.exports = router;
