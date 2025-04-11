const express = require('express');
const router = express.Router();
const { profileGroup, deleteGroup } = require("../controllers/profileGroupController");

router.get("/profilegroup", profileGroup);
router.delete("/delete", deleteGroup);

module.exports = router;
 