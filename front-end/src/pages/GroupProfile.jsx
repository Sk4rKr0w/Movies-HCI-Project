import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';  // Per prendere l'ID del gruppo dalla URL

function GroupProfile() {
  const { id } = useParams(); // Estrae l'ID del gruppo dalla URL
  const [group, setGroup] = useState(null);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    // Recupera i dettagli del gruppo quando il componente viene caricato
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
      <p><strong>Owner:</strong> {group.owner}</p>
      
      <h3>Members</h3>
      <ul>
        {group.members && group.members.length > 0 ? (
          group.members.map((member) => (
            <li key={member.id}>{member.username}</li>
          ))
        ) : (
          <p>No members yet.</p>
        )}
      </ul>

      {/* Eventualmente puoi aggiungere opzioni per modificare il gruppo se l'utente è il proprietario */}
      {/* (Ad esempio: un pulsante per lasciare il gruppo o per modificarne le informazioni) */}
    </div>
  );
}

export default GroupProfile;
