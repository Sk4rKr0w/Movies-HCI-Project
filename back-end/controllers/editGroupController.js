const supabase = require("../supabaseClient");

const editGroup = async (req, res) => {
    const { groupId, name, description, genres, private: isPrivate } = req.body;

    if (!groupId || !name || !description || !genres) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const { error } = await supabase
            .from("groups")
            .update({ name, description, genres, private: isPrivate })
            .eq("id", groupId);

        if (error) throw error;

        res.status(200).json({ message: "Group updated successfully" });
    } catch (err) {
        console.error("Error while update group:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { editGroup };
