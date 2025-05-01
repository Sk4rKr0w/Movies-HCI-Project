const supabase = require("../supabaseClient");

// Aggiunge un film allo storico (solo se non esiste già)
const addToHistory = async (req, res) => {
  const { movie_id, title, poster_path, overview } = req.body;
  const user_id = req.user?.id;

  console.log("🎬 Dati ricevuti dal client:", {
    movie_id,
    title,
    poster_path,
    overview,
    user_id,
  });

  // Verifica duplicati
  const existing = await supabase
    .from("watched_movies")
    .select("id")
    .eq("user_id", user_id)
    .eq("movie_id", movie_id)
    .maybeSingle();

  if (existing.data) {
    return res.status(409).json({ message: "🎥 Film già nello storico" });
  }

  // Inserimento
  const { error } = await supabase.from("watched_movies").insert([
    { user_id, movie_id, title, poster_path, overview }
  ]);

  if (error) {
    console.error("❌ Errore Supabase:", error);
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: "✅ Film aggiunto allo storico" });
};

// Recupera lo storico dell’utente
const getHistory = async (req, res) => {
  const user_id = req.user?.id;
  console.log("📥 USER ID ricevuto:", user_id);

  const { data, error } = await supabase
    .from("watched_movies")
    .select("*")
    .eq("user_id", user_id)
    .order("watched_at", { ascending: false });

  if (error) {
    console.error("❌ Errore Supabase:", error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
};

// Rimuove un film dallo storico
const removeFromHistory = async (req, res) => {
  const user_id = req.user?.id;
  const movie_id = req.query.movieId;

  if (!movie_id) {
    return res.status(400).json({ error: "movieId mancante nella query" });
  }

  const { error } = await supabase
    .from("watched_movies")
    .delete()
    .eq("user_id", user_id)
    .eq("movie_id", movie_id);

  if (error) {
    console.error("❌ Errore Supabase:", error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ message: "❌ Film rimosso dallo storico" });
};

module.exports = { addToHistory, getHistory, removeFromHistory };
