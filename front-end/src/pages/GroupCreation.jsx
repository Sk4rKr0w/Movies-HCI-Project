import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useMovieStore } from "../store/useMovieStore";
function GroupCreation() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [genres, setGenres] = useState([]);
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState(""); // Stato per il messaggio di errore/successo
    const [isPrivate, setIsPrivate] = useState(false);
    const navigate = useNavigate();
    const movies = useMovieStore((state) => state.movies);
    const fetchMovies = useMovieStore((state) => state.fetchMovies);

    useEffect(() => {
        fetchMovies(15);
    }, [fetchMovies]);

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
        const token = localStorage.getItem("token");
        if (!token) {
            setMessage("You are not logged in.");
            navigate("/signin"); // Redirect to login if not logged in
        } else if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, [navigate]);

    const handleCreateGroup = async (e) => {
        e.preventDefault();

        if (!user) {
            setMessage("Devi essere loggato per creare un gruppo.");
            return;
        }

        // Basic validation before submitting
        if (!name || !description || genres.length === 0) {
            setMessage("Please fill out all fields.");
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
                    private: isPrivate,
                }
            );

            setMessage("✅ Gruppo creato con successo!");

            setTimeout(() => {
                navigate(`/groupwatch`);
            }, 1500);
        } catch (err) {
            console.error("Errore nella creazione del gruppo:", err);
            const errorMessage =
                err.response?.data?.message ||
                "❌ Errore nella creazione del gruppo.";
            setMessage(errorMessage);
        }
    };

    return (
        <div className="min-h-screen flex-grow flex flex-col justify-start items-center bg-gradient-to-br from-black via-zinc-900 to-gray-900 text-white w-full  p-6 bg-white shadow-md">
            <h2 className="text-2xl text-center w-full font-bold mb-4 text-yellow-400">
                🎬 Create a New Group 🎬
            </h2>
            {message && (
                <p
                    className={`text-center font-semibold mb-2 ${
                        message.startsWith("❌")
                            ? "text-red-400"
                            : "text-green-400"
                    }`}
                >
                    {message}
                </p>
            )}
            <form
                onSubmit={handleCreateGroup}
                className="space-y-4 w-full md:w-[75%] lg:w-[50%]"
            >
                <div className="mt-4">
                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            checked={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.checked)}
                            className="h-5 w-5"
                        />
                        <span className="text-yellow-400 font-medium">
                            Make this group private
                        </span>
                    </label>
                </div>
                <div>
                    <label className="block font-medium">
                        Group Name{" "}
                        <strong className="text-gray-500 text-sm">
                            (Up to 32 characters allowed)
                        </strong>
                    </label>
                    <input
                        type="text"
                        maxLength={25}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>

                <div>
                    <label className="block font-medium">
                        Description{" "}
                        <strong className="text-gray-500 text-sm">
                            (Up to 500 characters allowed)
                        </strong>
                    </label>
                    <textarea
                        value={description}
                        maxLength={500}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border rounded px-3 py-2 resize-none"
                        rows="15"
                        required
                    ></textarea>
                </div>

                <div className="mt-4">
                    <label className="flex items-center space-x-3">
                        <span className="text-yellow-400 font-medium">
                            Make this group private?
                        </span>
                        <input
                            type="checkbox"
                            checked={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.checked)}
                            className="cursor-pointer h-5 w-5"
                        />
                    </label>
                </div>

                <hr />

                <div>
                    <div className="w-full flex flex-row justify-start items-center gap-x-2 mb-3">
                        <label className="block font-medium">
                            Favorite Genres
                        </label>
                        <p className="text-sm text-gray-500">
                            (Select at least 1 genre)
                        </p>
                    </div>
                    <div className="grid grid-cols-3 space-y-2">
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
                                    className="h-5 w-5"
                                />
                                <span className="text-yellow-400">{genre}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        type="submit"
                        className="cursor-pointer w-full font-semibold bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Create Group
                    </button>
                    <a
                        href="/groupwatch"
                        className="mt-3 cursor-pointer text-yellow-500 hover:text-yellow-400 transition text-center"
                    >
                        Return to Dashboard
                    </a>
                </div>
            </form>
            <div
                className="slider w-full my-4"
                style={{
                    "--width": "150px",
                    "--height": "200px",
                    "--quantity": 10,
                }}
            >
                <ul className="list flex flex-row gap-2">
                    {movies &&
                        movies.map((movie, index) => (
                            <li
                                key={movie.id}
                                style={{ "--position": index + 1 }}
                                className="item"
                            >
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title}
                                    className="w-full h-full object-cover rounded-lg shadow-xl"
                                />
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
}

export default GroupCreation;
