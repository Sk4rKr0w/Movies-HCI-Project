const supabase = require("../supabaseClient");

const RemoveMembers = async (req, res) => {
  const { groupId, userId } = req.body;

  if (!groupId || !userId) return res.status(400).json({ error: "groupId e userId richiesti per la ricerca." });

  try {
    // Recupera il gruppo attuale
    const { data: groupData, error: fetchError } = await supabase
      .from("groups")
      .select("users")
      .eq("id", groupId)
      .single();

    if (fetchError) throw fetchError;

    const currentUsers = groupData.users || [];

    // Rimuovi l'utente se presente
    const updatedUsers = currentUsers.filter(id => id !== userId);

    const { error: updateError } = await supabase
      .from("groups")
      .update({ users: updatedUsers })
      .eq("id", groupId);

    if (updateError) throw updateError;

    res.status(200).json({ message: "Utente rimosso con successo" });
  } catch (err) {
    console.error("Errore rimozione utente dal gruppo:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

module.exports = { RemoveMembers };
