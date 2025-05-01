const express = require("express");
const router = express.Router();
const { addFavorite, removeFavorite, checkFavorite, getAllFavorites } = require("../controllers/favoritesController");
const authenticateToken = require("../middleware/authMiddleware");

// Tutte queste rotte richiedono l’utente autenticato
router.use(authenticateToken);

router.post("/", addFavorite);
router.delete("/", removeFavorite);
router.get("/", checkFavorite);
router.get("/all", getAllFavorites);

// Aggiungi la nuova rotta con percorso diverso per non sovrapporsi
router.get("/list", async (req, res) => {
    const userId = req.user.id;
    const supabase = require("../supabaseClient");

    try {
        const { data, error } = await supabase
            .from('favorites')
            .select('movie_id')
            .eq('user_id', userId);

        if (error) throw error;

        res.status(200).json({ favorites: data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

module.exports = router;
