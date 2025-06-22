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
    const { groupId, userId } = req.body;

    if (!groupId || !userId) {
        return res.status(400).json({ error: "groupId required" });
    }

    // Crea una nuova sessione di proposta
    const { data, error } = await supabase
        .from("proposal_sessions")
        .insert([
            {
                group_id: groupId,
                status: "proposing",
                proposal_starteruser: userId,
            },
        ])
        .select()
        .maybeSingle();

    if (error) {
        console.error("Error while creating session:", error);
        return res.status(500).json({ error: "Internal Error" });
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

    if (!groupId) return res.status(400).json({ error: "groupId missing" });

    const { error } = await supabase
        .from("groups")
        .update({ voting_status: "voting" })
        .eq("id", groupId);

    if (error) {
        console.error("Errore during phase change:", error);
        return res.status(500).json({ error: "Internal Error" });
    }

    res.status(200).json({ message: "Vote Phase Started!" });
};

const endVotingPhase = async (req, res) => {
    const { groupId } = req.body;

    if (!groupId) {
        return res.status(400).json({ error: "groupId missing" });
    }

    const { error } = await supabase
        .from("groups")
        .update({ voting_status: "closed" })
        .eq("id", groupId);

    if (error) {
        console.error("Error while closing phase:", error);
        return res
            .status(500)
            .json({ error: "Error while closing voting phase" });
    }

    return res
        .status(200)
        .json({ message: "Voting phase closed successfully." });
};

const resetGroupToOpen = async (req, res) => {
    const { groupId } = req.body;

    const { error } = await supabase
        .from("groups")
        .update({ voting_status: "open" })
        .eq("id", groupId);

    if (error) {
        console.error("Error during reset:", error);
        return res.status(500).json({ error: "Error while resetting group." });
    }

    res.json({ message: "Group now open to voting." });
};

module.exports = {
    getproposalactiveGroup,
    startproposalactiveGroup,
    startVotingPhase,
    endVotingPhase,
    resetGroupToOpen,
};
