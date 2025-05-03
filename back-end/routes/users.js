
const express = require("express");
const router = express.Router();
const { getUserProfile, updateUserGenres } = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.get("/me", getUserProfile);
router.put("/update-genres", updateUserGenres);

module.exports = router;
