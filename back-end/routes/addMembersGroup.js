const express = require('express');
const router = express.Router();
const { AddMembers } = require('../controllers/addMembersGroupController');

// Rotta per inviare la richiesta di contatto
router.post('/addMembersGroup', AddMembers);

module.exports = router;
