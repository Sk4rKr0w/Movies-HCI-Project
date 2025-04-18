const express = require('express');
const router = express.Router();
const { RemoveMembers } = require('../controllers/removeMembersGroupController');

// Rotta per inviare la richiesta di contatto
router.post('/removeMembersGroup', RemoveMembers);

module.exports = router;
