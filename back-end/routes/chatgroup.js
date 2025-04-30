const express = require('express');
const router = express.Router();
const { AddMessage, ListMessages } = require('../controllers/chatGroupController');

// Rotta per inviare la richiesta di contatto
router.post('/addMessage', AddMessage);
router.get('/listMessages', ListMessages);

module.exports = router;
