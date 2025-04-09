const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Access granted to protected route",
    user: req.user
  });
});

module.exports = router;
