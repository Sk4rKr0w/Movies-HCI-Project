const express = require('express');
const router = express.Router();
const { JoinGroup } = require('../controllers/joinGroupController');

// Rotta per inviare la richiesta di contatto
router.post('/joingroup', JoinGroup);

module.exports = router;
