import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function GroupWatch() {
    const [groups, setGroups] = useState([]);
    const [user, setUser] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [searchMessage, setSearchMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [joinMessage, setJoinMessage] = useState(""); // 👈 nuovo stato per messaggio join
    const [isPendingRequest, setIsPendingRequest] = useState(false);
    const [showGenreFilter, setShowGenreFilter] = useState(false);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const genreOptions = [
        "Action",
        "Comedy",
        "Drama",
        "Horror",
        "Sci-Fi",
        "Romance",
        "Thriller",
    ];
    const navigate = useNavigate();
    const resultsRef = useRef(null);

    const goToGroupProfile = (groupId) => {
        navigate(`/groupprofile/${groupId}`);
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/signin");
            return;
        }

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        axios
            .get("http://localhost:3001/api/protected/profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                if (!res.data.error) {
                    setUser(res.data.user);
                }
            })
            .catch((err) => {
                console.error("Errore nel recupero utente:", err);
                navigate("/signin"); // 👈 redirect anche in caso di errore API
            });
    }, []);

    useEffect(() => {
        if (user?.id) {
            handleYourGroups();
        }
    }, [user]);

    const handleSearchGroup = async () => {
        if (!searchTerm.trim() && selectedGenres.length === 0) {
            // se non c'è testo né filtri, mostra tutto
            try {
                const res = await axios.get(
                    "http://localhost:3001/api/searchgroup/searchgroup",
                    {
                        params: {
                            userId:
                                user?.id ?? Math.floor(Math.random() * 1000000),
                        },
                    }
                );
                setSearchResults(res.data.groups || []);
                setSearchMessage(res.data.message || "");
                setJoinMessage("");
                return;
            } catch (err) {
                console.error("Errore nel recupero dei gruppi:", err);
                setSearchMessage("Errore nel recupero dei gruppi.");
                return;
            }
        }

        try {
            const res = await axios.get(
                `http://localhost:3001/api/searchgroup/searchgroup`,
                {
                    params: {
                        name: searchTerm.trim(),
                        userId: user?.id ?? Math.floor(Math.random() * 1000000),
                        genres:
                            selectedGenres.length > 0
                                ? JSON.stringify(selectedGenres)
                                : undefined,
                    },
                }
            );
            setSearchResults(res.data.groups || []);
            setSearchMessage(res.data.message || "");
            setJoinMessage("");

            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        } catch (err) {
            console.error("Errore durante la ricerca del gruppo:", err);
            setSearchMessage("Errore nella ricerca del gruppo.");
        }
    };

    const handleResetFilters = async () => {
        setSearchTerm("");
        setSelectedGenres([]);
        setShowGenreFilter(true);

        try {
            const res = await axios.get(
                "http://localhost:3001/api/searchgroup/searchgroup",
                {
                    params: {
                        userId: user?.id ?? Math.floor(Math.random() * 1000000),
                    },
                }
            );
            setSearchResults(res.data.groups || []);
            setSearchMessage(res.data.message || "");
            setJoinMessage("");
        } catch (err) {
            console.error("Errore nel reset:", err);
            setSearchMessage("Errore nel recupero dei gruppi.");
        }
    };

    const handleJoinGroup = async (groupId) => {
        if (!groupId || !user) {
            setJoinMessage(
                "Devi essere loggato prima di entrare in un gruppo!"
            );
            return;
        }

        try {
            await axios.post(`http://localhost:3001/api/joingroup/joingroup`, {
                groupId,
                userId: user.id,
            });
            setJoinMessage("Sei entrato nel gruppo con successo!");
            handleYourGroups(); // 👈 aggiorna i tuoi gruppi
        } catch (err) {
            console.error("Errore durante l'unione al gruppo:", err);
            setJoinMessage("Errore nell'unione al gruppo.");
        }
    };

    const handleSendRequestGroup = async (groupId) => {
        try {
            await axios.post("http://localhost:3001/api/requestGroup/send", {
                groupId,
                userId: user.id,
            });

            // Aggiorna localmente il gruppo nei searchResults
            setSearchResults((prev) =>
                prev.map((g) =>
                    g.id === groupId
                        ? {
                              ...g,
                              pending_users: [
                                  ...(g.pending_users || []),
                                  user.id,
                              ],
                          }
                        : g
                )
            );

            alert("Richiesta inviata! In attesa di approvazione.");
        } catch (err) {
            console.error("Errore durante l'invio della richiesta:", err);
            alert("Errore durante la richiesta di accesso.");
        }
    };

    const handleYourGroups = async () => {
        if (!user?.id) return;

        try {
            const res = await axios.get(
                `http://localhost:3001/api/yourgroups/yourgroups?userId=${user.id}`
            );
            setGroups(res.data.groups || []);
        } catch (err) {
            console.error("Errore nel recupero dei gruppi:", err);
        }
    };

    const moveToCreation = () => {
        navigate("/groupcreation");
    };

    return (
        <div className="bg-black text-white flex flex-col justify-start items-center px-2 py-4 md:min-h-[90vh]">
            <h2 className="py-4 text-2xl md:text-3xl font-bold text-center text-yellow-400">
                📽️ Group Watch Dashboard 📽️
            </h2>

            {user && (
                <p className="text-center text-yellow-400 text-lg md:text-xl mb-4">
                    Welcome, {user.username}!
                </p>
            )}

            <div className="w-[90%] md:w-[75%] lg:w-[65%] my-2">
                {/* Top bar: search input + button + filter */}
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                    <div className="flex flex-grow">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search for a group..."
                            className="bg-gray-600 focus:bg-gray-800 px-4 py-2 text-white rounded-l-md w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                        <button
                            onClick={handleSearchGroup}
                            className="cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-r-md transition"
                        >
                            Search
                        </button>
                    </div>

                    <button
                        onClick={() => setShowGenreFilter(!showGenreFilter)}
                        className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
                    >
                        Filter by Genre
                    </button>
                </div>

                {showGenreFilter && (
                    <div className="bg-gray-800 p-4 mt-4 rounded flex flex-col md:flex md:flex-row justify-between items-center">
                        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
                            {genreOptions.map((genre) => (
                                <label
                                    key={genre}
                                    className="flex items-center space-x-2 text-white"
                                >
                                    <input
                                        type="checkbox"
                                        value={genre}
                                        checked={selectedGenres.includes(genre)}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setSelectedGenres((prev) =>
                                                checked
                                                    ? [...prev, genre]
                                                    : prev.filter(
                                                          (g) => g !== genre
                                                      )
                                            );
                                        }}
                                        className="cursor-pointer h-5 w-5"
                                    />
                                    <span className="text-yellow-400 font-medium">
                                        {genre}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <button
                            onClick={handleResetFilters}
                            className="cursor-pointer bg-red-500 hover:bg-red-600 text-white px-4 py-2 mt-4 md:mt-0 rounded transition"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>

            <button
                onClick={moveToCreation}
                className="text-black w-[90%] md:w-[75%] lg:w-[65%] cursor-pointer bg-yellow-500 py-2 my-2 hover:bg-yellow-600 rounded-md transition"
            >
                Create a Group
            </button>

            <hr className="m-4 w-[60%] border"></hr>

            <h3 className="text-lg m-2 mb-0 md:mb-6">Your Current Groups</h3>

            {groups.length === 0 ? (
                <p>
                    {user
                        ? "You don't have any groups yet."
                        : "Please log in to see your groups."}
                </p>
            ) : (
                <table className="scale-80 md:scale-90 lg:scale-100 min-w-[80%] table-auto border-collapse border border-gray-700">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="text-md border border-gray-700 p-2 text-center text-yellow-400">
                                Group Name
                            </th>
                            <th className="text-md border border-gray-700 p-2 text-center text-yellow-400">
                                Description
                            </th>
                            <th className="text-md border border-gray-700 p-2 text-center text-yellow-400">
                                N° Users
                            </th>
                            <th className="text-md border border-gray-700 p-2 text-center text-yellow-400">
                                Owner
                            </th>
                            <th className="text-md border border-gray-700 p-2 text-center text-yellow-400">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {groups
                            .slice()
                            .sort((a, b) =>
                                a.owner === user?.id
                                    ? -1
                                    : b.owner === user?.id
                                    ? 1
                                    : 0
                            )
                            .map((group) => (
                                <tr
                                    key={group.id}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    <td className="max-w-[12ch] truncate overflow-hidden border border-gray-700 px-4 py-2 text-center">
                                        <span className="font-semibold">
                                            {group.name}
                                        </span>
                                    </td>
                                    <td className="max-w-[12ch] truncate border border-gray-700 px-4 py-2 text-left">
                                        {group.description}
                                    </td>
                                    <td className="border border-gray-700 px-4 py-2 text-center">
                                        {group.users?.length || "???"}
                                    </td>
                                    <td className="border border-gray-700 px-4 py-2 text-center">
                                        <span className="font-semibold">
                                            {group.owner === user?.id
                                                ? "Yes"
                                                : "No"}
                                        </span>
                                    </td>
                                    <td className="border border-gray-700 px-4 py-2 text-center">
                                        <button
                                            onClick={() =>
                                                goToGroupProfile(group.id)
                                            }
                                            className="text-blue-300 hover:text-blue-400 cursor-pointer"
                                        >
                                            View Group
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            )}

            {searchResults.length > 0 && (
                <div
                    ref={resultsRef}
                    className="w-full mt-6 flex flex-col justify-center items-center"
                >
                    <h3 className="w-[90%] text-xl font-semibold mb-2 text-yellow-300">
                        🔍 Search Results
                    </h3>
                    {joinMessage && (
                        <p className="text-green-300 my-4 text-sm">
                            {joinMessage}
                        </p>
                    )}
                    <ul className="space-y-2 flex flex-col justify-center items-center w-full">
                        {searchResults.map((group) => (
                            <li
                                key={group.id}
                                className="w-[90%] flex flex-col md:flex-row border border-gray-600 bg-gray-900 hover:bg-gray-800 transition my-2 p-3 rounded-md"
                            >
                                <div className="w-full md:w-3/4 flex flex-col gap-2 md:gap-3 justify-start items-start">
                                    <strong className="text-yellow-400 font-semibold text-lg md:text-xl">
                                        {group.name}
                                    </strong>
                                    {group.genres && (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {JSON.parse(group.genres).map(
                                                (genre, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-gray-700 text-white px-2 py-1 text-sm md:text-md rounded"
                                                    >
                                                        {genre}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    )}
                                    <p className="text-md md:text-lg">
                                        {group.description}
                                    </p>
                                </div>
                                {group?.private === false && (
                                    <div className="md:w-1/4 gap-4 mt-2 md:flex md:justify-center md:items-center md:mx-2">
                                        <button
                                            onClick={() =>
                                                handleJoinGroup(group.id)
                                            }
                                            className="w-full font-semibold cursor-pointer px-3 py-2 bg-green-400 hover:bg-green-300 text-black text-sm md:text:md md:w-full md:h-12 rounded-lg"
                                        >
                                            Join Group
                                        </button>
                                    </div>
                                )}
                                {group?.private === true && (
                                    <div className="md:w-1/4 gap-4 mt-2 md:flex md:justify-center md:items-center md:mx-2">
                                        {group.pending_users?.includes(
                                            user?.id
                                        ) ? (
                                            <button
                                                disabled
                                                className="w-full px-3 py-2 bg-gray-400 text-white rounded-lg cursor-default"
                                            >
                                                ✅ Request Sent
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    handleSendRequestGroup(
                                                        group.id
                                                    )
                                                }
                                                className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg"
                                            >
                                                Send Request
                                            </button>
                                        )}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {searchMessage && (
                <p className="text-green-400 mt-4">{searchMessage}</p>
            )}
        </div>
    );
}

export default GroupWatch;
