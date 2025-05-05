const express = require('express');
const router = express.Router();
const { ProposingFilmGroup } = require('../controllers/proposingfilmGroupController');

// Rotta per inviare la richiesta di contatto
router.post('/proposingfilmgroup', ProposingFilmGroup);

module.exports = router;
