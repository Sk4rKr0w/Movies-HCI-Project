import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import * as bcrypt from "bcryptjs";

function GroupWatch() {
    const [groups, setGroups] = useState([]);
    const [user, setUser] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [searchMessage, setSearchMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [joinMessage, setJoinMessage] = useState(""); // 👈 nuovo stato per messaggio join
    const navigate = useNavigate();
    const resultsRef = useRef(null);

    const goToGroupProfile = (groupId) => {
        navigate(`/groupprofile/${groupId}`);
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const token = localStorage.getItem("token");
        if (!token) return;

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
            });
    }, []);

    useEffect(() => {
        if (user?.id) {
            handleYourGroups();
        }
    }, [user]);

    const handleSearchGroup = async () => {
        if (!searchTerm.trim()) return;

        try {
            const res = await axios.get(
                `http://localhost:3001/api/searchgroup/searchgroup`,
                {
                    params: {
                        name: searchTerm.trim(),
                        userId: user?.id ?? Math.floor(Math.random() * 1000000),
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

            <div className="w-[90%] md:w-[75%] lg:w-[65%] flex flex-row my-2">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for a group..."
                    className="bg-gray-600 focus:bg-gray-800 flex-grow px-4 py-2 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                    onClick={handleSearchGroup}
                    className="bg-yellow-500 hover:bg-yellow-600 cursor-pointer text-black px-4 py-2 rounded-r-md transition"
                >
                    Search
                </button>
            </div>

            <button
                onClick={moveToCreation}
                className="text-black w-[90%] md:w-[75%] lg:w-[65%] cursor-pointer bg-yellow-500 py-2 my-2 hover:bg-yellow-600 rounded-md transition"
            >
                Create a Group
            </button>

            <hr className="m-4 w-[60%] border"></hr>

            <h3 className="text-lg m-2 mb-6">Your Current Groups</h3>

            {groups.length === 0 ? (
                <p>
                    {user
                        ? "You don't have any groups yet."
                        : "Please log in to see your groups."}
                </p>
            ) : (
                <table className="min-w-[90%] table-auto border-collapse border border-gray-700">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="text-md border border-gray-700 p-2 text-center">
                                Group Name
                            </th>
                            <th className="text-md border border-gray-700 p-2 text-center">
                                Description
                            </th>
                            <th className="text-md border border-gray-700 p-2 text-center">
                                N° Users
                            </th>
                            <th className="text-md border border-gray-700 p-2 text-center">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {groups.map((group) => (
                            <tr
                                key={group.id}
                                className="hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                                <td className="max-w-[12ch] truncate overflow-hidden border border-gray-700 px-4 py-2 text-center">
                                    {group.name}
                                </td>
                                <td className="max-w-[12ch] truncate border border-gray-700 px-4 py-2 text-left">
                                    {group.description}
                                </td>
                                <td className="border border-gray-700 px-4 py-2 text-center">
                                    {group.users?.length || "???"}
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
                <div ref={resultsRef} className="min-w-[90%] mt-6">
                    <h3 className="text-xl mb-2 text-yellow-300">
                        🔍 Risultati della ricerca
                    </h3>
                    {joinMessage && (
                        <p className="text-green-300 my-4 text-sm">
                            {joinMessage}
                        </p>
                    )}
                    <ul className="space-y-2">
                        {searchResults.map((group) => (
                            <li
                                key={group.id}
                                className="bg-gray-900 p-3 rounded-md"
                            >
                                <p>
                                    <strong className="text-yellow-400">
                                        {group.name}
                                    </strong>
                                    : {group.description}
                                </p>
                                <div className="flex gap-4 mt-2">
                                    <button
                                        onClick={() =>
                                            goToGroupProfile(group.id)
                                        }
                                        className="font-semibold cursor-pointer px-3 py-2 bg-blue-400 hover:bg-blue-300 text-black text-sm rounded-lg"
                                    >
                                        View Group
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleJoinGroup(group.id)
                                        }
                                        className="font-semibold cursor-pointer px-3 py-2 bg-green-400 hover:bg-green-300 text-black text-[12px] rounded-lg"
                                    >
                                        Join Group
                                    </button>
                                </div>
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
