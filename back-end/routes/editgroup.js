const express = require('express');
const router = express.Router();
const { editGroup } = require('../controllers/editGroupController');

// Rotta per inviare la richiesta di contatto
router.post('/editgroup', editGroup);

module.exports = router;
