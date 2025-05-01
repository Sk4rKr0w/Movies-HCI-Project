
const express = require("express");
const router = express.Router();
const { getFavorites, addFavorite, removeFavorite } = require("../controllers/favoritesController");
const authenticateToken = require("../middleware/authMiddleware");

// Richiede autenticazione per tutte le rotte
router.use(authenticateToken);

// GET /api/favorites → Ottiene tutti i preferiti
router.get("/", getFavorites);

// POST /api/favorites → Aggiunge un nuovo film ai preferiti (richiede req.body.movie)
router.post("/", addFavorite);

// DELETE /api/favorites?movieId=ID → Rimuove film dai preferiti
router.delete("/", removeFavorite);

module.exports = router;
