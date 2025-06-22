const supabase = require("../supabaseClient");

const ProposedOthersFilmGroup = async (req, res) => {
    const { sessionId, excludeUserId } = req.query;

    if (!sessionId) {
        return res.status(400).json({ error: "sessionId required" });
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
        console.error("Error while retrieving:", error);
        return res.status(500).json({ error: "Internal Error" });
    }

    res.status(200).json({ proposals: data });
};

module.exports = { ProposedOthersFilmGroup };
