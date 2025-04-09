const express = require('express');
const router = express.Router();
const { searchGroup } = require('../controllers/searchGroupController');

// Rotta per inviare la richiesta di contatto
router.get('/searchgroup', searchGroup);

module.exports = router;
