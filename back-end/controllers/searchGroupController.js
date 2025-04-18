const supabase = require("../supabaseClient");

const searchGroup = async (req, res) => {
  const { name, userId } = req.query;

  if (!name || !userId) return res.status(400).json({ error: "name e userId richiesti." });

  try {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .ilike("name", `%${name}%`);

    if (error) throw error;

    // Filtra i gruppi escludendo quelli che già contengono userId
    const filteredGroups = data.filter(group => {
      const users = group.users || [];
      return !users.includes(userId);
    });

    if (filteredGroups.length === 0) {
      return res.status(200).json({
        groups: [],
        message: "Nessun gruppo trovato. Riprova."
      });
    }

    res.status(200).json({ groups: filteredGroups, message: null });
  } catch (err) {
    console.error("Errore nella ricerca:", err);
    res.status(500).json({ error: "Errore nella ricerca dei gruppi." });
  }
};

module.exports = { searchGroup };
