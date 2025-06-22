const supabase = require("../supabaseClient");

const ProposingFilmGroup = async (req, res) => {
    const { groupId, userId, movie_id, sessionId } = req.body;

    // Validazione
    if (!groupId || !userId || !movie_id || !sessionId) {
        return res.status(400).json({ error: "Missing required data." });
    }

    // Controlla se l'utente ha già proposto lo stesso film
    const { data: existing, error: fetchError } = await supabase
        .from("film_proposals")
        .select("id")
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .eq("movie_id", movie_id)
        .eq("session_id", sessionId)
        .maybeSingle();

    if (fetchError) {
        console.error("Errore during checking for duplicates:", fetchError);
        return res.status(500).json({ error: "Internal Error." });
    }

    if (existing) {
        return res
            .status(400)
            .json({ error: "You have already proposed this film." });
    }

    // Inserisci la proposta
    const { error } = await supabase.from("film_proposals").insert([
        {
            group_id: groupId,
            user_id: userId,
            movie_id: movie_id,
            session_id: sessionId,
        },
    ]);

    if (error) {
        console.error("Error during insertion:", error);
        return res.status(500).json({ error: "Errore while proposing." });
    }

    res.status(200).json({ message: "Film proposed successfully." });
};

module.exports = { ProposingFilmGroup };
