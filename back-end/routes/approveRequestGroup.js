const express = require("express");
const router = express.Router();
const { approveRequest } = require("../controllers/approveRequestGroupController");

router.post("/approve", approveRequest);

module.exports = router;
