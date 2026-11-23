const express = require('express');
const router = express.Router();
const talukController = require('../controllers/talukController');

router.get('/', talukController.getTaluks);

module.exports = router;
