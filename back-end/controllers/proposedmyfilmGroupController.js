const supabase = require("../supabaseClient");

const ProposedMyFilmGroup = async (req, res) => {
  const { groupId, userId, sessionId } = req.query;

  if (!groupId || !userId) {
    return res.status(400).json({ error: "Dati richiesti mancanti." });
  }

  const { data, error } = await supabase
    .from("film_proposals")
    .select("movie_id")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .eq("session_id", sessionId);

  if (error) {
    console.error("Errore nel fetch:", error);
    return res.status(500).json({ error: "Errore interno." });
  }

  res.status(200).json({ proposals: data });
};

module.exports = { ProposedMyFilmGroup };
