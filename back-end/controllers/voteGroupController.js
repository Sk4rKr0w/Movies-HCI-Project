const supabase = require("../supabaseClient");

const addVote = async (req, res) => {
    const { sessionId, userId, movie_id } = req.body;

    if (!sessionId || !userId || !movie_id) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Verifica se l'utente ha già votato questo film nella sessione
        const { data: existing, error: checkError } = await supabase
            .from("film_votes")
            .select("*")
            .eq("session_id", sessionId)
            .eq("user_id", userId)
            .eq("movie_id", movie_id)
            .single();

        if (checkError && checkError.code !== "PGRST116") {
            // Se errore non è "no rows found", allora è un vero errore
            throw checkError;
        }

        if (existing) {
            return res
                .status(409)
                .json({ error: "You have already voted this film" });
        }

        // Inserisce il voto
        const { error: insertError } = await supabase
            .from("film_votes")
            .insert([{ session_id: sessionId, user_id: userId, movie_id }]);

        if (insertError) throw insertError;

        res.status(201).json({ message: "Vote registered successfully" });
    } catch (error) {
        console.error("Error during the vote:", error);
        res.status(500).json({ error: "Error during the vote" });
    }
};

const getMyVotes = async (req, res) => {
    const { sessionId, userId } = req.query;

    if (!sessionId || !userId) {
        return res.status(400).json({ error: "Missing sessionId or userId" });
    }

    try {
        const { data, error } = await supabase
            .from("film_votes")
            .select("movie_id")
            .eq("session_id", sessionId)
            .eq("user_id", userId);

        if (error) throw error;

        res.status(200).json({ votes: data });
    } catch (err) {
        console.error("Error while retriving votes:", err);
        res.status(500).json({ error: "Error while retriving votes" });
    }
};

module.exports = { addVote, getMyVotes };
