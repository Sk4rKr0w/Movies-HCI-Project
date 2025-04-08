import { useEffect, useState } from "react";
import axios from "axios";

function GroupWatch() {
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return; // oppure: setError("You are not logged in.");
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
  
    
  const handleCreateGroup = async () => {
    const name = prompt("Enter a name for your new group:");
    if (!name || !user) {
      alert("Errore durante la creazione del gruppo.");
      return;
    } 

    try {
      const res = await axios.post("http://localhost:3001/api/creategroup/creategroup", {
        name,
        description: "New movie group created by user.",
        owner: user.id,
      });

      alert("Gruppo creato con successo!");
      setGroups((prev) => [...prev, res.data.group]);
    } catch (err) {
      console.error("Errore nella creazione del gruppo:", err);
      alert("Errore durante la creazione del gruppo.");
    }
  };

  const handleSearchGroup = () => {
    const groupName = prompt("Enter the group name you want to search for:");
    if (groupName) {
      alert(`Searching for group: ${groupName}`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📽️ Group Watch Dashboard</h2>
      {user && <p>Welcome, {user.username}!</p>}

      <button onClick={handleCreateGroup}>Create a Group</button>
      <button onClick={handleSearchGroup}>Search a Group</button>

      <h3>Your Groups</h3>
      <ul>
        {groups.map((group) => (
          <li key={group.id}>
            <strong>{group.name}</strong>: {group.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GroupWatch;
