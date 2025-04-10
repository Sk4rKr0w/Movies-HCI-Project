import { useEffect, useState } from "react";
import Profile from "../pages/Profile";

function HelloUser() {
  const [user, setUser] = useState(null);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    fetch("http://localhost:3001/api/protected/profile", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setUser(data.user);
        }
      })
      .catch((err) => {
        console.error("Errore nel recupero utente in HelloUser:", err);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/"; // oppure "/login"
  };

  if (!user) return null;

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setShowLogout(true)}
      onMouseLeave={() => setShowLogout(false)}
    >
      <button>Hello, {user.username}!</button>

      {showLogout && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            backgroundColor: "#000000",
            border: "1px solid #ccc",
            padding: "5px 10px",
            cursor: "pointer",
            zIndex: 10
          }}
          onClick={handleLogout}
        >
          Log out
        </div>
      )}
    </div>
  );
}

export default HelloUser;
