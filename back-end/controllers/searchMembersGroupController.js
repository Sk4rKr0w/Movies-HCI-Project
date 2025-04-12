const supabase = require("../supabaseClient");

const SearchMembers = async (req, res) => {
  const { username } = req.query;

  if (!username) return res.status(400).json({ error: "Username richiesto per la ricerca." });

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .ilike("username", `%${username}%`);

    if (error) throw error;

    res.status(200).json({ users: data });
  } catch (err) {
    console.error("Errore nella ricerca degli utenti:", err);
    res.status(500).json({ error: "Errore nella ricerca degli utenti." });
  }
};

module.exports = { SearchMembers };
