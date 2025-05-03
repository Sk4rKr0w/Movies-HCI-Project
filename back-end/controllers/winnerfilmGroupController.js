const supabase = require("../supabaseClient");

const getWinner = async (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId mancante" });
  }

  const { data, error } = await supabase
    .from("film_votes")
    .select("movie_id, count:movie_id", { count: "exact" })
    .eq("session_id", sessionId)
    .group("movie_id")
    .order("count", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Errore nel calcolo del vincitore:", error);
    return res.status(500).json({ error: "Errore interno" });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ error: "Nessun voto trovato" });
  }

  return res.status(200).json({ winnerMovieId: data[0].movie_id });
};

module.exports = getWinner;
