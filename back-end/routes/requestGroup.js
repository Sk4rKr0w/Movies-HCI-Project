const express = require("express");
const router = express.Router();
const { sendRequestToGroup } = require("../controllers/requestGroupController");

router.post("/send", sendRequestToGroup);

module.exports = router;
