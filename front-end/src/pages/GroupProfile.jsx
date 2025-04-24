import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Per prendere l'ID del gruppo dalla URL
import axios from "axios";
import supabase from "../supabaseClient";

function GroupProfile() {
    const { id } = useParams(); // Estrae l'ID del gruppo dalla URL
    const [group, setGroup] = useState(null);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showAddMembers, setShowAddMembers] = useState(false);
    const [message, setMessage] = useState(null); // Stato per il messaggio
    const navigate = useNavigate();

    useEffect(() => {
        // Recupera i dettagli del gruppo quando il componente viene caricato
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        const fetchGroupDetails = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:3001/api/profilegroup/profilegroup?id=${id}`
                ); // Endpoint che recupera i dettagli del gruppo
                setGroup(res.data.group); // Presupponendo che la risposta contenga il gruppo
            } catch (err) {
                setError("Errore nel recupero dei dettagli del gruppo.");
                console.error(err);
            }
        };

        fetchGroupDetails();
    }, [id]); // Effettua la chiamata ogni volta che l'ID cambia

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
            <p className="p-5 text-center italic max-w-prose">
                <strong className="text-yellow-400">Description:</strong>{" "}
                {group.description}
            </p>
            <h3 className="font-bold text-yellow-400 m-4 text-2xl">Members:</h3>
            <ul>
                {group.members && group.members.length > 0 ? (
                    group.members.map((member) => (
                        <li key={member.id}>
                            {member.username}
                            {member.id === group.owner && (
                                <span className="font-extrabold text-gray-500">
                                    {" "}
                                    Owner
                                </span>
                            )}
                            {user && member.id === user.id && (
                                <span className="font-bold"> (You)</span>
                            )}
                            {user &&
                                member.id != group.owner &&
                                group.owner === user.id && (
                                    <button
                                        className="mx-4 px-2 py-1 bg-red-500 rounded-md"
                                        onClick={() =>
                                            handleRemoveUserFromGroup(member.id)
                                        }
                                    >
                                        Remove
                                    </button>
                                )}
                        </li>
                    ))
                ) : (
                    <p>No members yet.</p>
                )}
            </ul>
            <div>
                {user && user.id === group.owner && (
                    <div className="flex flex-row gap-5 my-5">
                        <button
                            className="px-3 py-2 text-sm bg-red-500 rounded-md cursor-pointer transition hover:bg-red-600"
                            onClick={handleDeleteGroup}
                        >
                            Delete Group
                        </button>
                        <button
                            className="px-3 py-2 text-sm bg-blue-500 rounded-md cursor-pointer transition hover:bg-blue-600"
                            onClick={() => setShowAddMembers(true)}
                        >
                            Add Members
                        </button>
                        <button
                            className="px-3 py-2 text-sm bg-yellow-500 rounded-md text-black cursor-pointer transition hover:bg-yellow-600"
                            onClick={() => goToGroupEdit(group.id)}
                        >
                            Edit Group
                        </button>
                    </div>
                )}
                {user &&
                    user.id != group.owner &&
                    group.members?.some((member) => member.id === user.id) && (
                        <>
                            <button
                                onClick={handleLeaveGroup}
                                style={{
                                    marginTop: "20px",
                                    padding: "10px 15px",
                                    backgroundColor: "#dc2626",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                🗑️ Leave Group
                            </button>
                        </>
                    )}
            </div>
            <div className="w-full flex flex-col justify-center items-center">
                {showAddMembers && (
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
                                className="bg-yellow-300 px-4 py-2 rounded-r-lg"
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
                                                    (member) =>
                                                        member.id === u.id
                                                )
                                        ) // Escludi l'utente attuale e i membri già nel gruppo
                                        .map((u) => (
                                            <li
                                                key={u.id}
                                                className="flex justify-between items-center bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={getAvatarUrl(u)}
                                                        alt="User avatar"
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                    <span className="text-white font-semibold">
                                                        {u.username}
                                                    </span>
                                                </div>
                                                <button
                                                    className="px-4 py-2 bg-green-600 text-black rounded-md hover:bg-green-500 transition"
                                                    onClick={() =>
                                                        handleAddUserToGroup(
                                                            u.id
                                                        )
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
                )}
            </div>
            {message && (
                <p className="mt-2 text-center text-yellow-400">{message}</p>
            )}
        </div>
    );
}

export default GroupProfile;
