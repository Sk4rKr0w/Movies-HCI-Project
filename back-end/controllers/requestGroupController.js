const supabase = require("../supabaseClient");

const sendRequestToGroup = async (req, res) => {
  const { groupId, userId } = req.body;

  if (!groupId || !userId) {
    return res.status(400).json({ error: "Dati mancanti" });
  }

  try {
    // Recupera l'array esistente
    const { data: groupData, error: fetchError } = await supabase
      .from("groups")
      .select("pending_users")
      .eq("id", groupId)
      .single();

    if (fetchError) throw fetchError;

    const currentPending = groupData?.pending_users || [];
    if (currentPending.includes(userId)) {
      return res.status(400).json({ error: "Richiesta già inviata" });
    }

    const updated = [...currentPending, userId];

    const { error: updateError } = await supabase
      .from("groups")
      .update({ pending_users: updated })
      .eq("id", groupId);

    if (updateError) throw updateError;

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Errore aggiornamento pending_users:", err);
    res.status(500).json({ error: "Errore interno" });
  }
};

module.exports = { sendRequestToGroup };
