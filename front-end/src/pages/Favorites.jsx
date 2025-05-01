import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Favorites() {
  const [movies, setMovies] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/favorites/all", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMovies(res.data);
      } catch (err) {
        console.error("Errore nel recupero dei preferiti:", err);
        toast.error("❌ Impossibile caricare i preferiti");
      }
    };

    if (token) fetchFavs();
  }, [token]);

  const handleRemoveFavorite = async (movieId) => {
    try {
      await axios.delete(`http://localhost:3001/api/favorites?movieId=${movieId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMovies(movies.filter(movie => movie.id !== movieId));
      toast.success("🗑 Film rimosso dai preferiti");
    } catch (err) {
      console.error("Errore durante la rimozione:", err);
      toast.error("⚠️ Errore durante la rimozione");
    }
  };

  return (
    <div className="px-6 py-8 bg-black min-h-screen text-white">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">⭐ I tuoi Preferiti</h1>

      {movies.length === 0 ? (
        <p className="text-gray-400">Nessun film in preferiti.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <li key={movie.id} className="bg-zinc-800 rounded-lg shadow-md overflow-hidden flex flex-col">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-4 flex flex-col justify-between min-h-[280px] space-y-2">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{movie.title}</h2>
                  <p className="text-sm text-gray-300">
                    {movie.overview
                      ? movie.overview.slice(0, 100) + "..."
                      : "Nessuna descrizione disponibile"}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveFavorite(movie.id)}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                >
                  🗑 Rimuovi dai preferiti
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

export default Favorites;
