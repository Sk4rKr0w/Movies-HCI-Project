import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Favorites from "./Favorites";
import WatchHistory from "./WatchHistory";
import supabase from "../supabaseClient";
import * as bcrypt from "bcryptjs";

function Profile() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [updateMessage, setUpdateMessage] = useState("");
    const [uploading, setUploading] = useState(false);

    const [showWelcomePopUp, setWelcomePopUp] = useState(() => {
        return localStorage.getItem("hideWelcomePopUp") !== "true";
    });
    const [editingPassword, setEditingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [genres, setGenres] = useState([]);
    const GENRES = [
        "Action",
        "Adventure",
        "Animation",
        "Comedy",
        "Crime",
        "Documentary",
        "Drama",
        "Family",
        "Fantasy",
        "History",
        "Horror",
        "Music",
        "Mystery",
        "Romance",
        "Science Fiction",
        "TV Movie",
        "Thriller",
        "War",
        "Western",
    ];

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
        if (!localStorage.getItem("token")) setError("You are not logged in.");
    }, []);

    useEffect(() => {
        const fetchGenres = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await fetch("http://localhost:3001/api/users/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.favorite_genres) {
                    setGenres(data.favorite_genres);
                }
            } catch (err) {
                console.error("Error while retrieving genres:", err);
            }
        };

        fetchGenres();
    }, []);

    const refreshUser = (data) => {
        data;
        localStorage.setItem("user", JSON.stringify(data));
        setUpdateMessage("✅ Changes saved successfully!");

        setTimeout(() => {
            window.location.reload();
        }, 1500);
    };

    const getAvatarUrl = () => {
        if (!user?.avatar_url)
            return supabase.storage
                .from("avatars")
                .getPublicUrl("default_avatar.png").data.publicUrl;
        return supabase.storage.from("avatars").getPublicUrl(user.avatar_url)
            .data.publicUrl;
    };

    const handleUsernameUpdate = async () => {
        if (!newUsername.trim()) return;
        const { data, error } = await supabase
            .from("users")
            .update({ username: newUsername })
            .eq("id", user.id)
            .select()
            .single();

        if (error) setUpdateMessage("❌ Update failed");
        else {
            setUpdateMessage("✅ Username updated!");
            refreshUser(data);
        }
    };

    const handlePasswordUpdate = async () => {
        if (newPassword.length < 6) {
            setUpdateMessage("❌ Password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setUpdateMessage("❌ Passwords do not match.");
            return;
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        const { data, error } = await supabase
            .from("users")
            .update({ password: hashed })
            .eq("id", user.id)
            .select()
            .single();

        if (error) setUpdateMessage("❌ Failed to update password");
        else {
            setUpdateMessage("✅ Password updated!");
            refreshUser(data);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !user) return;

        const allowedTypes = ["image/jpeg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            setUpdateMessage("❌ Only JPG or PNG images allowed.");
            return;
        }
        if (file.size > 1024 * 1024) {
            setUpdateMessage("❌ Image must be smaller than 1MB.");
            return;
        }

        setUploading(true);
        const fileExt = file.name.split(".").pop();
        const filePath = `user_${user.id}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, file);
        if (uploadError) {
            setUpdateMessage("❌ Failed to upload image");
            setUploading(false);
            return;
        }

        const { data, error: updateError } = await supabase
            .from("users")
            .update({ avatar_url: filePath })
            .eq("id", user.id)
            .select()
            .single();

        if (updateError) setUpdateMessage("❌ Failed to update user profile");
        else {
            setUser(data);
            localStorage.setItem("user", JSON.stringify(data));
            setUpdateMessage("✅ Avatar updated!");
            window.location.reload();
        }

        setUploading(false);
    };

    const handleResetAvatar = async () => {
        const { data, error } = await supabase
            .from("users")
            .update({ avatar_url: "default_avatar.png" })
            .eq("id", user.id)
            .select()
            .single();

        if (error) setUpdateMessage("❌ Failed to reset avatar");
        else {
            setUpdateMessage("✅ Avatar reset!");
            refreshUser(data);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] text-red-400 text-lg px-4">
                <span>⚠️ {error}</span>
                <NavLink to="/signin" className={"text-yellow-400"}>
                    Try to login!
                </NavLink>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-black via-[#121212] to-[#1e1e1e] text-white px-4 py-8 flex flex-col items-center">
            <div className="w-full lg:w-[75%] mx-auto bg-[#1e1e1e] text-white rounded-lg shadow-2xl p-6 md:p-10 space-y-8">
                <h2 className="text-3xl font-bold text-center text-yellow-400">
                    {user ? `👤 Your Profile 👤` : "Loading..."}
                </h2>

                {user ? (
                    <>
                        {/* Avatar + Info */}
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="flex flex-col items-center">
                                {getAvatarUrl() ? (
                                    <img
                                        src={getAvatarUrl()}
                                        alt="Avatar"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-yellow-500"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-4xl font-bold border-4 border-gray-500">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                )}

                                <label className="mt-4 text-sm text-yellow-400 hover:underline cursor-pointer">
                                    {uploading
                                        ? "Uploading..."
                                        : "Upload new avatar"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        className="hidden"
                                    />
                                </label>

                                {user.avatar_url !== "default_avatar.png" && (
                                    <button
                                        onClick={handleResetAvatar}
                                        className="mt-1 text-xs text-red-400 hover:text-red-500 underline"
                                    >
                                        Reset to default avatar
                                    </button>
                                )}
                            </div>

                            {/* Info & Settings */}
                            <div className="flex-1 w-full space-y-4">
                                <div className="text-sm text-gray-400">
                                    <p>ID: {user.id}</p>
                                    <p>Email: {user.email}</p>
                                </div>

                                {/* Username Section */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">
                                        Username
                                    </label>
                                    {editing ? (
                                        <>
                                            <input
                                                type="text"
                                                value={newUsername}
                                                onChange={(e) =>
                                                    setNewUsername(
                                                        e.target.value
                                                    )
                                                }
                                                className="bg-[#2c2c2c] text-white px-3 py-2 rounded w-full mb-2"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={
                                                        handleUsernameUpdate
                                                    }
                                                    className="cursor-pointer flex-1 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditing(false);
                                                        setNewUsername("");
                                                    }}
                                                    className="cursor-pointer flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-between bg-[#2c2c2c] px-3 py-2 rounded">
                                            <span className="text-white">
                                                {user.username}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setEditing(true);
                                                    setNewUsername(
                                                        user.username
                                                    );
                                                }}
                                                className="cursor-pointer text-yellow-400 hover:text-yellow-500 underline text-sm"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Password Section */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">
                                        Password
                                    </label>
                                    {editingPassword ? (
                                        <>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) =>
                                                    setNewPassword(
                                                        e.target.value
                                                    )
                                                }
                                                className="bg-[#2c2c2c] text-white px-3 py-2 rounded w-full mb-2"
                                                placeholder="New password"
                                            />
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) =>
                                                    setConfirmPassword(
                                                        e.target.value
                                                    )
                                                }
                                                className="bg-[#2c2c2c] text-white px-3 py-2 rounded w-full mb-3"
                                                placeholder="Confirm password"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={
                                                        handlePasswordUpdate
                                                    }
                                                    className="cursor-pointer flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingPassword(
                                                            false
                                                        );
                                                        setNewPassword("");
                                                        setConfirmPassword("");
                                                    }}
                                                    className="cursor-pointer flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-between bg-[#2c2c2c] px-3 py-2 rounded">
                                            <span>••••••••</span>
                                            <button
                                                onClick={() =>
                                                    setEditingPassword(true)
                                                }
                                                className="text-yellow-400 hover:text-yellow-500 underline text-sm"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {updateMessage && (
                            <div
                                className={`text-sm px-4 py-2 rounded text-center transition-all duration-300 ${
                                    updateMessage.startsWith("✅")
                                        ? "bg-green-600 text-white"
                                        : "bg-red-600 text-white"
                                }`}
                            >
                                {updateMessage}
                            </div>
                        )}

                        <div className="text-left mt-6">
                            <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                                Favorite Genres
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {GENRES.map((genre) => (
                                    <label
                                        key={genre}
                                        className="flex items-center gap-2 text-white"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={genres.includes(genre)}
                                            onChange={() =>
                                                setGenres((prev) =>
                                                    prev.includes(genre)
                                                        ? prev.filter(
                                                              (g) => g !== genre
                                                          )
                                                        : [...prev, genre]
                                                )
                                            }
                                        />
                                        {genre}
                                    </label>
                                ))}
                            </div>
                            <button
                                onClick={async () => {
                                    const token = localStorage.getItem("token");
                                    try {
                                        await fetch(
                                            "http://localhost:3001/api/users/update-genres",
                                            {
                                                method: "PUT",
                                                headers: {
                                                    "Content-Type":
                                                        "application/json",
                                                    Authorization: `Bearer ${token}`,
                                                },
                                                body: JSON.stringify({
                                                    favorite_genres: genres,
                                                }),
                                            }
                                        );
                                        setUpdateMessage(
                                            "✅ Genres update successfully!"
                                        );
                                    } catch (err) {
                                        console.error(err);
                                        setUpdateMessage(
                                            "❌ Error while updating genres."
                                        );
                                    }
                                }}
                                className="font-medium mt-6 bg-yellow-400 hover:bg-yellow-500 text-black py-2 px-4 rounded"
                            >
                                Save Preferences
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-center">Loading...</p>
                )}
            </div>

            <div className="w-full lg:w-[90%] mt-10 space-y-6">
                <Favorites />
                <WatchHistory />
            </div>

            {showWelcomePopUp && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                    <div className="bg-yellow-400 text-black rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4 text-center overflow-y-auto max-h-[90vh]">
                        <h2 className="text-3xl font-bold mb-4">
                            🎉 Welcome to GURUFILM! 🎉
                        </h2>
                        <p className="mb-3">
                            We are so excited to have you here! GURUFILM is your
                            personal hub for discovering, exploring, and
                            enjoying movies and series tailored exactly to your
                            tastes and vibes.
                        </p>
                        <ul className="list-disc list-inside mb-4 text-left">
                            <li className="my-2">
                                🎬 Get smart, personalized recommendations based
                                on your favorite genres — curated just for you.
                            </li>
                            <li className="my-2">
                                💡 Take our interactive mood quiz to find the
                                perfect movie for how you (or your group) feel
                                right now.
                            </li>
                            <li className="my-2">
                                🎲 Feeling adventurous? Spin the roulette and
                                discover something totally unexpected!
                            </li>
                            <li className="my-2">
                                👥 Create or join private groups to share lists,
                                vote on what to watch, and enjoy content
                                together with your friends.
                            </li>
                            <li className="my-2">
                                📌 Keep track of your favorite titles and
                                everything you’ve watched — all in one place.
                            </li>
                        </ul>
                        <button
                            onClick={() => {
                                localStorage.setItem(
                                    "hideWelcomePopUp",
                                    "true"
                                );
                                setWelcomePopUp(false);
                            }}
                            className="cursor-pointer bg-black text-yellow-400 px-4 py-2 rounded hover:bg-gray-800"
                        >
                            Close and start exploring!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
