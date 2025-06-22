const supabase = require("../supabaseClient");

const approveRequest = async (req, res) => {
    const { groupId, userId } = req.body;

    if (!groupId || !userId) {
        return res.status(400).json({ error: "Missing Params." });
    }

    try {
        // 1. Ottieni il gruppo
        const { data: groupData, error: fetchError } = await supabase
            .from("groups")
            .select("pending_users, users")
            .eq("id", groupId)
            .single();

        if (fetchError) throw fetchError;

        const updatedPending = (groupData.pending_users || []).filter(
            (id) => id !== userId
        );
        const updatedMembers = [...(groupData.users || []), userId];

        // 2. Aggiorna il gruppo
        const { error: updateError } = await supabase
            .from("groups")
            .update({
                pending_users: updatedPending,
                users: updatedMembers,
            })
            .eq("id", groupId);

        if (updateError) throw updateError;

        res.status(200).json({ message: "User approved successfully." });
    } catch (error) {
        console.error("Error approving request:", error);
        res.status(500).json({ error: "Error during approval." });
    }
};

module.exports = { approveRequest };
