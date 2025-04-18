const express = require('express');
const router = express.Router();
const { LeaveGroup } = require('../controllers/leaveGroupController');

// Rotta per inviare la richiesta di contatto
router.post('/leavegroup', LeaveGroup);

module.exports = router;
