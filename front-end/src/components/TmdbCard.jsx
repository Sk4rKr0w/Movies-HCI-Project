import { useState, useEffect } from "react";
import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const TmdbCard = ({ movieId, onVote, isVoted, showVoteButton = true }) => {
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                const res = await axios.get(
                    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`
                );
                setMovie(res.data);
            } catch (err) {
                console.error("Errore TMDB:", err);
            }
        };
        fetchMovieDetails();
    }, [movieId]);

    if (!movie) return null;

    return (
        <div
            className={`relative bg-gray-800 rounded shadow p-2 text-sm transition ${
                isVoted ? "opacity-50" : "hover:scale-[1.02]"
            }`}
        >
            <img
                src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                alt={movie.title}
                className="rounded w-full mb-2"
            />
            <p className="text-white font-semibold truncate">{movie.title}</p>
            {showVoteButton && (
                <button
                    disabled={isVoted}
                    onClick={() => onVote(movie.id)}
                    className={`mt-2 w-full py-1 px-2 text-sm rounded font-semibold ${
                        isVoted
                            ? "bg-green-500 text-black cursor-default"
                            : "bg-yellow-400 hover:bg-yellow-300 text-black"
                    }`}
                >
                    {isVoted ? "✅ Votato" : "Vota"}
                </button>
            )}
        </div>
    );
};

export default TmdbCard;
