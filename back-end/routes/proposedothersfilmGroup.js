const express = require('express');
const router = express.Router();
const { ProposedOthersFilmGroup } = require('../controllers/proposedothersfilmGroupController');

// Rotta per inviare la richiesta di contatto
router.get('/proposedothersfilmgroup', ProposedOthersFilmGroup);

module.exports = router;
