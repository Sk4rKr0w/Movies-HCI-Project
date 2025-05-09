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

  const startVotingPhase = async (req, res) => {
    const { groupId } = req.body;
  
    if (!groupId) return res.status(400).json({ error: "groupId mancante" });
  
    const { error } = await supabase
      .from("groups")
      .update({ voting_status: "voting" })
      .eq("id", groupId);
  
    if (error) {
      console.error("Errore durante il cambio di fase:", error);
      return res.status(500).json({ error: "Errore interno" });
    }
  
    res.status(200).json({ message: "Fase di voto avviata!" });
  };  

  const endVotingPhase = async (req, res) => {
    const { groupId } = req.body;
  
    if (!groupId) {
      return res.status(400).json({ error: "groupId mancante" });
    }
  
    const { error } = await supabase
      .from("groups")
      .update({ voting_status: "closed" })
      .eq("id", groupId);
  
    if (error) {
      console.error("Errore durante la chiusura della votazione:", error);
      return res.status(500).json({ error: "Errore durante la chiusura della votazione" });
    }
  
    return res.status(200).json({ message: "Fase di voto chiusa con successo." });
  };

  const resetGroupToOpen = async (req, res) => {
    const { groupId } = req.body;
  
    const { error } = await supabase
      .from("groups")
      .update({ voting_status: "open" })
      .eq("id", groupId);
  
    if (error) {
      console.error("Errore nel reset:", error);
      return res.status(500).json({ error: "Errore nel reset del gruppo." });
    }
  
    res.json({ message: "Gruppo riportato a stato open." });
  };

  module.exports = {
    getproposalactiveGroup,
    startproposalactiveGroup,
    startVotingPhase,
    endVotingPhase,
    resetGroupToOpen
  };
