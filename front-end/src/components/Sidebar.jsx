import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import closeIcon from "../assets/images/close.svg";
import supabase from "../supabaseClient";

function Sidebar({ isOpen, onClose }) {
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
        return supabase.storage.from("avatars").getPublicUrl(user.avatar_url)
            .data.publicUrl;
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/");
        window.location.reload();
    };

    return (
        <div
            className={`fixed top-0 right-0 h-screen w-1/2 md:w-1/4 p-5 backdrop-blur-md bg-black/50 z-50
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
            <button onClick={onClose} aria-label="Close Sidebar">
                <img
                    src={closeIcon}
                    alt="Close Button"
                    className="cursor-pointer w-6 h-6"
                />
            </button>

            <ul className="flex flex-col items-center space-y-4 mt-8">
                <div className="w-full flex flex-col justify-center items-center lg:flex-row gap-2">
                    {user && (
                        <div
                            onClick={() => navigate("/profile")}
                            className="lg:w-[50%] w-full flex flex-row justify-center items-center gap-2 cursor-pointer hover:opacity-90 transition"
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
                        <NavLink
                            onClick={handleLogout}
                            className="w-[75%] lg:w-[50%] text-center cursor-pointer text-sm bg-yellow-400 text-black px-4 py-2 rounded-full hover:bg-yellow-300 transition"
                        >
                            Logout
                        </NavLink>
                    ) : (
                        <NavLink
                            to="/signin"
                            className="w-[75%] lg:w-[50%] text-center cursor-pointer text-sm bg-white text-black px-4 py-2 rounded-full hover:bg-yellow-400 transition"
                        >
                            Login
                        </NavLink>
                    )}
                </div>
                <hr className="w-full" />
                <NavLink
                    to="/"
                    className={
                        "hover:text-yellow-400 transition hover:scale-105 w-full text-md"
                    }
                >
                    Home
                </NavLink>
                <NavLink
                    to="/profile"
                    className={
                        "hover:text-yellow-400 transition hover:scale-105 w-full text-md"
                    }
                >
                    Profile
                </NavLink>
                <NavLink
                    to="/groupwatch"
                    className={
                        "hover:text-yellow-400 transition hover:scale-105 w-full text-md"
                    }
                >
                    GroupWatch
                </NavLink>
                <NavLink
                    to="/about"
                    className={
                        "hover:text-yellow-400 transition hover:scale-105 w-full text-md"
                    }
                >
                    About
                </NavLink>
                <NavLink
                    to="/contact"
                    className={
                        "hover:text-yellow-400 transition hover:scale-105 w-full text-md"
                    }
                >
                    Contact Us
                </NavLink>
                <NavLink
                    to="/"
                    className={
                        "hover:text-yellow-400 transition hover:scale-105 w-full text-md"
                    }
                >
                    BOH POI SI VEDE
                </NavLink>
            </ul>
        </div>
    );
}

export default Sidebar;
