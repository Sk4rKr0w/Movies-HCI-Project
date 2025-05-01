const supabase = require("../supabaseClient");

// Recupera tutti i film preferiti
async function getFavorites(req, res) {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from("favorites")
    .select("movies")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return res.status(400).json({ error: error.message });

  // Se la riga non esiste, la creiamo
  if (!data) {
    const { error: insertError } = await supabase
      .from("favorites")
      .insert([{ user_id: userId, movies: [] }]);

    if (insertError) {
      console.error("Errore inserimento iniziale (getFavorites):", insertError);
      return res.status(500).json({ error: insertError.message });
    }

    return res.json({ movies: [] });
  }

  res.json({ movies: data.movies || [] });
}

// Aggiunge un film ai preferiti
async function addFavorite(req, res) {
  const userId = req.user.id;
  const newMovie = req.body.movie;

  console.log("POST userId:", userId);
  console.log("newMovie:", newMovie);

  const { data, error } = await supabase
    .from("favorites")
    .select("movies")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return res.status(400).json({ error: error.message });

  // Se la riga non esiste, la creiamo
  if (!data) {
    const { error: insertError } = await supabase
      .from("favorites")
      .insert([{ user_id: userId, movies: [newMovie] }]);

    if (insertError) {
      console.error("Errore inserimento (addFavorite):", insertError);
      return res.status(500).json({ error: insertError.message });
    }

    return res.status(201).json({ movies: [newMovie] });
  }

  const currentMovies = data.movies || [];
  const exists = currentMovies.some(
    (m) => m.id.toString() === newMovie.id.toString()
  );
  if (exists) return res.status(409).json({ error: "Film già nei preferiti" });

  const updated = [...currentMovies, newMovie];

  const { error: updateError } = await supabase
    .from("favorites")
    .update({ movies: updated })
    .eq("user_id", userId);

  if (updateError) {
    console.error("Errore update Supabase:", updateError);
    return res.status(500).json({ error: updateError.message });
  }

  res.json({ movies: updated });
}

// Rimuove un film dai preferiti
async function removeFavorite(req, res) {
  const userId = req.user.id;
  const movieId = parseInt(req.query.movieId, 10);

  const { data, error } = await supabase
    .from("favorites")
    .select("movies")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return res.status(400).json({ error: error.message });

  if (!data)
    return res.status(404).json({ error: "Nessun preferito da cui rimuovere" });

  const updated = (data.movies || []).filter((m) => m.id !== movieId);

  const { error: updateError } = await supabase
    .from("favorites")
    .update({ movies: updated })
    .eq("user_id", userId);

  if (updateError) {
    console.error("Errore rimozione (removeFavorite):", updateError);
    return res.status(500).json({ error: updateError.message });
  }

  res.json({ movies: updated });
}

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
};
