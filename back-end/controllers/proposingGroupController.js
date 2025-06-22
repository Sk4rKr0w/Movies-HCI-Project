const supabase = require("../supabaseClient");

const ProposingGroup = async (req, res) => {
    const { groupId } = req.body;
    if (!groupId) return res.status(400).json({ error: "groupId required" });

    const { error } = await supabase
        .from("groups")
        .update({ voting_status: "proposing" })
        .eq("id", groupId);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ message: "Film proposal started" });
};

module.exports = { ProposingGroup };
