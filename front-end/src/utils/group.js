export const handleCreateGroup = async () => {
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

export const handleSearchGroup = async () => {
    const groupName = prompt("Enter the group name you want to search for:");
    if (!groupName) return;
  
    try {
      const res = await axios.get(`http://localhost:3001/api/searchgroup/searchgroup?name=${groupName}`);
      setSearchResults(res.data.groups); // supponendo che res.data.groups sia l’array restituito
    } catch (err) {
      console.error("Errore durante la ricerca del gruppo:", err);
      alert("Errore nella ricerca del gruppo.");
    }
  };  