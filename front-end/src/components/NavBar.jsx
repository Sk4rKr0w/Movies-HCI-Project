import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";
import HamburgerIcon from "./HamburgerIcon";
import logo from "../assets/images/logo.svg";
import supabase from "../supabaseClient";

function NavBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Recupera l'utente da localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Aggiorna anche se localStorage cambia da un'altra tab
    const syncUser = (e) => {
      if (e.key === "user") {
        const newUser = e.newValue ? JSON.parse(e.newValue) : null;
        setUser(newUser);
      }
    };

    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const getAvatarUrl = () => {
    if (!user?.avatar_url) return null;
    return supabase.storage.from("avatars").getPublicUrl(user.avatar_url).data.publicUrl;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/signin");
    window.location.reload();
  };

  return (
    <nav className="h-[92px] w-full bg-[#121212] text-white flex items-center justify-between px-6">
      <NavLink to="/">
        <img
          src={logo}
          alt="Logo dell'applicazione"
          className="h-5 md:ml-10 lg:ml-25"
        />
      </NavLink>

      <div className="hidden md:flex md:gap-5 md:text-center md:flex-row md:space-x-2 lg:space-x-5">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "text-yellow-400" : "hover:text-gray-500 transition"
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive ? "text-yellow-400" : "hover:text-gray-500 transition"
          }
        >
          About
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            isActive ? "text-yellow-400" : "hover:text-gray-500 transition"
          }
        >
          Contact
        </NavLink>
      </div>

      <div className="flex items-center gap-6">
        {user && (
          <div
            onClick={() => navigate("/profile")}
            className="hidden md:flex items-center gap-3 cursor-pointer hover:opacity-90 transition"
            title="Go to profile"
          >
            {getAvatarUrl() ? (
              <img
                src={getAvatarUrl()}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border-2 border-yellow-400"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                {user.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-yellow-400 font-bold underline">
              {user.username}
            </span>
          </div>
        )}

        {user ? (
          <button
            onClick={handleLogout}
            className="text-sm bg-yellow-400 text-black px-4 py-2 rounded-full hover:bg-yellow-300 transition"
          >
            Logout
          </button>
        ) : (
          <NavLink
            to="/signin"
            className="text-sm bg-white text-black px-4 py-2 rounded-full hover:bg-gray-300 transition"
          >
            Login
          </NavLink>
        )}

        <SearchBar />

        <HamburgerIcon onClick={() => setSidebarOpen(true)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      </div>
    </nav>
  );
}

export default NavBar;
