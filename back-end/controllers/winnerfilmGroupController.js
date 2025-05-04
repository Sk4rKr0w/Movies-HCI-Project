const supabase = require("../supabaseClient");

const getWinner = async (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId mancante" });
  }

  const { data, error } = await supabase
  .rpc("get_winner", { session_uuid: sessionId });

if (error) {
  console.error("Errore RPC Supabase:", error);
  return res.status(500).json({ error: "Errore nel recupero del vincitore." });
}

if (!data || data.length === 0) {
  return res.status(404).json({ error: "Nessun voto trovato." });
}

res.json({ winner: data[0] });

};

module.exports = { getWinner };
