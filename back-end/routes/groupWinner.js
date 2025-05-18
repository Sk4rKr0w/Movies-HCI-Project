const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

router.post('/:groupId', async (req, res) => {
  const { groupId } = req.params;
  const { winner } = req.body;

  const { error } = await supabase
    .from('groups')
    .update({ roulette_winner: winner })
    .eq('id', groupId);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true });
});

module.exports = router;
