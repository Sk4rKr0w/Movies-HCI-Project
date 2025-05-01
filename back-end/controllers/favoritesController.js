const supabase = require("../supabaseClient");

// Aggiunge un preferito per l'utente autenticato
async function addFavorite(req, res) {
  const userId  = req.user.id;          // preso dal middleware di auth
  const { movieId } = req.body;

  const { data, error } = await supabase
    .from("favorites")
    .insert([{ user_id: userId, movie_id: movieId }])
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ favorite: data });
}

// Rimuove un preferito
async function removeFavorite(req, res) {
  const userId  = req.user.id;
  const movieId = parseInt(req.query.movieId, 10);

  const { error } = await supabase
    .from("favorites")
    .delete()
    .match({ user_id: userId, movie_id: movieId });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
}

// Controlla se questo film è già nei preferiti
async function checkFavorite(req, res) {
  const userId  = req.user.id;
  const movieId = parseInt(req.query.movieId, 10);

  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .match({ user_id: userId, movie_id: movieId });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ isFavorite: data.length > 0 });
}

async function getAllFavorites(req, res) {
    const userId = req.user.id;
  
    const { data, error } = await supabase
      .from("favorites")
      .select("movie_id")
      .eq("user_id", userId);
  
    if (error) return res.status(400).json({ error: error.message });
  
    // Prende dettagli da TMDB
    const results = [];
    for (const item of data) {
      const tmdbRes = await fetch(`https://api.themoviedb.org/3/movie/${item.movie_id}?api_key=${process.env.TMDB_API_KEY}`);
      if (tmdbRes.ok) {
        const movieDetails = await tmdbRes.json();
        results.push(movieDetails);
      }
    }
  
    res.json(results);
  }

module.exports = { addFavorite, removeFavorite, checkFavorite, getAllFavorites };
