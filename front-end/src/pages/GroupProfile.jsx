import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';  // Per prendere l'ID del gruppo dalla URL

function GroupProfile() {
  const { id } = useParams(); // Estrae l'ID del gruppo dalla URL
  const [group, setGroup] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Recupera i dettagli del gruppo quando il componente viene caricato
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const fetchGroupDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/profilegroup/profilegroup?id=${id}`); // Endpoint che recupera i dettagli del gruppo
        setGroup(res.data.group); // Presupponendo che la risposta contenga il gruppo
      } catch (err) {
        setError('Errore nel recupero dei dettagli del gruppo.');
        console.error(err);
      }
    };

    fetchGroupDetails();
  }, [id]);  // Effettua la chiamata ogni volta che l'ID cambia

  const handleDeleteGroup = async () => {
    if (!window.confirm("Sei sicuro di voler eliminare questo gruppo?")) return;

    try {
      await axios.delete(`http://localhost:3001/api/profileGroup/delete?id=${group.id}`);
      alert("Gruppo eliminato con successo.");
      navigate("/groupwatch");
    } catch (err) {
      console.error("Errore durante l'eliminazione del gruppo:", err);
      alert("Errore durante l'eliminazione del gruppo.");
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm("Sei sicuro di voler abbandonare questo gruppo?")) return;
      
    try {
      await axios.post(`http://localhost:3001/api/leavegroup/leavegroup`, {
        groupId: group.id,
        userId: user.id,
      });
      alert("Gruppo abbandonato con successo.");
      navigate("/groupwatch");
    } catch (err) {
      console.error("Errore durante l'abbandono del gruppo:", err);
      alert("Errore durante l'abbandono del gruppo.");
    }
  };

  const handleSearchUsers = async () => {
    if (!searchInput.trim()) return;
  
    try {
      const res = await axios.get(`http://localhost:3001/api/searchmembersgroup/searchMembersGroup?username=${searchInput}`);
      setSearchResults(res.data.users);
    } catch (err) {
      console.error("Errore nella ricerca degli utenti:", err);
      alert("Errore nella ricerca degli utenti.");
    }
  };
  
  const handleAddUserToGroup = async (userIdToAdd) => {
    try {
      await axios.post("http://localhost:3001/api/addmembersgroup/addMembersGroup", {
        groupId: group.id,
        userId: userIdToAdd,
      });
      alert("Utente aggiunto con successo!");
      setSearchInput("");
      setSearchResults([]);
      window.location.reload();
    } catch (err) {
      console.error("Errore durante l'aggiunta dell'utente al gruppo:", err);
      alert("Errore durante l'aggiunta dell'utente.");
    }
  };  

  const handleRemoveUserFromGroup = async (userIdToRemove) => {
    if (!window.confirm("Sei sicuro di voler rimuovere questo membro dal gruppo?")) return;
    try {
      await axios.post("http://localhost:3001/api/removemembersgroup/removeMembersGroup", {
        groupId: group.id,
        userId: userIdToRemove,
      });
      alert("Utente rimosso con successo!");
      window.location.reload(); // oppure aggiorna lo stato del gruppo manualmente
    } catch (err) {
      console.error("Errore durante la rimozione dell'utente dal gruppo:", err);
      alert("Errore durante la rimozione dell'utente.");
    }
  };  

  if (error) {
    return <div>{error}</div>;
  }

  if (!group) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>{group.name} - Group Profile</h2>
      <p><strong>Description:</strong> {group.description}</p>
      <p><strong>Owner:</strong> {group.owner_username}</p>
      
      <h3><strong>Members:</strong></h3>
      <ul>
        {group.members && group.members.length > 0 ? (
          group.members.map((member) => (
            <li key={member.id}>{member.username}
            {user && group.owner === user.id && (
              <button
                style={{
                  marginLeft: "10px",
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  cursor: "pointer"
                }}
                onClick={() => handleRemoveUserFromGroup(member.id)}
              >
                Remove
              </button>
            )}
            </li>
          ))
        ) : (
          <p>No members yet.</p>
        )}
        {user && user.id === group.owner && (
          <>
          <button
            onClick={handleDeleteGroup}
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
            🗑️ Delete Group
          </button>
          <button onClick={() => setShowAddMembers(true)}>
            Add Members
          </button>
          <button onClick={() => goToGroupProfile(group.id)}><strong>Edit Group</strong></button>
          </>
        )}
        {user && user.id != group.owner && (
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
        {showAddMembers && (
          <div style={{ marginTop: 20 }}>
            <input
              type="text"
              placeholder="Cerca per username"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ marginRight: 10 }}
            />
            <button onClick={handleSearchUsers}>Cerca</button>

            {searchResults.length > 0 && (
              <ul style={{ marginTop: 10 }}>
                {searchResults.map((u) => (
                  <li key={u.id}>
                    {u.username}
                    <button
                      onClick={() => handleAddUserToGroup(u.id)}
                      style={{ marginLeft: 10 }}
                    >
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </ul>
    </div>
  );
}

export default GroupProfile;
