const express = require('express');
const router = express.Router();
const { ProposedMyFilmGroup } = require('../controllers/proposedmyfilmGroupController');

// Rotta per inviare la richiesta di contatto
router.get('/proposedmyfilmgroup', ProposedMyFilmGroup);

module.exports = router;
