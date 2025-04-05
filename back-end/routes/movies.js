const express = require("express");
const axios = require("axios");
const router = express.Router();

const API_KEY = process.env.TMDB_API_KEY;

//Endpoint per film popolari
router.get("/popular", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/popular`,
      {
        params: {
          api_key: API_KEY,
          language: "it-IT",
          page: 1,
        },
      }
    );
    res.json(response.data.results);
  } catch (error) {
    res.status(500).json({ error: "Errore nel recupero dei film" });
  }
});

module.exports = router;
