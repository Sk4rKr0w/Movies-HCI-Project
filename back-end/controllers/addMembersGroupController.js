const supabase = require("../supabaseClient");

const AddMembers = async (req, res) => {
    const { groupId, userId } = req.body;

    if (!groupId || !userId)
        return res
            .status(400)
            .json({ error: "groupId e userId requested for research." });

    try {
        // Recupera il gruppo attuale
        const { data: groupData, error: fetchError } = await supabase
            .from("groups")
            .select("users")
            .eq("id", groupId)
            .single();

        if (fetchError) throw fetchError;

        const currentUsers = groupData.users || [];

        // Evita duplicati
        if (currentUsers.includes(userId)) {
            return res
                .status(200)
                .json({ message: "User already in the group" });
        }

        const updatedUsers = [...currentUsers, userId];

        const { error: updateError } = await supabase
            .from("groups")
            .update({ users: updatedUsers })
            .eq("id", groupId);

        if (updateError) throw updateError;

        res.status(200).json({ message: "User successfully added" });
    } catch (err) {
        console.error("Error while adding user to the group:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { AddMembers };
