const express = require("express");
const router = express.Router();
const { getproposalactiveGroup, startproposalactiveGroup } = require("../controllers/proposalactiveGroupController");

router.get("/getproposalactivegroup", getproposalactiveGroup);
router.post("/startproposalactivegroup", startproposalactiveGroup);

module.exports = router;
