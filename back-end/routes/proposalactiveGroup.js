const express = require("express");
const router = express.Router();
const { getproposalactiveGroup, startproposalactiveGroup, startVotingPhase, endVotingPhase, resetGroupToOpen } = require("../controllers/proposalactiveGroupController");

router.get("/getproposalactivegroup", getproposalactiveGroup);
router.post("/startproposalactivegroup", startproposalactiveGroup);
router.post("/startvoting", startVotingPhase);
router.post("/closevoting", endVotingPhase);
router.post("/resetgroup", resetGroupToOpen);

module.exports = router;
