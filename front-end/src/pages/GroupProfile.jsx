import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import supabase from "../supabaseClient";
import leaveIcon from "../assets/images/leave.svg";
import removeMember from "../assets/images/removeMember.svg";

function GroupProfile() {
    const { id } = useParams();
    const [group, setGroup] = useState(null);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [message, setMessage] = useState(null);
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

        fetchGroupDetails();
    }, [id]);

    const handleDeleteGroup = async () => {
        if (!window.confirm("Sei sicuro di voler eliminare questo gruppo?"))
            return;

        try {
            await axios.delete(
                `http://localhost:3001/api/profileGroup/delete?id=${group.id}`
            );
            setMessage("Gruppo eliminato con successo.");
            setTimeout(() => {
                navigate("/groupwatch");
            }, 1500);
        } catch (err) {
            console.error("Errore durante l'eliminazione del gruppo:", err);
            setMessage("Errore durante l'eliminazione del gruppo.");
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
            setMessage("Gruppo abbandonato con successo.");
            setTimeout(() => {
                navigate("/groupwatch");
            }, 1500);
        } catch (err) {
            console.error("Errore durante l'abbandono del gruppo:", err);
            setMessage("Errore durante l'abbandono del gruppo.");
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
            setMessage("Errore nella ricerca degli utenti.");
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
            setMessage("Utente aggiunto con successo!");
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err) {
            console.error(
                "Errore durante l'aggiunta dell'utente al gruppo:",
                err
            );
            setMessage("Errore durante l'aggiunta dell'utente.");
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
            setMessage("Utente rimosso con successo!");
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err) {
            console.error(
                "Errore durante la rimozione dell'utente dal gruppo:",
                err
            );
            setMessage("Errore durante la rimozione dell'utente.");
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (!group) {
        return <div>Loading...</div>;
    }

    const getAvatarUrl = (user) => {
        if (!user?.avatar_url) return null;
        return supabase.storage.from("avatars").getPublicUrl(user.avatar_url)
            .data.publicUrl;
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col justify-start items-center p-4">
            <h2 className="py-4 text-3xl md:text-3xl font-bold text-center text-yellow-400">
                {group.name} - Group Profile
            </h2>
            <p className="p-5 text-center italic max-w-prose md:max-w-[80ch] lg:max-w-[100ch]">
                <strong className="text-yellow-400">Description:</strong>{" "}
                {group.description}
            </p>
            <h3 className="font-bold text-yellow-400 m-4 text-2xl">Members:</h3>
            <ul className="w-full md:w-[70%] bg-gray-900 rounded-lg p-2">
                {group.members && group.members.length > 0 ? (
                    group.members.map((member) => (
                        <li
                            className="flex flex-row justify-between items-center my-2 mx-3 bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition"
                            key={member.id}
                        >
                            <div className="flex items-center space-x-4">
                                <img
                                    src={getAvatarUrl(member)}
                                    alt={`${member.username}'s avatar`}
                                    className="w-10 h-10 rounded-full hidden md:flex"
                                />
                                <span className="font-semibold text-white">
                                    {member.username}
                                </span>
                            </div>

                            <div className="flex items-center space-x-3">
                                {member.id === group.owner && (
                                    <span className="text-sm text-yellow-400 font-extrabold">
                                        Owner
                                    </span>
                                )}
                                {user && member.id === user.id && (
                                    <span className="text-sm text-blue-400 font-bold">
                                        (You)
                                    </span>
                                )}
                                {user &&
                                    user.id === group.owner &&
                                    member.id !== group.owner && (
                                        <button
                                            className="cursor-pointer flex flex-row gap-2 justify-center items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                                            onClick={() =>
                                                handleRemoveUserFromGroup(
                                                    member.id
                                                )
                                            }
                                        >
                                            <img
                                                src={removeMember}
                                                className="w-6 h-6"
                                            />
                                            Remove
                                        </button>
                                    )}
                            </div>
                        </li>
                    ))
                ) : (
                    <p>No members yet.</p>
                )}
            </ul>

            <div className="flex flex-col md:flex-row justify-center items-center my-5">
                {user && user.id === group.owner && (
                    <div className="flex flex-row md:flex-row gap-5 my-2">
                        <button
                            className="px-3 py-2 text-sm bg-yellow-500 rounded-md text-black cursor-pointer transition hover:bg-yellow-600"
                            onClick={() => goToGroupEdit(group.id)}
                        >
                            Edit Group
                        </button>
                        <button
                            className="px-3 py-2 text-sm bg-red-500 rounded-md cursor-pointer transition hover:bg-red-600"
                            onClick={handleDeleteGroup}
                        >
                            Delete Group
                        </button>
                    </div>
                )}
                {user &&
                    user.id !== group.owner &&
                    group.members?.some((member) => member.id === user.id) && (
                        <button
                            onClick={handleLeaveGroup}
                            className="flex flex-row gap-2 justify-center items-center my-4 px-3 py-2 bg-red-500 text-white cursor-pointer rounded-md"
                        >
                            <img src={leaveIcon} className="w-6 h-6" />
                            Leave Group
                        </button>
                    )}
                <a
                    href="/groupwatch"
                    className="px-3 py-2 text-sm text-yellow-400 hover:text-yellow-500 transition"
                >
                    Return to Home
                </a>
            </div>

            <div className="w-full md:w-[70%] flex flex-col justify-center items-center">
                <div className="w-full text-black flex flex-row">
                    <input
                        type="text"
                        placeholder="Search Users..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="text-white flex-grow bg-gray-500 px-4 py-2 rounded-l-lg focus:outline-2 focus:outline-yellow-400"
                    />
                    <button
                        className="cursor-pointer bg-yellow-300 px-4 py-2 rounded-r-lg"
                        onClick={handleSearchUsers}
                    >
                        Search
                    </button>
                </div>
                {searchResults.length > 0 && (
                    <div className="my-4 w-full">
                        <h2 className="text-xl text-yellow-400 font-semibold mb-4 text-center">
                            🔍 Search Results
                        </h2>
                        <ul className="space-y-4">
                            {searchResults
                                .filter(
                                    (u) =>
                                        u.id !== user?.id &&
                                        !group.members.some(
                                            (member) => member.id === u.id
                                        )
                                )
                                .map((u) => (
                                    <li
                                        key={u.id}
                                        className="flex justify-between items-center bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={getAvatarUrl(u)}
                                                alt="User avatar"
                                                className="hidden md:flex w-10 h-10 rounded-full"
                                            />
                                            <span className="text-white font-semibold">
                                                {u.username}
                                            </span>
                                        </div>
                                        <button
                                            className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition"
                                            onClick={() =>
                                                handleAddUserToGroup(u.id)
                                            }
                                        >
                                            Add Member
                                        </button>
                                    </li>
                                ))}
                        </ul>
                    </div>
                )}
            </div>

            {message && (
                <p className="mt-2 text-center text-yellow-400">{message}</p>
            )}
        </div>
    );
}

export default GroupProfile;
