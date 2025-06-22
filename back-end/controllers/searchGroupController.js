const supabase = require("../supabaseClient");

const searchGroup = async (req, res) => {
    const { name, userId, genres } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "userId required." });
    }

    try {
        const nameFilter = name ? `%${name}%` : "%";
        const { data, error } = await supabase
            .from("groups")
            .select("*")
            .ilike("name", nameFilter);

        if (error) throw error;

        let genreArray = [];
        if (genres) {
            try {
                genreArray =
                    typeof genres === "string" ? JSON.parse(genres) : genres;
            } catch {
                genreArray = [];
            }
        }
        const filteredGroups = data.filter((group) => {
            const users = group.users || [];
            const parsedGenres = JSON.parse(group.genres || "[]");

            const notAlreadyJoined = !users.includes(userId);
            const genreMatch =
                genreArray.length === 0
                    ? true
                    : genreArray.some((g) => parsedGenres.includes(g));

            return notAlreadyJoined && genreMatch;
        });

        if (filteredGroups.length === 0) {
            return res.status(200).json({
                groups: [],
                message: "No group found. Retry.",
            });
        }

        res.status(200).json({ groups: filteredGroups, message: null });
    } catch (err) {
        console.error("Error during search:", err);
        res.status(500).json({ error: "Error while searching for the group." });
    }
};

module.exports = { searchGroup };
