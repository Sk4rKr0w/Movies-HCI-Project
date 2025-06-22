const supabase = require("../supabaseClient");

const getUserProfile = async (req, res) => {
    try {
        const user_id = req.user.id;

        const { data, error } = await supabase
            .from("users")
            .select("id, email, username, avatar_url, favorite_genres")
            .eq("id", user_id)
            .single();

        if (error) return res.status(500).json({ error: error.message });

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateUserGenres = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { favorite_genres } = req.body;

        const { data, error } = await supabase
            .from("users")
            .update({ favorite_genres })
            .eq("id", user_id)
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { getUserProfile, updateUserGenres };
