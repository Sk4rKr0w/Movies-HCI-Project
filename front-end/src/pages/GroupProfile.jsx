import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import groupBg from "../assets/images/groupBg.png";
import axios from "axios";
import supabase from "../supabaseClient";
import leaveIcon from "../assets/images/leave.svg";
import removeMember from "../assets/images/removeMember.svg";
import TmdbCard from "../components/TmdbCard";
import GroupRoulette from "../components/GroupRoulette";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function GroupProfile() {
    const { id } = useParams();
    const [group, setGroup] = useState(null);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [message, setMessage] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [tmdbQuery, setTmdbQuery] = useState("");
    const [tmdbResults, setTmdbResults] = useState([]);
    const [myProposals, setMyProposals] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [allProposals, setAllProposals] = useState([]);
    const [myVotes, setMyVotes] = useState([]);
    const [winnerMovieId, setWinnerMovieId] = useState(null);
    const [sectionTab, setSectionTab] = useState("proposal");
    const isProposalStarter =
        user && activeSession?.proposal_starteruser === user.id;
    const navigate = useNavigate();

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (tmdbQuery.trim()) {
                searchTmdbQuery(tmdbQuery);
            } else {
                setTmdbResults([]); // svuota risultati se input vuoto
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(delayDebounce); // pulizia al cambio di input
    }, [tmdbQuery]);

    const searchTmdbQuery = async (query) => {
        try {
            const res = await axios.get(
                `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
                    query
                )}`
            );
            setTmdbResults(res.data.results || []);
        } catch (err) {
            console.error("Error in TMDB search:", err);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const fetchGroupDetails = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:3001/api/profilegroup/profilegroup?id=${id}`
                );
                setGroup(res.data.group);
            } catch (err) {
                setError("Errore nel recupero dei dettagli del gruppo.");
                console.error(err);
            }
        };
        const fetchActiveProposalSession = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:3001/api/proposalactiveGroup/getproposalactivegroup",
                    {
                        params: { groupId: id },
                    }
                );
                setActiveSession(res.data.session || null);
            } catch (err) {
                console.error(
                    "Error retriving active session:",
                    err
                );
            }
        };

        fetchGroupDetails();
        fetchActiveProposalSession();
    }, [id]);

    useEffect(() => {
        if (group) {
            fetchMessages();
        }
    }, [group]);

    useEffect(() => {
        if (group && user) {
            fetchMyProposals();
        }
    }, [group, user]);

    useEffect(() => {
        if (activeSession && user) {
            fetchMyProposals();
        }
    }, [activeSession, user]);

    useEffect(() => {
        if (activeSession?.id) {
            fetchAllProposals();
        }
    }, [activeSession]);

    useEffect(() => {
        fetchMyVotes();
    }, [activeSession, user]);

    useEffect(() => {
        if (group?.voting_status === "closed" && activeSession?.id) {
            fetchWinningMovie();
        }
    }, [group, activeSession]);

    const fetchMessages = async () => {
        try {
            const res = await axios.get(
                "http://localhost:3001/api/chatgroup/listMessages",
                {
                    params: { groupId: group.id },
                }
            );
            setMessages(res.data.messages);
        } catch (error) {
            console.error("Error retriving messages:", error);
        }
    };

    const userColors = useMemo(() => {
        const colors = [
            "text-red-500",
            "text-green-500",
            "text-blue-500",
            "text-purple-500",
            "text-pink-500",
            "text-cyan-500",
            "text-orange-500",
            "text-amber-500",
            "text-lime-500",
            "text-emerald-500",
        ];

        const map = new Map();

        messages.forEach((msg) => {
            const id = msg.sender_id;
            if (id !== user.id && !map.has(id)) {
                const color = colors[map.size % colors.length];
                map.set(id, color);
            }
        });

        return map;
    }, [messages]);

    useEffect(() => {
        if (!group?.id) return;

        const fetchSenderUsername = async (senderId) => {
            const { data, error } = await supabase
                .from("users")
                .select("username")
                .eq("id", senderId)
                .single();

            return data?.username || "Anon";
        };

        const channel = supabase
            .channel("realtime-chat")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `group_id=eq.${group.id}`,
                },
                async (payload) => {
                    const newMessage = payload.new;

                    // Evita duplicati controllando lo stato più aggiornato
                    const username = await fetchSenderUsername(
                        newMessage.sender_id
                    );

                    setMessages((prevMessages) => {
                        if (
                            prevMessages.some((msg) => msg.id === newMessage.id)
                        ) {
                            return prevMessages;
                        }

                        return [
                            ...prevMessages,
                            {
                                ...newMessage,
                                sender: { username },
                            },
                        ];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [group?.id]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        await axios.post("http://localhost:3001/api/chatgroup/addMessage", {
            groupId: group.id,
            senderId: user.id,
            content: newMessage,
        });
        setNewMessage("");
        fetchMessages();
    };

    const handleDeleteGroup = async () => {
        if (!window.confirm("Are you want to remove this group?"))
            return;

        try {
            await axios.delete(
                `http://localhost:3001/api/profileGroup/delete?id=${group.id}`
            );
            setMessage({
                text: "Group removed successfully.",
                type: "success",
            });
            setTimeout(() => {
                navigate("/groupwatch");
            }, 1500);
        } catch (err) {
            console.error("Error deleting group:", err);
            setMessage({
                text: "Error deleting group.",
                type: "error",
            });
        }
    };

    const handleLeaveGroup = async () => {
        if (!window.confirm("Are you sure you want to leave this group?"))
            return;

        try {
            await axios.post(
                `http://localhost:3001/api/leavegroup/leavegroup`,
                {
                    groupId: group.id,
                    userId: user.id,
                }
            );
            setMessage({
                text: "Group left successfully.",
                type: "success",
            });
            setTimeout(() => {
                navigate("/groupwatch");
            }, 1500);
        } catch (err) {
            console.error("Error leaving the group:", err);
            setMessage({
                text: "Error leaving the group.",
                type: "error",
            });
        }
    };

    const goToGroupEdit = (groupId) => {
        navigate(`/groupedit/${groupId}`);
    };

    const handleSearchUsers = async () => {
        if (!searchInput.trim()) return;

        try {
            const res = await axios.get(
                `http://localhost:3001/api/searchmembersgroup/searchMembersGroup?username=${searchInput}`
            );
            setSearchResults(res.data.users);
        } catch (err) {
            console.error("Error searching for users:", err);
            setMessage({
                text: "Error searching for users.",
                type: "error",
            });
        }
    };

    const handleAddUserToGroup = async (userIdToAdd) => {
        try {
            await axios.post(
                "http://localhost:3001/api/addmembersgroup/addMembersGroup",
                {
                    groupId: group.id,
                    userId: userIdToAdd,
                }
            );
            setMessage({
                text: "Users added successfully!",
                type: "success",
            });
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err) {
            console.error(
                "Error adding user to the group:",
                err
            );
            setMessage({
                text: "Error adding user to the group.",
                type: "error",
            });
        }
    };

    const handleRemoveUserFromGroup = async (userIdToRemove) => {
        if (
            !window.confirm(
                "Are you sure you want to remvore this user from the group?"
            )
        )
            return;
        try {
            await axios.post(
                "http://localhost:3001/api/removemembersgroup/removeMembersGroup",
                {
                    groupId: group.id,
                    userId: userIdToRemove,
                }
            );
            setMessage({
                text: "User removed successfully!",
                type: "success",
            });
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err) {
            console.error(
                "Error removing user from the group:",
                err
            );
            setMessage({
                text: "Error removing user.",
                type: "error",
            });
        }
    };

    const startProposingSession = async () => {
        try {
            const res = await axios.post(
                "http://localhost:3001/api/proposalactiveGroup/startproposalactivegroup",
                {
                    groupId: group.id,
                    userId: user.id,
                }
            );

            alert("Proposal session started!");
            setActiveSession(res.data.session); // imposta la sessione corrente
            // aggiorna il gruppo se necessario
            const refreshedGroup = await axios.get(
                `http://localhost:3001/api/profilegroup/profilegroup?id=${group.id}`
            );
            setGroup(refreshedGroup.data.group);
        } catch (err) {
            console.error("Error starting the session:", err);
            alert("Error during session creation.");
        }
    };

    const handleTmdbSearch = async () => {
        if (!tmdbQuery.trim()) return;
        try {
            const res = await axios.get(
                `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
                    tmdbQuery
                )}`
            );
            setTmdbResults(res.data.results);
        } catch (err) {
            console.error("Error searching TMDB:", err);
        }
    };

    const proposeMovieFromTmdb = async (movie) => {
        if (!activeSession?.id) {
            alert("No active proposal session.");
            return;
        }

        try {
            await axios.post(
                "http://localhost:3001/api/proposingfilmGroup/proposingfilmgroup",
                {
                    sessionId: activeSession.id,
                    userId: user.id,
                    movie_id: movie.id.toString(),
                    groupId: group.id,
                }
            );

            alert(`You proposed "${movie.title}"`);
            setTmdbQuery("");
            setTmdbResults([]);
            fetchMyProposals(); // aggiorna lista proposte personali
        } catch (err) {
            console.error("Error during proposal:", err);
            alert("Error during movie proposal.");
        }
    };

    const fetchMyProposals = async () => {
        if (!activeSession?.id || !user?.id) return;

        try {
            const res = await axios.get(
                "http://localhost:3001/api/proposedmyfilmGroup/proposedmyfilmgroup",
                {
                    params: {
                        sessionId: activeSession.id,
                        userId: user.id,
                        groupId: group.id,
                    },
                }
            );
            setMyProposals(res.data.proposals || []);
        } catch (err) {
            console.error("Error retrieving proposals:", err);
        }
    };

    const fetchAllProposals = async () => {
        if (!activeSession?.id) return;

        try {
            const res = await axios.get(
                "http://localhost:3001/api/proposedothersfilmGroup/proposedothersfilmgroup",
                {
                    params: { sessionId: activeSession.id },
                    excludeUserId: user.id,
                }
            );
            setAllProposals(res.data.proposals || []);
        } catch (err) {
            console.error("Error retrieving proposals:", err);
        }
    };

    const fetchMyVotes = async () => {
        if (!activeSession?.id || !user?.id) return;

        try {
            const res = await axios.get(
                "http://localhost:3001/api/votefilmGroup/myvotes",
                {
                    params: {
                        sessionId: activeSession.id,
                        userId: user.id,
                    },
                }
            );
            setMyVotes(res.data.votes || []);
        } catch (err) {
            console.error("Error retrieving votes:", err);
        }
    };

    const voteForMovie = async (movieId) => {
        try {
            await axios.post("http://localhost:3001/api/votefilmGroup/add", {
                sessionId: activeSession.id,
                userId: user.id,
                movie_id: movieId,
            });

            alert("✅ Vote registered!");
            fetchMyVotes(); // aggiorna i voti dell’utente
        } catch (err) {
            console.error("Error during voting:", err);
            alert("❌ You have already voted this movie.");
        }
    };

    const startVotingPhase = async () => {
        try {
            await axios.post(
                "http://localhost:3001/api/proposalactivegroup/startvoting",
                {
                    groupId: group.id,
                }
            );
            alert("Voting phase started!");
            const refreshedGroup = await axios.get(
                `http://localhost:3001/api/profilegroup/profilegroup?id=${group.id}`
            );
            setGroup(refreshedGroup.data.group);
        } catch (err) {
            console.error("Error switching to voting phase:", err);
            alert("Error during phase change.");
        }
    };

    const closeVotingPhase = async () => {
        try {
            await axios.post(
                "http://localhost:3001/api/proposalactivegroup/closevoting",
                {
                    groupId: group.id,
                }
            );

            const updated = await axios.get(
                `http://localhost:3001/api/profilegroup/profilegroup?id=${group.id}`
            );
            setGroup(updated.data.group);
            alert("Voting closed!");
        } catch (err) {
            console.error("Errore chiusura votazione:", err);
            alert("Error closing.");
        }
    };

    const fetchWinningMovie = async () => {
        try {
            const res = await axios.get(
                "http://localhost:3001/api/winnerfilmGroup/getwinner",
                {
                    params: { sessionId: activeSession.id },
                }
            );
            setWinnerMovieId(res.data.winner.movie_id);
        } catch (err) {
            console.error("Error retrieving winner:", err);
        }
    };

    const resetGroupStatus = async () => {
        try {
            await axios.post(
                "http://localhost:3001/api/proposalactivegroup/resetgroup",
                {
                    groupId: group.id,
                }
            );

            const refreshed = await axios.get(
                `http://localhost:3001/api/profilegroup/profilegroup?id=${group.id}`
            );
            setGroup(refreshed.data.group);
            alert("Group reset to the beginning!");
        } catch (err) {
            console.error("Error resetting:", err);
            alert("Error during reset.");
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (!group) {
        return <div>Loading...</div>;
    }

    const getAvatarUrl = (user) => {
        if (user?.avatar_url && user.avatar_url !== "default_avatar.png") {
            return supabase.storage
                .from("avatars")
                .getPublicUrl(user.avatar_url).data.publicUrl;
        }
        return supabase.storage
            .from("avatars")
            .getPublicUrl("default_avatar.png").data.publicUrl;
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url(${groupBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(8px)",
                    transform: "scale(1.1)",
                }}
            ></div>
            <div className="relative z-10 min-h-screen p-6">
                <header className="p-4 rounded-md text-white bg-black/80 text-center">
                    <h2 className="text-4xl w-full font-bold text-yellow-400">
                        {group.name}
                    </h2>
                    <p className="font-medium mt-4 italic max-w-3xl mx-auto">
                        <strong className="text-yellow-400">
                            Description:
                        </strong>{" "}
                        {group.description}
                        <br />
                        <br />
                        <strong className="text-yellow-400">
                            Genres:
                        </strong>{" "}
                        {(() => {
                            try {
                                const parsedGenres =
                                    typeof group.genres === "string"
                                        ? JSON.parse(group.genres)
                                        : group.genres;
                                return Array.isArray(parsedGenres) &&
                                    parsedGenres.length > 0
                                    ? parsedGenres.join(", ")
                                    : "No genres";
                            } catch (err) {
                                console.error(
                                    "Error parsing genres:",
                                    err
                                );
                                return "No genres";
                            }
                        })()}
                    </p>
                </header>

                {message && (
                    <div
                        className={`w-full md:w-[75%] lg:w-[50%] text-center font-bold p-2 rounded-lg ${
                            message.type === "success"
                                ? "bg-green-500 text-black"
                                : "bg-red-500 text-black"
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <div className="flex flex-col lg:flex-row justify-between gap-6 mt-8 min-h-[60vh]">
                    <section className="w-full sm:w-[90%] md:w-[80%] lg:w-1/4 mx-auto lg:mx-0 bg-black/80 backdrop-blur-sm rounded-xl p-4 shadow-md">
                        <h3 className="text-2xl font-semibold text-yellow-400">
                            👥 Members
                        </h3>
                        <ul className="text-white space-y-4 mt-4 max-h-[60vh] overflow-y-scroll custom-scrollbar">
                            {group.members.length > 0 ? (
                                group.members
                                    .sort((a, b) =>
                                        a.id === group.owner
                                            ? -1
                                            : b.id === group.owner
                                            ? 1
                                            : 0
                                    )
                                    .map((member) => (
                                        <li
                                            key={member.id}
                                            className="mr-2 border border-white/30 flex lg:grid lg:grid-cols-2 justify-between items-center p-4 rounded-xl bg-black/80 backdrop-blur-sm shadow-md"
                                        >
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={getAvatarUrl(member)}
                                                    alt={`${member.username}'s avatar`}
                                                    className="w-10 h-10 rounded-full hidden md:block"
                                                />
                                                <span className="font-semibold">
                                                    {member.username}
                                                </span>
                                            </div>
                                            <div className="flex justify-end items-center gap-3">
                                                {member.id === group.owner && (
                                                    <span className="lg:text-[13px] text-yellow-400 font-bold">
                                                        Owner
                                                    </span>
                                                )}
                                                {user?.id === member.id && (
                                                    <span className="lg:text-[13px] text-blue-400 font-medium">
                                                        (You)
                                                    </span>
                                                )}
                                            </div>
                                            {user?.id === group.owner &&
                                                member.id !== group.owner && (
                                                    <button
                                                        onClick={() =>
                                                            handleRemoveUserFromGroup(
                                                                member.id
                                                            )
                                                        }
                                                        className="mt-2 lg:col-span-2 cursor-pointer flex flex-row justify-center items-center gap-x-1 px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                                                    >
                                                        <img
                                                            src={removeMember}
                                                            className="w-4 h-4"
                                                        />
                                                        <span className="text-sm">
                                                            Remove
                                                        </span>
                                                    </button>
                                                )}
                                        </li>
                                    ))
                            ) : (
                                <p className="text-center text-gray-400">
                                    No members yet.
                                </p>
                            )}
                            {user?.id === group.owner &&
                                group.pending_users?.length > 0 && (
                                    <section className="mt-6 bg-white/5 p-4 rounded-lg">
                                        <h3 className="text-xl font-bold text-yellow-400 mb-3">
                                            ✉️ Pending Requests
                                        </h3>
                                        <ul className="space-y-2">
                                            {group.pending_users.map(
                                                (pendingUserId) => (
                                                    <PendingUserItem
                                                        key={pendingUserId}
                                                        userId={pendingUserId}
                                                        groupId={group.id}
                                                        onApproved={async () => {
                                                            // 🔁 ricarica completamente il gruppo dal backend
                                                            try {
                                                                const res =
                                                                    await axios.get(
                                                                        `http://localhost:3001/api/profilegroup/profilegroup?id=${group.id}`
                                                                    );
                                                                setGroup(
                                                                    res.data
                                                                        .group
                                                                );
                                                            } catch (err) {
                                                                console.error(
                                                                    "Error updating group after approval:",
                                                                    err
                                                                );
                                                            }
                                                        }}
                                                    />
                                                )
                                            )}
                                        </ul>
                                    </section>
                                )}
                        </ul>
                        <div className="my-8 flex justify-center items-center">
                            {user?.id === group.owner && (
                                <section className="w-full max-w-xl space-y-4">
                                    <div className="flex flex-col sm:flex-row w-full">
                                        <input
                                            type="text"
                                            placeholder="Add Users..."
                                            value={searchInput}
                                            onChange={(e) =>
                                                setSearchInput(e.target.value)
                                            }
                                            className="w-full sm:w-[75%] px-4 py-2 mt-2 rounded-full sm:rounded-r-lg bg-gray-800 text-white outline-2 focus:outline-yellow-400"
                                        />
                                        <button
                                            onClick={handleSearchUsers}
                                            className="w-full sm:w-[25%] cursor-pointer px-4 py-2 bg-yellow-400 text-black font-semibold mt-2 rounded-full sm:rounded-l-lg hover:bg-yellow-500"
                                        >
                                            Search
                                        </button>
                                    </div>

                                    {searchResults.length > 0 && (
                                        <div>
                                            <h2 className="text-xl text-yellow-400 font-semibold text-center">
                                                🔍 Search Results 🔎
                                            </h2>
                                            <ul className="space-y-3 mt-3">
                                                {searchResults
                                                    .filter(
                                                        (u) =>
                                                            u.id !== user?.id &&
                                                            !group.members.some(
                                                                (member) =>
                                                                    member.id ===
                                                                    u.id
                                                            )
                                                    )
                                                    .map((u) => (
                                                        <li
                                                            key={u.id}
                                                            className="flex justify-between items-center p-4 bg-black/80 rounded-lg shadow-sm"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={getAvatarUrl(
                                                                        u
                                                                    )}
                                                                    alt="User avatar"
                                                                    className="w-10 h-10 rounded-full hidden md:block"
                                                                />
                                                                <span className="text-white font-medium">
                                                                    {u.username}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() =>
                                                                    handleAddUserToGroup(
                                                                        u.id
                                                                    )
                                                                }
                                                                className="cursor-pointer px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                                                            >
                                                                Add
                                                            </button>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    )}
                                </section>
                            )}
                        </div>
                    </section>

                    <section className="w-full sm:w-[90%] md:w-[80%] lg:w-1/2 mx-auto lg:mx-0 flex-grow bg-black/80 backdrop-blur-sm rounded-xl p-4 shadow-md">
                        <header className="flex flex-wrap justify-start gap-2">
                            <button
                                className={`${
                                    sectionTab === "proposal"
                                        ? "bg-yellow-500 text-black"
                                        : "bg-black text-white"
                                } cursor-pointer px-6 py-2 rounded-t-xl border border-white/30`}
                                onClick={() => setSectionTab("proposal")}
                            >
                                Let's Vote!
                            </button>
                            <button
                                className={`${
                                    sectionTab === "roulette"
                                        ? "bg-yellow-500 text-black"
                                        : "bg-black text-white"
                                } cursor-pointer px-6 py-2 rounded-t-xl border border-white/30`}
                                onClick={() => setSectionTab("roulette")}
                            >
                                Let the Luck decide!
                            </button>
                        </header>
                        {sectionTab === "proposal" ? (
                            <div className="w-full h-[95%] flex flex-col justify-start items-center p-4 rounded-2xl shadow-inner">
                                {group.members.some(
                                    (member) => member.id === user?.id
                                ) &&
                                    group.voting_status === "open" && (
                                        <div className="flex flex-col justify-center items-center text-center mt-6 px-4">
                                            <h1 className="text-xl md:text-2xl font-semibold text-white mb-4 leading-relaxed">
                                                Having a{" "}
                                                <strong className="text-yellow-300 italic">
                                                    hard time deciding
                                                </strong>{" "}
                                                what to watch tonight?
                                                <br />
                                                Let's put it to a{" "}
                                                <strong className="text-yellow-300 italic">
                                                    vote!
                                                </strong>
                                            </h1>
                                            <button
                                                onClick={startProposingSession}
                                                className="cursor-pointer px-6 py-3 bg-yellow-400 text-black font-semibold rounded-2xl shadow hover:bg-yellow-300 transition duration-200"
                                            >
                                                🎬 Start Movie Proposals
                                            </button>
                                        </div>
                                    )}

                                {group.voting_status === "proposing" && (
                                    <div className="w-full mt-6 flex flex-col justify-start items-center gap-6">
                                        <h3 className="text-2xl font-bold text-yellow-300">
                                            🎥 Search a movie to propose
                                        </h3>
                                        <div className="flex flex-row sm:flex-row justify-center items-center w-full">
                                            <input
                                                type="text"
                                                value={tmdbQuery}
                                                onChange={(e) =>
                                                    setTmdbQuery(e.target.value)
                                                }
                                                placeholder="Search on TMDB..."
                                                className="w-full sm:w-auto px-4 py-2 border border-white/30 bg-gray-900 text-white rounded-l-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                            />

                                            <button
                                                onClick={handleTmdbSearch}
                                                className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-r-xl transition duration-200"
                                            >
                                                Search
                                            </button>
                                        </div>

                                        {tmdbResults.length > 0 && (
                                            <ul className="flex flex-col w-full sm:w-[90%] mt-4 space-y-3">
                                                {tmdbResults
                                                    .slice(0, 5)
                                                    .map((movie) => (
                                                        <li
                                                            key={movie.id}
                                                            className="flex items-center gap-4 border border-white/20 bg-white/5 p-3 rounded-xl hover:bg-white/10 transition cursor-pointer"
                                                            onClick={() =>
                                                                proposeMovieFromTmdb(
                                                                    movie
                                                                )
                                                            }
                                                        >
                                                            <img
                                                                src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                                                                alt={
                                                                    movie.title
                                                                }
                                                                className="w-16 h-auto rounded-lg shadow"
                                                            />
                                                            <div>
                                                                <p className="text-white font-medium">
                                                                    {
                                                                        movie.title
                                                                    }
                                                                </p>
                                                                <p className="text-gray-400 text-sm">
                                                                    {
                                                                        movie.release_date
                                                                    }
                                                                </p>
                                                            </div>
                                                        </li>
                                                    ))}
                                            </ul>
                                        )}

                                        {myProposals.length > 0 && (
                                            <div className="w-full px-2">
                                                <h4 className="text-xl font-semibold text-yellow-300 mb-4">
                                                    🎞️ Movies you have proposed
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                    {myProposals.map((p) => (
                                                        <TmdbCard
                                                            key={p.movie_id}
                                                            movieId={p.movie_id}
                                                            showVoteButton={
                                                                false
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {isProposalStarter &&
                                            group.voting_status ===
                                                "proposing" &&
                                            myProposals.length +
                                                allProposals.length >
                                                1 && (
                                                <button
                                                    onClick={startVotingPhase}
                                                    className="cursor-pointer mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition duration-200"
                                                >
                                                    ✅ Let's Vote!
                                                </button>
                                            )}
                                    </div>
                                )}

                                {group.voting_status === "voting" &&
                                    myProposals.length > 0 && (
                                        <div className="mt-10 w-full px-2">
                                            <h3 className="text-xl font-bold text-yellow-300 mb-4">
                                                🎬 Your movies proposed
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {[
                                                    ...new Set(
                                                        myProposals.map(
                                                            (p) => p.movie_id
                                                        )
                                                    ),
                                                ].map((movieId) => (
                                                    <TmdbCard
                                                        key={`mine-${movieId}`}
                                                        movieId={movieId}
                                                        isVoted={true}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                {group.voting_status === "voting" &&
                                    allProposals.length > 0 && (
                                        <div className="mt-10 w-full px-2">
                                            <h3 className="text-xl font-bold text-yellow-300 mb-4">
                                                🎦 Movies proposed by the group
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {[
                                                    ...new Set(
                                                        allProposals
                                                            .filter(
                                                                (p) =>
                                                                    p.user_id !==
                                                                    user.id
                                                            )
                                                            .map(
                                                                (p) =>
                                                                    p.movie_id
                                                            )
                                                    ),
                                                ].map((movieId) => (
                                                    <TmdbCard
                                                        key={movieId}
                                                        movieId={movieId}
                                                        onVote={voteForMovie}
                                                        isVoted={myVotes.some(
                                                            (v) =>
                                                                String(
                                                                    v.movie_id
                                                                ) ===
                                                                String(movieId)
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                {group.voting_status === "voting" &&
                                    allProposals.length === 0 && (
                                        <div className="mt-10 text-center">
                                            <h3 className="text-xl font-bold text-yellow-300">
                                                🎦 No Movies proposed by others
                                            </h3>
                                        </div>
                                    )}

                                {group.voting_status === "voting" &&
                                    myVotes.length > 0 && (
                                        <div className="mt-10 flex flex-col justify-center items-center text-white">
                                            <h4 className="text-lg font-semibold text-yellow-300 mb-2">
                                                📋 Movies you voted
                                            </h4>
                                            <ul className="space-y-1 text-center">
                                                {myVotes.map((vote) => (
                                                    <li key={vote.movie_id}>
                                                        <MovieTitle
                                                            movieId={
                                                                vote.movie_id
                                                            }
                                                        />
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                {isProposalStarter &&
                                    group.voting_status === "voting" && (
                                        <button
                                            onClick={closeVotingPhase}
                                            className="cursor-pointer mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition duration-200"
                                        >
                                            🛑 End voting 🛑
                                        </button>
                                    )}

                                {group.voting_status === "closed" &&
                                    winnerMovieId && (
                                        <div className="my-2 text-center">
                                            <h3 className="text-2xl font-bold text-yellow-300 mb-4">
                                                🏆 Winner Movie chosen by the
                                                group
                                            </h3>
                                            <div className="max-w-[200px] mx-auto">
                                                <TmdbCard
                                                    movieId={winnerMovieId}
                                                    showVoteButton={false}
                                                />
                                            </div>
                                        </div>
                                    )}

                                {isProposalStarter &&
                                    group.voting_status !== "open" && (
                                        <button
                                            onClick={resetGroupStatus}
                                            className="cursor-pointer mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition duration-200"
                                        >
                                            Restart Activity
                                        </button>
                                    )}
                            </div>
                        ) : (
                            <GroupRoulette />
                        )}
                    </section>

                    <section className="w-full sm:w-[90%] md:w-[80%] lg:w-1/4 mx-auto lg:mx-0 bg-black/80 backdrop-blur-md rounded-xl p-4 shadow-md">
                        <h3 className="text-xl font-semibold text-yellow-400 mb-4">
                            💬 Chat of the Group
                        </h3>
                        <div className="custom-scrollbar min-h-90 max-h-90 overflow-y-auto space-y-3 p-2 bg-black/20 rounded-md border border-gray-700">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`${
                                        msg.sender_id === user.id
                                            ? "ml-8"
                                            : "mr-8"
                                    } p-3 rounded-lg bg-gray-800 text-sm text-white shadow`}
                                >
                                    <div
                                        className={`flex flex-row items-center ${
                                            msg.sender_id === user.id
                                                ? "justify-end"
                                                : "justify-start"
                                        } gap-2`}
                                    >
                                        <img
                                            src={getAvatarUrl(
                                                messages.sender_id
                                            )}
                                            className="h-4 w-4 rounded-full"
                                        />
                                        <span
                                            className={`font-bold ${
                                                msg.sender_id === user.id
                                                    ? "text-yellow-400"
                                                    : userColors.get(
                                                          msg.sender_id
                                                      ) || "text-gray-400"
                                            }`}
                                        >
                                            {msg.sender?.username || "Anon"}
                                        </span>
                                    </div>
                                    <p
                                        className={`${
                                            msg.sender_id === user.id
                                                ? "text-right"
                                                : "text-left"
                                        } mt-1`}
                                    >
                                        {msg.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                        {user && (
                            <div className="lg:flex lg:flex-col mt-4 flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) =>
                                        setNewMessage(e.target.value)
                                    }
                                    placeholder="Write a message..."
                                    className="text-white border border-white/50 p-2 bg-[#121212] rounded-lg flex-grow"
                                />
                                <button
                                    onClick={sendMessage}
                                    className="cursor-pointer py-2 px-4 bg-yellow-400 rounded-lg text-black font-semibold"
                                >
                                    Send
                                </button>
                            </div>
                        )}
                    </section>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
                    {user?.id === group.owner && (
                        <>
                            <button
                                onClick={() => goToGroupEdit(group.id)}
                                className="cursor-pointer w-[90%] md:w-auto px-4 py-2 bg-yellow-500 text-black font-semibold rounded-md hover:bg-yellow-600 transition"
                            >
                                ✏️ Edit Group
                            </button>
                            <button
                                onClick={handleDeleteGroup}
                                className="cursor-pointer w-[90%] md:w-auto px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition"
                            >
                                🗑 Delete Group
                            </button>
                        </>
                    )}
                    {user &&
                        user.id !== group.owner &&
                        group.members.some(
                            (member) => member.id === user.id
                        ) && (
                            <button
                                onClick={handleLeaveGroup}
                                className="cursor-pointer flex flex-row justify-center items-center px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
                            >
                                <img src={leaveIcon} className="w-6 h-6" />
                                <span>Leave Group</span>
                            </button>
                        )}
                    <a
                        href="/groupwatch"
                        className="text-sm text-yellow-400 hover:text-yellow-500 underline"
                    >
                        Return to Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
}

export default GroupProfile;

const MovieTitle = ({ movieId }) => {
    const [title, setTitle] = useState("");

    useEffect(() => {
        const fetchTitle = async () => {
            try {
                const res = await axios.get(
                    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`
                );
                setTitle(res.data.title);
            } catch (err) {
                console.error("TMDB error:", err);
                setTitle("Unknown movie");
            }
        };
        fetchTitle();
    }, [movieId]);

    return <span>{title}</span>;
};

const PendingUserItem = ({ userId, groupId, onApproved }) => {
    const [username, setUsername] = useState("");

    useEffect(() => {
        const fetchUsername = async () => {
            const { data } = await supabase
                .from("users")
                .select("username")
                .eq("id", userId)
                .single();

            setUsername(data?.username || "Unknown");
        };

        fetchUsername();
    }, [userId]);

    const handleApprove = async () => {
        try {
            await axios.post(
                "http://localhost:3001/api/approveRequestGroup/approve",
                {
                    groupId,
                    userId,
                }
            );
            onApproved();
        } catch (err) {
            console.error("Error during approval:", err);
            alert("Error during the approval process.");
        }
    };

    return (
        <li className="flex justify-between items-center bg-gray-800 px-4 py-2 rounded">
            <span>{username}</span>
            <button
                onClick={handleApprove}
                className="cursor-pointer bg-green-500 hover:bg-green-400 text-white px-3 py-1 rounded"
            >
                ✅ Approve
            </button>
        </li>
    );
};
