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
      console.error("Errore nel recupero dello storico:", err);
      toast.error("❌ Impossibile caricare lo storico");
    }
  };

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  const handleDelete = async (movieId) => {
    try {
      await axios.delete(`http://localhost:3001/api/history?movieId=${movieId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("❌ Film rimosso dallo storico");
      setHistory(history.filter((m) => m.movie_id !== movieId));
    } catch (err) {
      console.error("Errore durante la rimozione:", err);
      toast.error("⚠️ Errore nella rimozione");
    }
  };

  return (
    <div className="px-6 py-8 bg-black min-h-screen text-white">
      <h1 className="text-3xl font-bold text-blue-400 mb-6">📽️ Film visti</h1>

      {history.length === 0 ? (
        <p className="text-gray-400">Non hai ancora segnato film come visti.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((movie) => (
            <li key={movie.id} className="bg-zinc-800 rounded-lg shadow-md overflow-hidden">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-4 space-y-2">
                <h2 className="text-xl font-semibold">{movie.title}</h2>
                <p className="text-sm text-gray-300">
                  {movie.overview
                    ? movie.overview.slice(0, 100) + "..."
                    : "Nessuna descrizione disponibile"}
                </p>
                <p className="text-xs text-gray-500 italic">
                  Visto il {new Date(movie.watched_at).toLocaleDateString()}
                </p>
                <button
                  onClick={() => handleDelete(movie.movie_id)}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded mt-2"
                >
                  ❌ Rimuovi dallo storico
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ToastContainer position="bottom-right" autoClose={2500} />
    </div>
  );
}

export default WatchHistory;
