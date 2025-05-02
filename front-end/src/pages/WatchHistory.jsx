import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function WatchHistory() {
    const [history, setHistory] = useState([]);
    const token = localStorage.getItem("token");

    const fetchHistory = async () => {
        try {
            const res = await axios.get("http://localhost:3001/api/history", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setHistory(res.data);
        } catch (err) {
            console.error("Error fetching watch history:", err);
            toast.error("❌ Unable to load watch history");
        }
    };

    useEffect(() => {
        if (token) fetchHistory();
    }, [token]);

    const handleDelete = async (movieId) => {
        try {
            await axios.delete(
                `http://localhost:3001/api/history?movieId=${movieId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            toast.success("❌ Movie removed from watch history");
            setHistory(history.filter((m) => m.movie_id !== movieId));
        } catch (err) {
            console.error("Error during removal:", err);
            toast.error("⚠️ Error during removal");
        }
    };

    return (
        <div className="w-full bg-black text-white px-4 py-8">
            <h1 className="text-3xl font-bold text-yellow-400 mb-6">
                📽️ Watch History
            </h1>

            {history.length === 0 ? (
                <p className="text-gray-400">
                    You haven't marked any movies as watched yet.
                </p>
            ) : (
                <div className="overflow-x-auto custom-scrollbar">
                    <ul className="flex space-x-6 pb-4">
                        {history.map((movie) => (
                            <li
                                key={movie.id}
                                className="border border-gray-700 flex-shrink-0 w-64 bg-zinc-800 hover:bg-zinc-700 transition rounded-lg shadow-md overflow-hidden"
                            >
                                <div className="flex flex-col h-full ">
                                    <a
                                        href={`/movie/${movie.movie_id}`}
                                        className="cursor-pointer"
                                    >
                                        <img
                                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                            alt={movie.title}
                                            className="w-full h-32 object-cover"
                                        />
                                        <div className="p-4 space-y-2">
                                            <h2 className="text-lg font-semibold mb-1">
                                                {movie.title}
                                            </h2>
                                            <p className="text-sm text-gray-300">
                                                {movie.overview
                                                    ? movie.overview.slice(
                                                          0,
                                                          50
                                                      ) + "..."
                                                    : "No description available"}
                                            </p>
                                            <p className="text-xs text-gray-500 italic">
                                                Watched on{" "}
                                                {new Date(
                                                    movie.watched_at
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </a>
                                    <div className="pt-0 mt-auto">
                                        <button
                                            onClick={() =>
                                                handleDelete(movie.movie_id)
                                            }
                                            className="cursor-pointer w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                                        >
                                            ❌ Remove from history
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <ToastContainer position="bottom-right" autoClose={2500} />
        </div>
    );
}

export default WatchHistory;
