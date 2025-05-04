import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import supabase from "../supabaseClient";
import leaveIcon from "../assets/images/leave.svg";
import removeMember from "../assets/images/removeMember.svg";
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
    const navigate = useNavigate();

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
              const res = await axios.get("http://localhost:3001/api/proposalactiveGroup/getproposalactivegroup", {
                params: { groupId: id },
              });
              setActiveSession(res.data.session || null);
            } catch (err) {
              console.error("Errore nel recupero della sessione attiva:", err);
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
            console.error("Errore nel recupero dei messaggi:", error);
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
        if (!window.confirm("Sei sicuro di voler eliminare questo gruppo?"))
            return;

        try {
            await axios.delete(
                `http://localhost:3001/api/profileGroup/delete?id=${group.id}`
            );
            setMessage({
                text: "Gruppo eliminato con successo.",
                type: "success",
            });
            setTimeout(() => {
                navigate("/groupwatch");
            }, 1500);
        } catch (err) {
            console.error("Errore durante l'eliminazione del gruppo:", err);
            setMessage({
                text: "Errore durante l'eliminazione del gruppo.",
                type: "error",
            });
        }
    };

    const handleLeaveGroup = async () => {
        if (!window.confirm("Sei sicuro di voler abbandonare questo gruppo?"))
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
                text: "Gruppo abbandonato con successo.",
                type: "success",
            });
            setTimeout(() => {
                navigate("/groupwatch");
            }, 1500);
        } catch (err) {
            console.error("Errore durante l'abbandono del gruppo:", err);
            setMessage({
                text: "Errore durante l'abbandono del gruppo.",
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
            console.error("Errore nella ricerca degli utenti:", err);
            setMessage({
                text: "Errore nella ricerca degli utenti.",
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
                text: "Utente aggiunto con successo!",
                type: "success",
            });
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err) {
            console.error(
                "Errore durante l'aggiunta dell'utente al gruppo:",
                err
            );
            setMessage({
                text: "Errore durante l'aggiunta dell'utente.",
                type: "error",
            });
        }
    };

    const handleRemoveUserFromGroup = async (userIdToRemove) => {
        if (
            !window.confirm(
                "Sei sicuro di voler rimuovere questo membro dal gruppo?"
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
                text: "Utente rimosso con successo!",
                type: "success",
            });
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err) {
            console.error(
                "Errore durante la rimozione dell'utente dal gruppo:",
                err
            );
            setMessage({
                text: "Errore durante la rimozione dell'utente.",
                type: "error",
            });
        }
    };

    const startProposingSession = async () => {
        try {
          const res = await axios.post("http://localhost:3001/api/proposalactiveGroup/startproposalactivegroup", {
            groupId: group.id,
          });
      
          alert("Sessione di proposta avviata!");
          setActiveSession(res.data.session); // imposta la sessione corrente
          // aggiorna il gruppo se necessario
          const refreshedGroup = await axios.get(`http://localhost:3001/api/profilegroup/profilegroup?id=${group.id}`);
          setGroup(refreshedGroup.data.group);
        } catch (err) {
          console.error("Errore nell'avvio della sessione:", err);
          alert("Errore durante la creazione della sessione.");
        }
      };
          

    const handleTmdbSearch = async () => {
        if (!tmdbQuery.trim()) return;
        try {
            const res = await axios.get(
            `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(tmdbQuery)}`
            );
            setTmdbResults(res.data.results);
        } catch (err) {
            console.error("Errore nella ricerca TMDB:", err);
        }
      };
        
    const proposeMovieFromTmdb = async (movie) => {
        if (!activeSession?.id) {
          alert("Nessuna sessione di proposta attiva.");
          return;
        }
      
        try {
          await axios.post("http://localhost:3001/api/proposingfilmGroup/proposingfilmgroup", {
            sessionId: activeSession.id,
            userId: user.id,
            movie_id: movie.id.toString(),
            groupId: group.id,
          });
      
          alert(`Hai proposto "${movie.title}"`);
          setTmdbQuery("");
          setTmdbResults([]);
          fetchMyProposals(); // aggiorna lista proposte personali
        } catch (err) {
          console.error("Errore nella proposta:", err);
          alert("Errore durante la proposta del film.");
        }
      };
      

    const fetchMyProposals = async () => {
        if (!activeSession?.id || !user?.id) return;
      
        try {
          const res = await axios.get("http://localhost:3001/api/proposedmyfilmGroup/proposedmyfilmgroup", {
            params: {
              sessionId: activeSession.id,
              userId: user.id,
              groupId: group.id,
            },
          });
          setMyProposals(res.data.proposals || []);
        } catch (err) {
          console.error("Errore nel recupero delle proposte:", err);
        }
      };
      
    const fetchAllProposals = async () => {
        if (!activeSession?.id) return;
      
        try {
          const res = await axios.get("http://localhost:3001/api/proposedothersfilmGroup/proposedothersfilmgroup", {
            params: { sessionId: activeSession.id },
            excludeUserId: user.id,
          });
          setAllProposals(res.data.proposals || []);
        } catch (err) {
          console.error("Errore nel recupero delle proposte:", err);
        }
      };

    const fetchMyVotes = async () => {
        if (!activeSession?.id || !user?.id) return;
      
        try {
          const res = await axios.get("http://localhost:3001/api/votefilmGroup/myvotes", {
            params: {
              sessionId: activeSession.id,
              userId: user.id,
            },
          });
          setMyVotes(res.data.votes || []);
        } catch (err) {
          console.error("Errore nel recupero dei voti:", err);
        }
      };
    
    const voteForMovie = async (movieId) => {
        try {
          await axios.post("http://localhost:3001/api/votefilmGroup/add", {
            sessionId: activeSession.id,
            userId: user.id,
            movie_id: movieId,
          });
      
          alert("✅ Voto registrato!");
          fetchMyVotes(); // aggiorna i voti dell’utente
        } catch (err) {
          console.error("Errore durante il voto:", err);
          alert("❌ Hai già votato questo film.");
        }
      }; 
    
    const startVotingPhase = async () => {
        try {
          await axios.post("http://localhost:3001/api/proposalactivegroup/startvoting", {
            groupId: group.id,
          });
          alert("Fase di voto avviata!");
          const refreshedGroup = await axios.get(`http://localhost:3001/api/profilegroup/profilegroup?id=${group.id}`);
          setGroup(refreshedGroup.data.group);
        } catch (err) {
          console.error("Errore nel passaggio a voting:", err);
          alert("Errore durante il cambio di fase.");
        }
      };      
      
    const closeVotingPhase = async () => {
        try {
          await axios.post("http://localhost:3001/api/proposalactivegroup/closevoting", {
            groupId: group.id,
          });
      
          const updated = await axios.get(`http://localhost:3001/api/profilegroup/profilegroup?id=${group.id}`);
          setGroup(updated.data.group);
          alert("Votazione chiusa!");
        } catch (err) {
          console.error("Errore chiusura votazione:", err);
          alert("Errore nella chiusura.");
        }
      };
    
    const fetchWinningMovie = async () => {
        try {
          const res = await axios.get("http://localhost:3001/api/winnerfilmGroup/getwinner", {
            params: { sessionId: activeSession.id },
          });
          console.log("🎉 Vincitore:", res.data.winnerMovieId);
          setWinnerMovieId(res.data.winner.movie_id);
        } catch (err) {
          console.error("Errore nel recupero del vincitore:", err);
        }
      };

    const resetGroupStatus = async () => {
        try {
          await axios.post("http://localhost:3001/api/proposalactivegroup/resetgroup", {
            groupId: group.id,
          });
      
          const refreshed = await axios.get(`http://localhost:3001/api/profilegroup/profilegroup?id=${group.id}`);
          setGroup(refreshed.data.group);
          alert("Gruppo riportato all'inizio!");
        } catch (err) {
          console.error("Errore nel reset:", err);
          alert("Errore durante il reset.");
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
        <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-gray-900 text-gray-100 p-6">
            <header className="text-center">
                <h2 className="text-4xl w-full font-bold text-yellow-400">
                    {group.name}
                </h2>
                <p className="mt-4 italic max-w-3xl mx-auto">
                    <strong className="text-yellow-400">Description:</strong>{" "}
                    {group.description}
                </p>
                <p className="mt-4 italic max-w-3xl mx-auto">
                    <strong className="text-yellow-400">Genres:</strong>{" "}
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
                                "Errore nel parsing dei generi:",
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
                <section className="w-full sm:w-[90%] md:w-[80%] lg:w-1/4 mx-auto lg:mx-0 bg-white/5 backdrop-blur-sm rounded-xl p-4 shadow-md">
                    <h3 className="text-2xl font-semibold text-yellow-400">
                        👥 Members
                    </h3>
                    <ul className="space-y-4 mt-4">
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
                                        className="flex lg:grid lg:grid-cols-2 justify-between items-center p-4 rounded-xl bg-white/5 backdrop-blur-sm shadow-md"
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
                    </ul>
                </section>

                <section className="w-full sm:w-[90%] md:w-[80%] lg:w-1/2 mx-auto lg:mx-0 flex-grow bg-white/5 backdrop-blur-sm rounded-xl p-6 shadow-md">
                    {group.members.some(member => member.id === user?.id) && group.voting_status === "open" && (
                        <div className="flex justify-center items-center h-full">
                            <button
                            onClick={startProposingSession}
                            className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transition"
                            >
                            🎬 Start Film Proposals
                            </button>
                        </div>
                        )}
                    {group.voting_status === "proposing" && (
                        <div className="mt-6">
                            <h3 className="text-xl font-bold text-yellow-400 mb-4">
                            🎥 Cerca un film da proporre
                            </h3>
                            <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={tmdbQuery}
                                onChange={(e) => setTmdbQuery(e.target.value)}
                                placeholder="Cerca su TMDB..."
                                className="flex-grow p-2 bg-gray-800 text-white rounded"
                            />
                            <button
                                onClick={handleTmdbSearch}
                                className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded"
                            >
                                Cerca
                            </button>
                            </div>
                        
                            {tmdbResults.length > 0 && (
                            <ul className="space-y-4">
                                {tmdbResults.slice(0, 5).map((movie) => (
                                <li
                                    key={movie.id}
                                    className="flex items-center gap-4 bg-black/30 p-3 rounded hover:bg-black/40 transition cursor-pointer"
                                    onClick={() => proposeMovieFromTmdb(movie)}
                                >
                                    <img
                                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                    alt={movie.title}
                                    className="w-16 h-auto rounded"
                                    />
                                    <div>
                                    <p className="font-semibold text-white">{movie.title}</p>
                                    <p className="text-gray-400 text-sm">{movie.release_date}</p>
                                    </div>
                                </li>
                                ))}
                            </ul>
                            )}
                            {group.voting_status === "proposing" && myProposals.length > 0 && (
                                <div className="mt-8">
                                    <h4 className="text-lg font-semibold text-yellow-400 mb-2">
                                    🎞️ Film che hai già proposto
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {myProposals.map((p) => (
                                        <TmdbCard key={p.movie_id} movieId={p.movie_id} showVoteButton={false}/>
                                    ))}
                                    </div>
                                </div>
                                )}
                            {user?.id === group.owner && group.voting_status === "proposing" && allProposals.length > 1 && (
                                <button
                                    onClick={startVotingPhase}
                                    className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
                                >
                                    ✅ Go to Voting Phase!
                                </button>
                                )}
                        </div>
                        )}
                    {group.voting_status === "voting" && allProposals.length > 0 && (
                        <div className="mt-10">
                            <h3 className="text-xl font-bold text-yellow-400 mb-4">
                            🎦 Film proposti dal gruppo
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {allProposals
                                .filter((p) => p.user_id !== user.id)
                                .map((p) => (
                                <TmdbCard
                                    key={p.movie_id + p.user_id}
                                    movieId={p.movie_id}
                                    onVote={voteForMovie}
                                    isVoted={myVotes.some((v) => String(v.movie_id) === String(p.movie_id))}
                                />
                                ))}
                            </div>
                        </div>
                        )}
                    {group.voting_status === "voting" && myVotes.length > 0 && (
                        <div className="mt-10">
                            <h4 className="text-lg font-semibold text-yellow-400 mb-2">
                            📋 Film che hai votato
                            </h4>
                            <ul className="list-disc list-inside text-white space-y-1">
                            {myVotes.map((vote) => (
                                <li key={vote.movie_id}>
                                <MovieTitle movieId={vote.movie_id} />
                                </li>
                            ))}
                            </ul>
                        </div>
                        )}
                    {user?.id === group.owner && group.voting_status === "voting" && (
                        <button
                            onClick={closeVotingPhase}
                            className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                        >
                            🛑 Chiudi votazione
                        </button>
                        )}
                    {group.voting_status === "closed" && winnerMovieId && (
                        <div className="mt-10 text-center">
                            <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                            🏆 Film vincitore scelto dal gruppo
                            </h3>
                            <div className="max-w-[200px] mx-auto">
                            <TmdbCard movieId={winnerMovieId} showVoteButton={group.voting_status === "voting"}/>
                            </div>
                            {user?.id === group.owner && (
                                <button
                                    onClick={resetGroupStatus}
                                    className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                                >
                                    Close
                                </button>
                                )}
                        </div>
                        )}
                </section>

                <section className="w-full sm:w-[90%] md:w-[80%] lg:w-1/4 mx-auto lg:mx-0 bg-white/5 backdrop-blur-md rounded-xl p-4 shadow-md">
                    <h3 className="text-xl font-semibold text-yellow-400 mb-4">
                        💬 Chat of the Group
                    </h3>
                    <div className="custom-scrollbar min-h-90 max-h-90 overflow-y-auto space-y-3 p-2 bg-black/20 rounded-md border border-gray-700">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`${
                                    msg.sender_id === user.id ? "ml-8" : "mr-8"
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
                                        src={getAvatarUrl(messages.sender_id)}
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
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Write a message..."
                                className="p-2 bg-[#121212] rounded-lg flex-grow"
                            />
                            <button
                                onClick={sendMessage}
                                className="py-2 px-4 bg-yellow-400 rounded-lg text-black font-semibold"
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
                    group.members.some((member) => member.id === user.id) && (
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
                    Return to Home
                </a>
            </div>

            <div className="my-8 flex justify-center items-center">
                {user?.id === group.owner && (
                    <section className="w-full max-w-xl space-y-4">
                        <div className="flex">
                            <input
                                type="text"
                                placeholder="Add Users..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="flex-grow px-4 py-2 rounded-l-lg bg-gray-800 text-white outline-2 focus:outline-yellow-400"
                            />
                            <button
                                onClick={handleSearchUsers}
                                className="cursor-pointer px-4 py-2 bg-yellow-400 text-black font-semibold rounded-r-lg hover:bg-yellow-500 "
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
                                                        member.id === u.id
                                                )
                                        )
                                        .map((u) => (
                                            <li
                                                key={u.id}
                                                className="flex justify-between items-center p-4 bg-white/5 rounded-lg shadow-sm"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={getAvatarUrl(u)}
                                                        alt="User avatar"
                                                        className="w-10 h-10 rounded-full hidden md:block"
                                                    />
                                                    <span>{u.username}</span>
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
        </div>
    );
}

export default GroupProfile;

const TmdbCard = ({ movieId, onVote, isVoted, showVoteButton = true }) => {
    const [movie, setMovie] = useState(null);
  
    useEffect(() => {
      const fetchMovieDetails = async () => {
        try {
          const res = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`
          );
          setMovie(res.data);
        } catch (err) {
          console.error("Errore TMDB:", err);
        }
      };
      fetchMovieDetails();
    }, [movieId]);
  
    if (!movie) return null;
  
    return (
      <div
        className={`relative bg-gray-800 rounded shadow p-2 text-sm transition ${
          isVoted ? "opacity-50" : "hover:scale-[1.02]"
        }`}
      >
        <img
          src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
          alt={movie.title}
          className="rounded w-full mb-2"
        />
        <p className="text-white font-semibold truncate">{movie.title}</p>
        {showVoteButton && (
        <button
          disabled={isVoted}
          onClick={() => onVote(movie.id)}
          className={`mt-2 w-full py-1 px-2 text-sm rounded font-semibold ${
            isVoted
              ? "bg-green-500 text-black cursor-default"
              : "bg-yellow-400 hover:bg-yellow-300 text-black"
          }`}
        >
          {isVoted ? "✅ Votato" : "Vota"}
        </button>
        )}
      </div>
    );
  };  

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
          console.error("Errore TMDB:", err);
          setTitle("Film sconosciuto");
        }
      };
      fetchTitle();
    }, [movieId]);
  
    return <span>{title}</span>;
  };
  
  
