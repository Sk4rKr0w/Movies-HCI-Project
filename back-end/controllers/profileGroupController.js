const supabase = require("../supabaseClient");

const profileGroup = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Group ID is required" });
  }

  try {
    // 1) Prendo tutti i dati del gruppo
    const { data: groupData, error: groupError } = await supabase
      .from("groups")
      .select("*")
      .eq("id", id)
      .single();
    if (groupError) throw groupError;

    // 2) Prendo lo username dell'owner
    const { data: ownerData, error: ownerError } = await supabase
      .from("users")
      .select("username")
      .eq("id", groupData.owner)
      .single();
    if (ownerError) throw ownerError;

    // 3) Recupero **id, username e avatar_url** di ciascun membro
    const { data: membersData, error: membersError } = await supabase
      .from("users")
      .select("id, username, avatar_url")
      .in("id", groupData.users);  // groupData.users è l'array di user IDs
    if (membersError) throw membersError;

    // Infine restituisco tutto assieme
    res.status(200).json({
      group: {
        ...groupData,
        owner_username: ownerData.username,
        members: membersData,
      }
    });
  } catch (err) {
    console.error("Errore nel recupero del gruppo:", err);
    res.status(500).json({ error: "Errore nel recupero dei dettagli del gruppo" });
  }
};

const deleteGroup = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Group ID is required" });

  try {
    const { error } = await supabase.from("groups").delete().eq("id", id);
    if (error) throw error;

    res.status(200).json({ message: "Gruppo eliminato con successo" });
  } catch (err) {
    console.error("Errore nella cancellazione del gruppo:", err);
    res.status(500).json({ error: "Errore durante l'eliminazione" });
  }
};

module.exports = { profileGroup, deleteGroup };
