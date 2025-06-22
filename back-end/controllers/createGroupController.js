const supabase = require("../supabaseClient");

const createGroup = async (req, res) => {
    const { name, description, users, owner, genres, private } = req.body;

    if (!name || !description) {
        return res
            .status(400)
            .json({ error: "Name and description requested" });
    }

    try {
        const { data, error } = await supabase
            .from("groups")
            .insert([
                { name, description, owner, users: [owner], genres, private },
            ])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({ group: data });
    } catch (err) {
        console.error("Error while creating group:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { createGroup };
