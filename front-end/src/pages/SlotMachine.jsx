import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import "../assets/SlotMachine.css";
import spinSound from "../assets/sound/spin.wav";
import jackpotSound from "../assets/sound/jackpot.wav";

const spinAudio = new Audio(spinSound);
const jackpotAudio = new Audio(jackpotSound);
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const Reel = ({ title, items, spinning, selected }) => (
  <div className="reel">
    <h2>{title}</h2>
    <div className="reel-window">
      <motion.div
        className="reel-strip"
        animate={{
          y: spinning ? ["0%", "-100%", "0%"] : "0%",
        }}
        transition={{
          duration: 2.5,
          repeat: spinning ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        {items.map((item, idx) => (
          <div key={idx} className="reel-item">
            {item}
          </div>
        ))}
      </motion.div>
    </div>
    {!spinning && selected && <div className="selected">{selected}</div>}
  </div>
);

function SlotMachine() {
  const [genreOptions, setGenreOptions] = useState([]);
  const [actorOptions, setActorOptions] = useState([]);
  const [movieOptions, setMovieOptions] = useState([]);

  const [genre, setGenre] = useState("");
  const [actor, setActor] = useState(null);
  const [movie, setMovie] = useState(null);

  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const genreRes = await axios.get(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`
      );
      setGenreOptions(genreRes.data.genres.map(g => g.name));

      const actorRes = await axios.get(
        `https://api.themoviedb.org/3/person/popular?api_key=${API_KEY}`
      );
      setActorOptions(actorRes.data.results.map(a => a.name));

      const movieRes = await axios.get(
        `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`
      );
      setMovieOptions(movieRes.data.results);
    };
    fetchData();
  }, []);

  const spin = async () => {
    spinAudio.play();

    setSpinning(true);
    setGenre("");
    setActor(null);
    setMovie(null);

    setTimeout(() => {
      const randomGenre = genreOptions[Math.floor(Math.random() * genreOptions.length)];
      const randomActor = actorOptions[Math.floor(Math.random() * actorOptions.length)];
      const randomMovie = movieOptions[Math.floor(Math.random() * movieOptions.length)];

      setGenre(randomGenre);
      setActor(randomActor);
      setMovie(randomMovie);
      setSpinning(false);

      jackpotAudio.play();
    }, 3000);
  };

  return (
    <div className="slot-container">
      <h1 className="title">🎰 Ultimate Movie Slot Machine</h1>
      <div className="reel-group">
        <Reel title="🎬 Genre" items={genreOptions} spinning={spinning} selected={genre} />
        <Reel title="⭐ Actor" items={actorOptions} spinning={spinning} selected={actor} />
        <Reel title="🎥 Movie" items={movieOptions.map(m => m.title)} spinning={spinning} selected={movie?.title} />
      </div>
      <button onClick={spin} disabled={spinning} className="spin-button">
        {spinning ? "Spinning..." : "SPIN"}
      </button>
      {movie && (
        <motion.div className="movie-poster text-center"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.6, repeat: 2 }}
        >
          <h3 className="text-xl font-semibold mb-2 text-yellow-400">🎉 Your Movie:</h3>
          <img 
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
            alt={movie.title} 
            className="w-full rounded-lg mb-2 shadow-lg"
            />
            <p className="text-yellow-400 font-bold text-lg">{movie.title}</p>
        </motion.div>

        
      )}
    </div>
  );
}

export default SlotMachine;
