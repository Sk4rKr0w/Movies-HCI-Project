const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');

router.get('/:groupId/owner', async (req, res) => {
  const { groupId } = req.params;

  const { data, error } = await supabase
    .from('groups')
    .select('owner')
    .eq('id', parseInt(groupId))  // 👈 fix qui
    .single();

  if (error) {
    console.error("❌ Supabase error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json({ ownerId: data.owner });
});

module.exports = router;
