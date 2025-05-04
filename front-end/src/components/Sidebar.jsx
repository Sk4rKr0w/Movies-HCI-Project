import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SearchBar from "../components/Searchbar";
import closeIcon from "../assets/images/close.svg";
import supabase from "../supabaseClient";

function Sidebar({ isOpen, onClose }) {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));

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
        if (!user?.avatar_url || user.avatar_url === "default_avatar.png") {
            return supabase.storage
                .from("avatars")
                .getPublicUrl("default_avatar.png").data.publicUrl;
        }
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
            className={`fixed top-0 right-0 h-screen w-1/2 md:w-1/4 backdrop-blur-md bg-black/50 z-50
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
            <div className="flex flex-col h-full">
                {/* Top: Close button */}
                <div className="flex justify-end p-4">
                    <button onClick={onClose} aria-label="Close Sidebar">
                        <img
                            src={closeIcon}
                            alt="Close"
                            className="w-6 h-6 cursor-pointer"
                        />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto max-h-full px-5 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
                    <ul className="flex flex-col items-center space-y-4">
                        <div className="w-full flex flex-col justify-center items-center gap-2">
                            {user && (
                                <div
                                    onClick={() => navigate("/profile")}
                                    className="lg:w-[50%] w-full flex flex-col justify-center items-center gap-2 cursor-pointer hover:opacity-90 transition"
                                    title="Go to profile"
                                >
                                    <img
                                        src={getAvatarUrl()}
                                        alt="Avatar"
                                        className="w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full object-cover border-2 border-yellow-400"
                                    />
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
                                <div className="flex flex-col w-full justify-center items-center gap-2">
                                    <NavLink
                                        to="/signin"
                                        className="border-2 border-black w-[75%] lg:w-[50%] text-center cursor-pointer text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-yellow-400 transition"
                                    >
                                        Sign In
                                    </NavLink>
                                    <NavLink
                                        to="/signup"
                                        className="border-2 border-white w-[75%] lg:w-[50%] text-center cursor-pointer text-sm font-medium bg-black text-yellow-400 px-4 py-2 rounded-full hover:bg-yellow-400 hover:text-black transition"
                                    >
                                        Sign Up
                                    </NavLink>
                                </div>
                            )}
                        </div>

                        <hr className="w-full" />

                        <SearchBar className="flex flex-col md:hidden my-2 w-full" />

                        <NavLink
                            to="/"
                            className="hover:text-yellow-400 transition hover:scale-105 w-full text-md my-2"
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to="/profile"
                            className="hover:text-yellow-400 transition hover:scale-105 w-full text-md my-2"
                        >
                            Profile
                        </NavLink>
                        <NavLink
                            to="/groupwatch"
                            className="hover:text-yellow-400 transition hover:scale-105 w-full text-md my-2"
                        >
                            GroupWatch
                        </NavLink>
                        <NavLink
                            to="/about"
                            className="hover:text-yellow-400 transition hover:scale-105 w-full text-md my-2"
                        >
                            About
                        </NavLink>
                        <NavLink
                            to="/contact"
                            className="hover:text-yellow-400 transition hover:scale-105 w-full text-md my-2"
                        >
                            Contact Us
                        </NavLink>
                        <NavLink
                            to="/slotmachine"
                            className="hover:text-yellow-400 transition hover:scale-105 w-full text-md my-2"
                        >
                            Give it a try
                        </NavLink>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
