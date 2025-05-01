import { useEffect, useState } from "react";

function Favorites() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Utente non autenticato");
        return;
      }

      try {
        const res = await fetch("http://localhost:3001/api/favorites", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setMovies(data.movies || []);
      } catch (err) {
        console.error("Errore nel recupero dei preferiti:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="text-white text-center mt-10">Caricamento preferiti...</div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400 text-center">
        I tuoi film preferiti
      </h1>

      {movies.length === 0 ? (
        <p className="text-center text-gray-400">Nessun film nei preferiti.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-md"
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-auto"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-yellow-400">
                  {movie.title}
                </h2>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
