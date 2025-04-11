import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import supabase from "../supabaseClient";
import * as bcrypt from "bcryptjs";

function Profile() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [updateMessage, setUpdateMessage] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setError("You are not logged in.");
        }
    }, []);

    const refreshUser = (data) => {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
        window.location.reload();
    };

    const getAvatarUrl = () => {
        if (!user?.avatar_url) return null;
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

        if (error) {
            setUpdateMessage("❌ Update failed");
        } else {
            setUpdateMessage("✅ Username updated!");
            refreshUser(data);
        }
    };

    const handlePasswordUpdate = async () => {
        if (!newPassword.trim() || newPassword.length < 6) {
            setUpdateMessage("❌ Password must be at least 6 characters.");
            return;
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        const { data, error } = await supabase
            .from("users")
            .update({ password: hashed })
            .eq("id", user.id)
            .select()
            .single();

        if (error) {
            setUpdateMessage("❌ Failed to update password");
        } else {
            setUpdateMessage("✅ Password updated!");
            refreshUser(data);
        }

        setNewPassword("");
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !user) return;

        // ✅ Validazione: solo JPG o PNG, max 1MB
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

        // ✅ Usa un nome univoco con timestamp
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

        // ✅ Aggiorna avatar_url nel DB
        const { data, error: updateError } = await supabase
            .from("users")
            .update({ avatar_url: filePath })
            .eq("id", user.id)
            .select()
            .single();

        if (updateError) {
            setUpdateMessage("❌ Failed to update user profile");
        } else {
            setUser(data);
            localStorage.setItem("user", JSON.stringify(data));
            setUpdateMessage("✅ Avatar updated!");
            window.location.reload(); // ✅ Refresh per riflettere i cambiamenti ovunque
        }

        setUploading(false);
    };

    const handleResetAvatar = async () => {
        const { data, error } = await supabase
            .from("users")
            .update({ avatar_url: null })
            .eq("id", user.id)
            .select()
            .single();

        if (error) {
            setUpdateMessage("❌ Failed to reset avatar");
        } else {
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
        <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white px-4">
            <div className="bg-[#1e1e1e] p-8 rounded-lg shadow-xl text-center max-w-md w-full">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    👤 User Profile
                </h2>

                {user ? (
                    <>
                        {getAvatarUrl() ? (
                            <img
                                src={getAvatarUrl()}
                                alt="Avatar"
                                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-yellow-400"
                            />
                        ) : (
                            <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                        )}

                        <label className="block text-sm text-gray-400 mb-2 cursor-pointer hover:underline">
                            {uploading ? "Uploading..." : "Upload new avatar"}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                            />
                        </label>

                        {user.avatar_url && (
                            <button
                                onClick={handleResetAvatar}
                                className="cursor-pointer text-sm text-red-400 underline mb-4"
                            >
                                Reset to default avatar
                            </button>
                        )}

                        <p className="text-left text-md md:text-lg mb-2">
                            <strong>ID:</strong> {user.id}
                        </p>

                        <p className="text-left text-md md:text-lg mb-2">
                            <strong>Email:</strong> {user.email}
                        </p>

                        {/* Username */}
                        {editing ? (
                            <div className="mb-4">
                                <label className="text-left block text-md md:text-lg mb-2">
                                    <strong>New Username:</strong>
                                </label>
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) =>
                                        setNewUsername(e.target.value)
                                    }
                                    className="border border-gray-400 w-full px-3 py-2 rounded"
                                />
                                <div className="w-full mt-3 flex gap-2 justify-center">
                                    <button
                                        onClick={handleUsernameUpdate}
                                        className="w-[50%] bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditing(false);
                                            setNewUsername("");
                                        }}
                                        className="w-[50%] bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-left text-lg mb-4">
                                <strong>Username:</strong> {user.username}{" "}
                                <button
                                    onClick={() => {
                                        setEditing(true);
                                        setNewUsername(user.username);
                                    }}
                                    className="cursor-pointer ml-2 text-md text-yellow-400 hover:text-yellow-700 transition underline"
                                >
                                    Edit
                                </button>
                            </p>
                        )}

                        {/* Password */}
                        <div className="mb-4 mt-6 text-left">
                            <label className="block text-md md:text-lg mb-2 font-semibold">
                                Change Password
                            </label>
                            <input
                                type="password"
                                placeholder="New password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="border border-gray-400 w-full px-3 py-2 rounded"
                            />
                            <button
                                onClick={handlePasswordUpdate}
                                className="w-full mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 transition"
                            >
                                Save New Password
                            </button>
                        </div>

                        {updateMessage && (
                            <p className="text-sm text-green-400 mt-2">
                                {updateMessage}
                            </p>
                        )}
                    </>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
}

export default Profile;
