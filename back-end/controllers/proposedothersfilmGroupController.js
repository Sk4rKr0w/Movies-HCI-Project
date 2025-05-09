const supabase = require("../supabaseClient");

const ProposedOthersFilmGroup = async (req, res) => {
    const { sessionId, excludeUserId } = req.query;

    if (!sessionId) {
    return res.status(400).json({ error: "sessionId richiesto" });
    }

    let query = supabase
    .from("film_proposals")
    .select("movie_id, user_id")
    .eq("session_id", sessionId);

    if (excludeUserId) {
    query = query.neq("user_id", excludeUserId);
    }

    const { data, error } = await query;

    if (error) {
    console.error("Errore nel recupero:", error);
    return res.status(500).json({ error: "Errore interno" });
    }

    res.status(200).json({ proposals: data });

  };

module.exports = { ProposedOthersFilmGroup };
