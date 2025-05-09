const express = require('express');
const router = express.Router();
const { getWinner } = require('../controllers/winnerfilmGroupController');

// Rotta per inviare la richiesta di contatto
router.get('/getwinner', getWinner);

module.exports = router;
