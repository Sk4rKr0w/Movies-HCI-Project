import { useEffect, useState } from "react";
import axios from "axios";
import HelloUser from "../components/HelloUser";

function GroupWatch() {
  //if (!user) return <div>You must be logged in to access this page.</div>;

  // Simuliamo gruppi fittizi per la dashboard
  const [groups, setGroups] = useState([
    { id: 1, name: "Group 1", description: "A fun movie group!" },
    { id: 2, name: "Group 2", description: "Serious movies only." },
  ]);

  // Funzione per creare un nuovo gruppo
  const handleCreateGroup = () => {
    const groupName = prompt("Enter a name for your new group");
    if (groupName) {
      const newGroup = { id: groups.length + 1, name: groupName, description: "New movie group." };
      setGroups([...groups, newGroup]);
    }
  };

  // Funzione per cercare un gruppo (simulato)
  const handleSearchGroup = () => {
    const groupName = prompt("Enter the group name you want to search for:");
    if (groupName) {
      alert(`Searching for group: ${groupName}`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📽️ Group Watch Dashboard</h2>
      <p>Welcome, peppino!</p>

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
