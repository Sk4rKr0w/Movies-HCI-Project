
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const slotVariants = {
  spin: {
    y: [0, -100, -200, -300, 0],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: 0,
    },
  },
  stop: {
    y: 0,
    transition: { duration: 0.3 },
  },
};

const SlotColumn = ({ label, items, active, spinning }) => (
  <div className="bg-zinc-800 text-yellow-400 rounded-lg shadow-md p-4 text-center min-h-[120px] overflow-hidden w-full">
    <h2 className="text-lg font-bold mb-2">{label}</h2>
    <motion.div
      animate={spinning ? "spin" : "stop"}
      variants={slotVariants}
      className="space-y-1"
    >
      {spinning
        ? [...items, ...items].map((item, idx) => (
            <p key={idx} className="text-white text-sm h-6">
              {item.name || item.title || item}
            </p>
          ))
        : (
          <p className="text-white text-lg font-semibold h-6">
            {active?.name || active?.title || active || "..."}
          </p>
        )}
    </motion.div>
  </div>
);

function SlotMachineAnimated() {
  const [genres, setGenres] = useState([]);
  const [actors, setActors] = useState([]);
  const [movies, setMovies] = useState([]);

  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedActor, setSelectedActor] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const fetchData = async () => {
    const [genresRes, actorsRes, moviesRes] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`),
      axios.get(`https://api.themoviedb.org/3/person/popular?api_key=${API_KEY}`),
      axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`),
    ]);
    setGenres(genresRes.data.genres);
    setActors(actorsRes.data.results);
    setMovies(moviesRes.data.results);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const spin = async () => {
    setSpinning(true);
    setSelectedGenre(null);
    setSelectedActor(null);
    setSelectedMovie(null);

    setTimeout(() => {
      const g = genres[Math.floor(Math.random() * genres.length)];
      const a = actors[Math.floor(Math.random() * actors.length)];
      const m = movies[Math.floor(Math.random() * movies.length)];
      setSelectedGenre(g);
      setSelectedActor(a);
      setSelectedMovie(m);
      setSpinning(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-10">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">🎰 Ultimate Movie Slot Machine</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl text-center mb-8">
        <SlotColumn label="🎬 Genre" items={genres} active={selectedGenre} spinning={spinning} />
        <SlotColumn label="⭐ Actor" items={actors} active={selectedActor} spinning={spinning} />
        <SlotColumn label="🎥 Movie" items={movies} active={selectedMovie} spinning={spinning} />
      </div>

      <button
        onClick={spin}
        disabled={spinning}
        className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-full font-semibold disabled:opacity-50"
      >
        {spinning ? "Spinning..." : "SPIN"}
      </button>

      {selectedMovie && (
        <div className="mt-8 max-w-md text-center animate-bounce">
          <img
            src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
            alt={selectedMovie.title}
            className="w-full rounded-lg mb-2"
          />
          <p className="text-yellow-400 font-bold text-lg">{selectedMovie.title}</p>
        </div>
      )}
    </div>
  );
}

export default SlotMachineAnimated;
