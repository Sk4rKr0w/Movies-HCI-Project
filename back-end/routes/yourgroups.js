const express = require('express');
const router = express.Router();
const { yourGroups } = require('../controllers/yourGroupController');

// Rotta per inviare la richiesta di contatto
router.get('/yourgroups', yourGroups);

module.exports = router;
