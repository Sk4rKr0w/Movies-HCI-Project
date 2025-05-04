import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import slotBg from "../assets/images/slotBg.png";
import axios from "axios";
import spinSound from "../assets/sound/spin.wav";
import jackpotSound from "../assets/sound/jackpot.wav";
import Reel from "../components/Reel";

const spinAudio = new Audio(spinSound);
spinAudio.volume = 0.1;
spinAudio.loop = true;
const jackpotAudio = new Audio(jackpotSound);
jackpotAudio.volume = 0.1;
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function SlotMachine() {
    const [genreOptions, setGenreOptions] = useState([]);
    const [actorOptions, setActorOptions] = useState([]);
    const [movieOptions, setMovieOptions] = useState([]);
    const [genre, setGenre] = useState("");
    const [actor, setActor] = useState(null);
    const [movie, setMovie] = useState(null);
    const [spinningGenre, setSpinningGenre] = useState(false);
    const [spinningActor, setSpinningActor] = useState(false);
    const [spinningMovie, setSpinningMovie] = useState(false);
    const [loading, setLoading] = useState(true);
    const [genreIds, setGenreIds] = useState({});
    const [isSpinning, setIsSpinning] = useState(false);

    const movieRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const genreRes = await axios.get(
                    `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`
                );
                const genres = genreRes.data.genres;
                setGenreOptions(genres.map((g) => g.name));
                setGenreIds(
                    genres.reduce((acc, g) => ({ ...acc, [g.name]: g.id }), {})
                );
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchActorsForMovie = async (movieId) => {
        try {
            const res = await axios.get(
                `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}`
            );
            return res.data.cast.map((actor) => actor.name);
        } catch (error) {
            console.error("Error fetching actors for movie:", error);
            return [];
        }
    };

    const fetchMoviesByGenre = async (genreName) => {
        const genreId = genreIds[genreName];
        if (!genreId) return [];
        try {
            const genreRes = await axios.get(
                `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`
            );
            return genreRes.data.results;
        } catch (error) {
            console.error("Error fetching movies by genre", error);
            return [];
        }
    };

    useEffect(() => {
        if (movieRef.current && movie) {
            const timeout = setTimeout(() => {
                movieRef.current.scrollIntoView({ behavior: "smooth" });
            }, 250);

            return () => clearTimeout(timeout);
        }
    }, [movie]);

    const launchConfetti = () => {
        confetti({
            particleCount: 1000,
            spread: 360,
            origin: { x: 0.5, y: 0.5 },
            colors: ["#ff0000", "#00ff00", "#0000ff"],
        });
    };

    const spin = async () => {
        if (isSpinning) return;
        setIsSpinning(true);

        spinAudio.currentTime = 0;
        spinAudio.play();

        setGenre("");
        setActor(null);
        setMovie(null);
        setMovieOptions([]);
        setActorOptions([]);

        setSpinningGenre(true);

        await new Promise((res) => setTimeout(res, 3000));
        const randomGenre =
            genreOptions[Math.floor(Math.random() * genreOptions.length)];
        setGenre(randomGenre);
        setSpinningGenre(false);

        const movies = await fetchMoviesByGenre(randomGenre);
        setMovieOptions(movies);
        if (movies.length === 0) {
            console.error("No movies found for this genre");
            spinAudio.pause();
            return;
        }
        const randomMovie = movies[Math.floor(Math.random() * movies.length)];

        setSpinningActor(true);
        const actors = await fetchActorsForMovie(randomMovie.id);
        setActorOptions(actors);
        await new Promise((res) => setTimeout(res, 3000));
        const randomActor = actors[Math.floor(Math.random() * actors.length)];
        setActor(randomActor);
        setSpinningActor(false);

        setSpinningMovie(true);
        await new Promise((res) => setTimeout(res, 3000));
        setMovie(randomMovie);
        setSpinningMovie(false);

        spinAudio.pause();
        spinAudio.currentTime = 0;
        jackpotAudio.play();

        launchConfetti();
        setIsSpinning(false);
    };

    if (loading)
        return (
            <div className="text-white text-center mt-10 text-2xl">
                Loading...
            </div>
        );

    return (
        <div
            style={{
                backgroundImage: `url(${slotBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
            className="min-h-screen bg-gradient-to-br from-black via-amber-800 to-neutral-900
flex flex-col items-center justify-center py-8 px-4"
        >
            <div className="text-center p-5 bg-black/90 rounded-xl mb-5 justify-center items-center">
                <h1 className="text-yellow-400 text-xl md:text-2xl lg:text-3xl font-black mb-5 drop-shadow-[0_0_1px_gold]">
                    Ready for the{" "}
                    <strong className="text-yellow-400">thrill</strong>? Let's
                    see if luck will guide you to the{" "}
                    <span className="italic">movie of your dreams!</span>{" "}
                </h1>
                <p className="text-white text-md md:text-xl lg:text-2xl font-medium text-center">
                    Discover{" "}
                    <span className="italic">
                        actors, genres, and legendary titles
                    </span>{" "}
                    that will give you a{" "}
                    <strong className="text-yellow-400">
                        unique experience
                    </strong>{" "}
                    with every spin!
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10 flex-wrap justify-center">
                <Reel
                    title="🎬 Genre 🎬"
                    items={genreOptions}
                    spinning={spinningGenre}
                    selected={genre}
                    useScrollRef={true}
                />
                <Reel
                    title="⭐ Actor ⭐"
                    items={actorOptions}
                    spinning={spinningActor}
                    selected={actor}
                    useScrollRef={true}
                />
                <Reel
                    title="🎥 Movie 🎥"
                    items={movieOptions.map((m) => m.title)}
                    spinning={spinningMovie}
                    selected={movie?.title}
                    useScrollRef={false} // ❌ niente useRef per questo Reel
                />
            </div>
            <button
                onClick={spin}
                disabled={spinningGenre || spinningActor || spinningMovie}
                className="cursor-pointer bg-yellow-400 text-black text-xl md:text-2xl font-bold px-12 py-2 md:px-16 md:py-4 rounded-full hover:scale-110 transition-all duration-300 border-2 border-yellow-500"
            >
                {spinningGenre || spinningActor || spinningMovie
                    ? "Spinning..."
                    : "Test your luck!"}
            </button>
            <AnimatePresence>
                {movie && (
                    <motion.div
                        key="poster"
                        className="relative mt-12 flex flex-col justify-center items-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h3 className="p-4 bg-black/80 rounded-lg text-yellow-400 text-3xl font-extrabold mb-4">
                            And the winner is...
                        </h3>
                        <a
                            href={`/movie/${movie.id}`}
                            className="text-center flex flex-col justify-center items-center"
                        >
                            {movie.poster_path && (
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title}
                                    className="w-64 rounded-2xl shadow-2xl mb-3 border-4 border-yellow-300"
                                />
                            )}
                            <p className="text-yellow-400 text-xl font-semibold tracking-wide">
                                {movie.title}
                                {" !"}
                            </p>
                            <div ref={movieRef}></div>
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default SlotMachine;
