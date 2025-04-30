import { useEffect, useState } from "react";
import axios from "axios";

function Favorites() {
  const [movies, setMovies] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/favorites/all", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMovies(res.data); // riceve già array completo di film da backend
      } catch (err) {
        console.error("Errore nel recupero dei preferiti:", err);
      }
    };

    if (token) fetchFavs();
  }, [token]);

  return (
    <div className="px-6 py-8 bg-black min-h-screen text-white">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">⭐ I tuoi Preferiti</h1>

      {movies.length === 0 ? (
        <p className="text-gray-400">Nessun film in preferiti.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <li key={movie.id} className="bg-zinc-800 rounded-lg shadow-md overflow-hidden">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{movie.title}</h2>
                <p className="text-sm text-gray-300">
                  {movie.overview ? movie.overview.slice(0, 100) + "..." : "Nessuna descrizione disponibile"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Favorites;
