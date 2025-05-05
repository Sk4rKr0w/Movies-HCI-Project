const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');

// GET roulette film list
router.get('/:groupId', async (req, res) => {
  const { groupId } = req.params;
  const { data, error } = await supabase
    .from('groups')
    .select('roulette_movies')
    .eq('id', groupId)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ movies: data.roulette_movies || [] });
});

// POST new roulette list (owner only)
router.post('/:groupId', async (req, res) => {
  const { groupId } = req.params;
  const { movies } = req.body;

  const { error } = await supabase
    .from('groups')
    .update({ roulette_movies: movies })
    .eq('id', groupId);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true });
});

module.exports = router;
