const express = require('express');
const router = express.Router();
const { ProposingGroup } = require('../controllers/proposingGroupController');

// Rotta per inviare la richiesta di contatto
router.post('/proposinggroup', ProposingGroup);

module.exports = router;
