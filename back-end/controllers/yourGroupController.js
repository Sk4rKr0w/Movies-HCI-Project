const supabase = require("../supabaseClient");

const yourGroups = async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

  try {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .contains("users", [userId]);

    if (error) throw error;

    res.status(200).json({ groups: data });
  } catch (err) {
    console.error("Errore nel recupero dei gruppi dell'utente:", err);
    res.status(500).json({ error: "Errore nel recupero dei gruppi" });
  }
};

module.exports = { yourGroups };
