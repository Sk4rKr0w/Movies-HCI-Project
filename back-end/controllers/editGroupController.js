const supabase = require("../supabaseClient");

const editGroup = async (req, res) => {
  const { groupId, name, description, genres, private: isPrivate } = req.body;

  if (!groupId || !name || !description || !genres) {
    return res.status(400).json({ error: "Tutti i campi sono obbligatori." });
  }

  try {
    const { error } = await supabase
      .from("groups")
      .update({ name, description, genres, private: isPrivate })
      .eq("id", groupId);

    if (error) throw error;

    res.status(200).json({ message: "Gruppo aggiornato con successo" });
  } catch (err) {
    console.error("Errore modifica gruppo:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

module.exports = { editGroup };
