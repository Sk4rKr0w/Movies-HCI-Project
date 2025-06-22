const supabase = require("../supabaseClient");

const yourGroups = async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        const { data, error } = await supabase
            .from("groups")
            .select("*")
            .contains("users", [userId]);

        if (error) throw error;

        res.status(200).json({ groups: data });
    } catch (err) {
        console.error("Error while retrieving user groups:", err);
        res.status(500).json({ error: "Error while retrieving groups" });
    }
};

module.exports = { yourGroups };
