const express = require('express');
const router = express.Router();
const { createGroup } = require('../controllers/createGroupController');

// Rotta per inviare la richiesta di contatto
router.post('/creategroup', createGroup);

module.exports = router;
