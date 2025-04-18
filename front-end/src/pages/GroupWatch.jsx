import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import * as bcrypt from "bcryptjs";

function GroupWatch() {
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchMessage, setSearchMessage] = useState("");
  const navigate = useNavigate();
  const goToGroupProfile = (groupId) => {
    navigate(`/groupprofile/${groupId}`);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const token = localStorage.getItem("token");
    if (!token) {
      //setError("You are not logged in.");
      return;
    }
  
    axios.get("http://localhost:3001/api/protected/profile", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.data.error) {
          console.error("Errore:", res.data.error);
        } else {
          setUser(res.data.user);
        }
      })
      .catch((err) => {
        console.error("Errore nel recupero utente:", err);
      });
  }, []);

  useEffect(() => {
    if (user && user.id) {
      handleYourGroups();
    }
  }, [user]);
    
  const handleSearchGroup = async () => {
    const groupName = prompt("Enter the group name you want to search for:");
    if (!groupName) return;
  
    try {
      const res = await axios.get(`http://localhost:3001/api/searchgroup/searchgroup`, {
        params: {
          name: groupName,
          userId: user.id,
        }
      });      
      setSearchResults(res.data.groups); // supponendo che res.data.groups sia l’array restituito
      setSearchMessage(res.data.message || "");
    } catch (err) {
      console.error("Errore durante la ricerca del gruppo:", err);
      alert("Errore nella ricerca del gruppo.");
    }
  };  

  const handleJoinGroup = async (groupName) => {
    if (!groupName) return;
  
    try {
      await axios.post(`http://localhost:3001/api/joingroup/joingroup`, {
        groupId: groupName,
        userId: user.id,
      });           
      alert("Sei entrato nel gruppo con successo!");
      window.location.reload();
    } catch (err) {
      console.error("Errore durante il tentativo di unione al gruppo:", err);
      alert("Errore nell'unione al gruppo.");
    }
  };

  const handleYourGroups = async () => {
    if (!user || !user.id) {
      console.error("No user logged in or user ID missing");
      return;
    }

    try {
      const res = await axios.get(`http://localhost:3001/api/yourgroups/yourgroups?userId=${user.id}`);
      setGroups(res.data.groups); // Supponendo che l'API restituisca un array di gruppi
    } catch (err) {
      console.error("Errore durante il recupero dei gruppi dell'utente:", err);
      alert("Errore nel recupero dei gruppi.");
    }
  };

  const moveToCreation = () => {
    navigate("/groupcreation")
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📽️ Group Watch Dashboard</h2>
      {user && <p>Welcome, {user.username}!</p>}

      <button onClick={moveToCreation}>Create a Group</button><br />
      <button onClick={handleSearchGroup}>Search a Group</button>

      <h3>Your Groups</h3>
      {groups.length === 0 ? (
        <p>
        {user
          ? "You don't have any groups yet."
          : "Please log in to see your groups."}
        </p>
      ) : (
        <ul>
          {groups.map((group) => (
            <li key={group.id}>
              <strong>{group.name}</strong>: {group.description}{" "}
              <button onClick={() => goToGroupProfile(group.id)}><strong>View Group</strong></button>
            </li>
          ))}
        </ul>
      )}
      {searchResults.length > 0 && (
        <div>
          <h3>🔍 Risultati della ricerca</h3>
          <ul>
            {searchResults.map((group) => (
              <li key={group.id}>
                <strong>{group.name}</strong>: {group.description}{" "}
                <button onClick={() => goToGroupProfile(group.id)}>
                  <strong>View Group</strong>
                </button>
                <button onClick={() => handleJoinGroup(group.id)}>
                  <strong>Join Group</strong>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {searchMessage && (
        <p style={{ color: "gray", marginTop: "10px" }}>{searchMessage}</p>
      )}
    </div>
  );
}

export default GroupWatch;
