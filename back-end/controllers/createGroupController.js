const supabase = require('../supabaseClient');

const createGroup = async (req, res) => {
  const { name, description, users, owner, genres } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: "Name e description sono obbligatori" });
  }

  try {
    const { data, error } = await supabase
      .from('groups')
      .insert([{name, description, owner, users: [owner], genres}])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ group: data });
  } catch (err) {
    console.error("Errore nella creazione del gruppo:", err);
    return res.status(500).json({ error: "Errore interno del server" });
  }
};

module.exports = { createGroup };
