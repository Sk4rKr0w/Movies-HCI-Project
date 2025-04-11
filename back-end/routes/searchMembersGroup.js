const express = require('express');
const router = express.Router();
const { SearchMembers } = require('../controllers/searchMembersGroupController');

// Rotta per inviare la richiesta di contatto
router.get('/searchMembersGroup', SearchMembers);

module.exports = router;
