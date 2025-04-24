import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import supabase from "../supabaseClient";
import * as bcrypt from "bcryptjs";

function Profile() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [updateMessage, setUpdateMessage] = useState("");
    const [uploading, setUploading] = useState(false);

    const [editingPassword, setEditingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
        if (!localStorage.getItem("token")) setError("You are not logged in.");
    }, []);

    const refreshUser = (data) => {
        (data);
        localStorage.setItem("user", JSON.stringify(data));
        setUpdateMessage("✅ Modifiche salvate con successo!");

        setTimeout(() => {
            window.location.reload();
        }, 1500);
    };

    const getAvatarUrl = () => {
        if (!user?.avatar_url) return supabase.storage.from("avatars").getPublicUrl("default_avatar.png").data.publicUrl;
        return supabase.storage.from("avatars").getPublicUrl(user.avatar_url).data.publicUrl;
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
        <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white px-4">
            <div className="my-4 bg-[#1e1e1e] p-8 rounded-lg shadow-xl text-center max-w-md w-full">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
                    👤 {user ? `${user.username}'s Profile` : "Loading..."} 👤
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

                        {user.avatar_url && user.avatar_url !== "default_avatar.png" && (
                            <button
                                onClick={handleResetAvatar}
                                className="cursor-pointer hover:text-red-700 text-sm text-red-400 underline mb-4"
                            >
                                Reset to default avatar
                            </button>
                        )}

                        <p className="text-left mb-2">
                            <strong>ID:</strong> {user.id}
                        </p>
                        <p className="text-left mb-2">
                            <strong>Email:</strong> {user.email}
                        </p>

                        {editing ? (
                            <div className="mb-4">
                                <label className="text-left block mb-2">
                                    <strong>New Username:</strong>
                                </label>
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) =>
                                        setNewUsername(e.target.value)
                                    }
                                    className="text-sm md:text-md bg-[#2c2c2c] w-full px-3 py-2 rounded text-white"
                                />
                                <div className="mt-3 flex gap-2 justify-center">
                                    <button
                                        onClick={handleUsernameUpdate}
                                        className="text-sm md:text-md cursor-pointer hover:bg-yellow-700 transition w-[50%] bg-yellow-500 text-black px-4 py-2 rounded"
                                    >
                                        Save Username
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditing(false);
                                            setNewUsername("");
                                        }}
                                        className="text-sm md:text-md cursor-pointer hover:bg-gray-700 transition w-[50%] bg-gray-500 text-white px-4 py-2 rounded"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-left mb-4">
                                <strong>Username:</strong> {user.username}
                                <button
                                    onClick={() => {
                                        setEditing(true);
                                        setNewUsername(user.username);
                                    }}
                                    className="cursor-pointer hover:text-yellow-700 ml-2 text-sm text-yellow-400 underline"
                                >
                                    Edit
                                </button>
                            </p>
                        )}

                        {editingPassword ? (
                            <div className="mb-4 mt-6 text-left">
                                <label className="block mb-2 font-semibold">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="New password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    className="text-sm md:text-md bg-[#2c2c2c] w-full px-3 py-2 rounded text-white"
                                />
                                <label className="block mb-2 font-semibold mt-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    className="text-sm md:text-md bg-[#2c2c2c] w-full px-3 py-2 rounded text-white"
                                />
                                <div className="mt-3 flex gap-2 justify-center">
                                    <button
                                        onClick={handlePasswordUpdate}
                                        className="text-sm md:text-sm cursor-pointer hover:bg-blue-700 transition w-[50%] bg-blue-500 text-white px-4 py-2 rounded"
                                    >
                                        Save Password
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingPassword(false);
                                            setNewPassword("");
                                            setConfirmPassword("");
                                        }}
                                        className="text-sm md:text-sm cursor-pointer hover:bg-gray-700 transition w-[50%] bg-gray-500 text-white px-4 py-2 rounded"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-left mb-4">
                                <strong>Password:</strong> ••••••••
                                <button
                                    onClick={() => setEditingPassword(true)}
                                    className="cursor-pointer hover:text-yellow-700 ml-2 text-sm text-yellow-400 underline"
                                >
                                    Edit
                                </button>
                            </p>
                        )}

                        {updateMessage && (
                            <div
                                className={`mt-4 text-sm px-4 py-2 rounded transition-all duration-300 ${
                                    updateMessage.startsWith("✅")
                                        ? "bg-green-600 text-white"
                                        : "bg-red-600 text-white"
                                }`}
                            >
                                {updateMessage}
                            </div>
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
