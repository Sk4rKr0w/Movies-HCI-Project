import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

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

  const getAvatarUrl = () => {
    if (!user?.avatar_url) return null;
    return supabase.storage.from("avatars").getPublicUrl(user.avatar_url).data.publicUrl;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
    window.location.reload();
  };

  const refreshUser = (data) => {
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
    window.location.reload(); // forzato per sincronizzazione navbar
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
    const filePath = `user_${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase
      .storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

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

    if (updateError) {
      setUpdateMessage("❌ Failed to update avatar");
    } else {
      setUpdateMessage("✅ Avatar updated!");
      refreshUser(data);
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
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-red-400 text-lg px-4">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white px-4">
      <div className="bg-[#1e1e1e] p-8 rounded-lg shadow-xl text-center max-w-md w-full">
        <h2 className="text-3xl font-bold mb-4">👤 User Profile</h2>

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
                className="text-sm text-red-400 underline mb-4"
              >
                Reset to default avatar
              </button>
            )}

            <p className="text-lg mb-2"><strong>ID:</strong> {user.id}</p>
            <p className="text-lg mb-2"><strong>Email:</strong> {user.email}</p>

            {editing ? (
              <div className="mb-4">
                <label className="block text-lg mb-2"><strong>New Username:</strong></label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded text-black"
                />
                <div className="mt-3 flex gap-2 justify-center">
                  <button
                    onClick={handleUsernameUpdate}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setNewUsername("");
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-lg mb-4">
                <strong>Username:</strong> {user.username}{" "}
                <button
                  onClick={() => {
                    setEditing(true);
                    setNewUsername(user.username);
                  }}
                  className="ml-2 text-sm text-yellow-400 underline"
                >
                  Edit
                </button>
              </p>
            )}

            {updateMessage && (
              <p className="text-sm text-green-400 mt-2">{updateMessage}</p>
            )}

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handleLogout}
                className="bg-yellow-400 text-black px-6 py-2 rounded-full font-bold hover:bg-yellow-300 transition"
              >
                Logout
              </button>
              <button
                onClick={() => navigate("/")}
                className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-300 transition"
              >
                Home
              </button>
            </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

export default Profile;
