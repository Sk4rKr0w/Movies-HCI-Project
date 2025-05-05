const express = require("express");
const router = express.Router();
const { addVote, getMyVotes } = require("../controllers/voteGroupController");

router.post("/add", addVote);
router.get("/myvotes", getMyVotes);

module.exports = router;
