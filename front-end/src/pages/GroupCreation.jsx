import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import * as bcrypt from "bcryptjs";

function GroupCreation() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [genres, setGenres] = useState([]);
    const [image, setImage] = useState(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const genreOptions = [
        "Action",
        "Comedy",
        "Drama",
        "Horror",
        "Sci-Fi",
        "Romance",
        "Thriller",
    ];

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

    const handleCreateGroup = async (e) => {
        e.preventDefault();

        if (!user) {
            alert("Devi essere loggato per creare un gruppo.");
            return;
        }

        try {
            const res = await axios.post(
                "http://localhost:3001/api/creategroup/creategroup",
                {
                    name,
                    description,
                    genres,
                    owner: user.id,
                }
            );

            alert("✅ Gruppo creato con successo!");
            navigate("/groupwatch"); // o dove preferisci
        } catch (err) {
            console.error("Errore nella creazione del gruppo:", err);
            alert("❌ Errore nella creazione del gruppo.");
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
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-4">🎬 Crea un Nuovo Gruppo</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                    <label className="block font-medium">Group Name</label>
                    <input
                        type="text"
                        maxLength={32}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>

                <div>
                    <label className="block font-medium">Description</label>
                    <textarea
                        value={description}
                        maxLength={500}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        rows="3"
                        required
                    ></textarea>
                </div>

                <div>
                    <label className="block font-medium">
                        Favourite Genres
                    </label>
                    <div className="space-y-2">
                        {genreOptions.map((genre) => (
                            <label
                                key={genre}
                                className="flex items-center space-x-2"
                            >
                                <input
                                    type="checkbox"
                                    value={genre}
                                    checked={genres.includes(genre)}
                                    onChange={(e) => {
                                        const updatedGenres = e.target.checked
                                            ? [...genres, genre]
                                            : genres.filter((g) => g !== genre);
                                        setGenres(updatedGenres);
                                    }}
                                    className="form-checkbox h-5 w-5 text-yellow-500"
                                />
                                <span className="text-gray-800">{genre}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Create Group
                </button>
            </form>
        </div>
    );
}

export default GroupCreation;
