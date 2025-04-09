// groupController.js
const supabase = require('../supabaseClient');

const profileGroup = async (req, res) => {
  const { id } = req.query;
  
  if (!id) return res.status(400).json({ error: 'ID del gruppo mancante' });

  try {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', id)  // Assicurati che il gruppo con l'ID richiesto esista
      .single();     // Ottieni un solo gruppo

    if (error) throw error;

    res.status(200).json({ group: data });
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero del gruppo' });
  }
};


module.exports = { profileGroup };
