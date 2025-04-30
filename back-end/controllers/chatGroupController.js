const supabase = require("../supabaseClient");

// Aggiunge un messaggio alla chat
const AddMessage = async (req, res) => {
  const { groupId, senderId, content } = req.body;

  if (!groupId || !senderId || !content) {
    return res.status(400).json({ error: "Dati mancanti." });
  }

  const { error } = await supabase
    .from("messages")
    .insert([{ group_id: groupId, sender_id: senderId, content }]);

  if (error) {
    console.error("Errore durante l'inserimento del messaggio:", error);
    return res.status(500).json({ error: "Errore interno del server." });
  }

  res.status(200).json({ message: "Messaggio inviato." });
};

// Recupera tutti i messaggi di un gruppo
const ListMessages = async (req, res) => {
  const { groupId } = req.query;

  if (!groupId) {
    return res.status(400).json({ error: "groupId richiesto." });
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*, sender:users(username)")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Errore nel recupero dei messaggi:", error);
    return res.status(500).json({ error: "Errore interno del server." });
  }

  res.status(200).json({ messages: data });
};

module.exports = { AddMessage, ListMessages };
