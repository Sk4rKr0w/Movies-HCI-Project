const supabase = require("../supabaseClient");

const searchGroup = async (req, res) => {
  const { name } = req.query;

  if (!name) return res.status(400).json({ error: "Nome richiesto per la ricerca." });

  try {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .ilike("name", `%${name}%`);

    if (error) throw error;

    res.status(200).json({ groups: data });
  } catch (err) {
    console.error("Errore nella ricerca:", err);
    res.status(500).json({ error: "Errore nella ricerca dei gruppi." });
  }
};

module.exports = { searchGroup };
