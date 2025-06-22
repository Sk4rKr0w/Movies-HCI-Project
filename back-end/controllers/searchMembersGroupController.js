const supabase = require("../supabaseClient");

const SearchMembers = async (req, res) => {
    const { username } = req.query;

    if (!username)
        return res.status(400).json({ error: "Username required for search." });

    try {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .ilike("username", `%${username}%`);

        if (error) throw error;

        res.status(200).json({ users: data });
    } catch (err) {
        console.error("Error while searching users:", err);
        res.status(500).json({ error: "Error while searching." });
    }
};

module.exports = { SearchMembers };
