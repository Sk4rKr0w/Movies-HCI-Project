const express = require("express");
const router = express.Router();
const {
  addToHistory,
  getHistory,
  removeFromHistory,
} = require("../controllers/historyController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.post("/", addToHistory);
router.get("/", getHistory);
router.delete("/", removeFromHistory);

module.exports = router;
