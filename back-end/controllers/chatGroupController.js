const supabase = require("../supabaseClient");

// Aggiunge un messaggio alla chat
const AddMessage = async (req, res) => {
    const { groupId, senderId, content } = req.body;

    if (!groupId || !senderId || !content) {
        return res.status(400).json({ error: "Missing Data" });
    }

    const { error } = await supabase
        .from("messages")
        .insert([{ group_id: groupId, sender_id: senderId, content }]);

    if (error) {
        console.error("Error while inserting the message:", error);
        return res.status(500).json({ error: "Internal server error." });
    }

    res.status(200).json({ message: "Message Sent." });
};

// Recupera tutti i messaggi di un gruppo
const ListMessages = async (req, res) => {
    const { groupId } = req.query;

    if (!groupId) {
        return res.status(400).json({ error: "groupId required." });
    }

    const { data, error } = await supabase
        .from("messages")
        .select("*, sender:users(username)")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error while retrieving messages:", error);
        return res.status(500).json({ error: "Internal Server Error." });
    }

    res.status(200).json({ messages: data });
};

module.exports = { AddMessage, ListMessages };
