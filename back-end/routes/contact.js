const express = require('express');
const router = express.Router();
const { submitContactRequest } = require('../controllers/contactController');

// Rotta per inviare la richiesta di contatto
router.post('/contact', submitContactRequest);

module.exports = router;
