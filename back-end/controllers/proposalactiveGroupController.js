const supabase = require("../supabaseClient");

const getproposalactiveGroup = async (req, res) => {
  const { groupId } = req.query;

  if (!groupId) {
    return res.status(400).json({ error: "groupId richiesto" });
  }

  const { data, error } = await supabase
    .from("proposal_sessions")
    .select("*")
    .eq("group_id", groupId)
    .eq("status", "proposing")
    .order("created_at", { ascending: false }) // nel caso ce ne siano più
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Errore nel recupero della sessione attiva:", error);
    return res.status(500).json({ error: "Errore interno" });
  }

  res.status(200).json({ session: data || null });
};
const startproposalactiveGroup = async (req, res) => {
    const { groupId } = req.body;
  
    if (!groupId) {
      return res.status(400).json({ error: "groupId richiesto" });
    }
  
    // Crea una nuova sessione di proposta
    const { data, error } = await supabase
      .from("proposal_sessions")
      .insert([{ group_id: groupId, status: "proposing" }])
      .select()
      .maybeSingle();
  
    if (error) {
      console.error("Errore nella creazione della sessione:", error);
      return res.status(500).json({ error: "Errore interno" });
    }
  
    // (Opzionale) aggiorna lo stato del gruppo a 'proposing'
    await supabase
      .from("groups")
      .update({ voting_status: "proposing" })
      .eq("id", groupId);
  
    res.status(201).json({ session: data });
  };
  
  module.exports = {
    getproposalactiveGroup,
    startproposalactiveGroup,
  };
