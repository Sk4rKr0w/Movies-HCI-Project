const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/group/:groupId/owner
router.get('/:groupId/owner', async (req, res) => {
  const groupId = req.params.groupId;
  console.log("📥 Richiesta per groupId:", groupId);

  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  console.log("📤 Supabase data:", data);
  console.log("📤 Supabase error:", error);

  if (error || !data) {
    return res.status(500).json({ error: error?.message || 'Group not found' });
  }

  res.status(200).json({ ownerId: data.owner }); // ✅ assicurati di avere .status(200)
});

module.exports = router;
