const express = require('express');
const router = express.Router();
const { profileGroup } = require('../controllers/profileGroupController');

// Rotta per inviare la richiesta di contatto
router.get('/profilegroup', profileGroup);

module.exports = router;
 