import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import TmdbCardLite from "../components/TmdbCardLite.jsx";

export default function RouletteFilmSearch({ groupId, userId, onSuccess }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [selectedMovies, setSelectedMovies] = useState([]);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false); // Aggiunto stato per il caricamento
    const debounceRef = useRef(null);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            setLoading(true); // Inizia il caricamento
            try {
                const res = await axios.get(
                    "https://api.themoviedb.org/3/search/movie",
                    {
                        params: {
                            api_key: import.meta.env.VITE_TMDB_API_KEY,
                            query,
                        },
                    }
                );
                setResults(res.data.results.slice(0, 5));
            } catch (err) {
                console.error("❌ TMDB search error:", err);
            } finally {
                setLoading(false); // Termina il caricamento
            }
        }, 400); // 400ms debounce delay
    }, [query]);

    const addMovie = (movie) => {
        if (!selectedMovies.find((m) => m.id === movie.id)) {
            setSelectedMovies([
                ...selectedMovies,
                {
                    id: movie.id,
                    title: movie.title,
                    poster_path: movie.poster_path,
                },
            ]);
        }
    };

    const removeMovie = (id) => {
        setSelectedMovies(selectedMovies.filter((m) => m.id !== id));
    };

    const saveMovies = async () => {
        if (selectedMovies.length === 0 || saving) return;
        setSaving(true);

        try {
            await axios.post(
                `http://localhost:3001/api/group/roulette/${groupId}`,
                {
                    userId,
                    movies: selectedMovies,
                }
            );

            setSelectedMovies([]);
            setResults([]);
            setQuery("");
            setSuccessMsg("✅ Movies saved successfully!");
            setErrorMsg("");
            setTimeout(() => setSuccessMsg(""), 3000);
            window.location.reload();
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("❌ Error saving movies:", err);
            setErrorMsg("❌ Error while saving. Please try again.");
            setTimeout(() => setErrorMsg(""), 4000);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row mb-4 gap-2 sm:gap-0">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="border border-white/50 p-2 rounded flex-grow"
                    placeholder="Search movies on TMDB..."
                />
            </div>

            <div className="w-full">
                {selectedMovies.length > 0 && (
                    <div>
                        <h4 className="mt-6 font-bold text-center sm:text-left">
                            🎯 Selected Movies:
                        </h4>
                        <ul className="list-none mt-2">
                            {selectedMovies.map((m) => (
                                <li
                                    key={m.id}
                                    className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-black/70 p-4 my-2 rounded-lg shadow-md text-white"
                                >
                                    <span className="text-center sm:text-left w-full sm:w-auto">
                                        {m.title}
                                    </span>
                                    <button
                                        onClick={() => removeMovie(m.id)}
                                        className="cursor-pointer w-full sm:w-auto px-4 py-2 bg-red-700 text-white font-semibold rounded hover:bg-red-700 transition text-sm sm:text-base"
                                    >
                                        Delete ❌
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {selectedMovies.length >= 2 ? (
                            <button
                                className="cursor-pointer mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                                onClick={saveMovies}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save Roulette"}
                            </button>
                        ) : (
                            <h1 className="w-full text-center animate-bounce text-md font-semibold text-yellow-400">
                                Still missing a pick? Add one more to spin the
                                wheel!
                            </h1>
                        )}
                    </div>
                )}

                {successMsg && (
                    <div className="mt-4 text-green-500 font-semibold text-center sm:text-left">
                        {successMsg}
                    </div>
                )}
                {errorMsg && (
                    <div className="mt-4 text-red-500 font-semibold text-center sm:text-left">
                        {errorMsg}
                    </div>
                )}
            </div>

            {loading && (
                <div className="flex justify-center items-center mt-4">
                    <div className="animate-spin rounded-full border-t-4 border-b-4 border-blue-600 w-10 h-10"></div>
                </div>
            )}

            <div className="flex flex-col gap-4 mt-6">
                {results.map((movie) => (
                    <TmdbCardLite
                        key={movie.id}
                        movie={movie}
                        onAdd={() => addMovie(movie)}
                        disabled={selectedMovies.find((m) => m.id === movie.id)}
                    />
                ))}
            </div>
        </div>
    );
}
