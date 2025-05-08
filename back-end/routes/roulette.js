const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
// GET: lista film della roulette
router.get('/:groupId', async (req, res) => {
  const groupId = parseInt(req.params.groupId);

  const { data, error } = await supabase
    .from('groups')
    .select('roulette_movies')
    .eq('id', groupId)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ movies: data.roulette_movies || [] });
});

// POST: salva lista film della roulette (solo se owner)
router.post('/:groupId', async (req, res) => {
  const groupId = parseInt(req.params.groupId);
  const { movies, userId } = req.body;

  // Verifica se è owner
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('owner')
    .eq('id', groupId)
    .single();

  if (groupError) return res.status(500).json({ error: groupError.message });

  if (group.owner !== userId) {
    return res.status(403).json({ error: 'Solo il proprietario può aggiornare la roulette.' });
  }

  const { error } = await supabase
    .from('groups')
    .update({ roulette_movies: movies })
    .eq('id', groupId);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ success: true });
});

module.exports = router;
