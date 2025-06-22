const supabase = require("../supabaseClient");

const getWinner = async (req, res) => {
    const { sessionId } = req.query;

    if (!sessionId) {
        return res.status(400).json({ error: "sessionId missing" });
    }

    const { data, error } = await supabase.rpc("get_winner", {
        session_uuid: sessionId,
    });

    if (error) {
        console.error("Error RPC Supabase:", error);
        return res
            .status(500)
            .json({ error: "Error while retrieving the winner." });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ error: "No vote found." });
    }

    res.json({ winner: data[0] });
};

module.exports = { getWinner };
