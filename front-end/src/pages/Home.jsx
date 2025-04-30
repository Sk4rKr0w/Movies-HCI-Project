import { useEffect, useState } from "react";
import { useMovieStore } from "../store/useMovieStore";
import MovieQuiz from "../components/MovieQuiz";
// import { Link } from "react-router-dom"; // Se usi React Router
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function Home() {
    const [startQuiz, setStartQuiz] = useState(false);
    const movies = useMovieStore((state) => state.movies);
    const fetchMovies = useMovieStore((state) => state.fetchMovies);
    const [trending, setTrending] = useState([]);

    const fetchTrendingMovies = async () => {
        try {
            const res = await fetch(
                `https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}`
            );
            const data = await res.json();
            const top5 = data.results.slice(0, 5);

            const moviesWithTrailers = await Promise.all(
                top5.map(async (movie) => {
                    const trailerRes = await fetch(
                        `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${API_KEY}`
                    );
                    const trailerData = await trailerRes.json();
                    const youtubeTrailer = trailerData.results.find(
                        (vid) =>
                            vid.site === "YouTube" && vid.type === "Trailer"
                    );
                    return {
                        id: movie.id,
                        title: movie.title,
                        poster_path: movie.poster_path,
                        trailerUrl: youtubeTrailer
                            ? `https://www.youtube.com/watch?v=${youtubeTrailer.key}`
                            : null,
                    };
                })
            );

            setTrending(moviesWithTrailers);
        } catch (err) {
            console.error("Errore nel recupero dei film in tendenza", err);
        }
    };

    useEffect(() => {
        fetchMovies(30);
        fetchTrendingMovies();
    }, [fetchMovies]);

    // Rimuove duplicati nello store basandosi su ID
    const deduplicatedMovies = Array.from(
        new Map(movies.map((m) => [m.id, m])).values()
    );

    // Esclude film trending dallo sfondo
    const trendingIds = new Set(trending.map((m) => m.id));
    const backgroundMovies = deduplicatedMovies.filter(
        (m) => !trendingIds.has(m.id)
    );

    return (
        <div className="w-screen min-h-screen bg-gradient-to-r from-[#1b1b1b] via-[#2d2d2d] to-[#141414] text-white relative overflow-hidden">
            <ul className="absolute inset-0 grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3 z-0 opacity-40 filter blur-[5px]">
                {backgroundMovies.length > 0 ? (
                    backgroundMovies.map((movie) =>
                        movie.poster_path ? (
                            <li
                                key={`store-${movie.id}`}
                                className="relative w-full h-full"
                            >
                                <img
                                    src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                                    alt={movie.title}
                                    className="w-full h-full object-cover rounded-lg shadow-xl"
                                />
                            </li>
                        ) : null
                    )
                ) : (
                    <li className="col-span-full flex justify-center items-center h-full">
                        <div className="flex space-x-2">
                            <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-3 h-3 bg-white rounded-full animate-bounce"></span>
                        </div>
                    </li>
                )}
            </ul>

            <div className="relative z-10 px-6 py-10 flex flex-col items-center text-center overflow-x-hidden">
                <h1 className="text-lg md:text-2xl lg:text-3xl text-yellow-400 outline-3 rounded-lg p-2 bg-[#121212] font-extrabold leading-tight mb-4 drop-shadow-lg">
                    🍿 What Should I Watch Tonight? 🍿
                </h1>
                <p className="text-xl font-medium mb-6 max-w-lg mx-auto text-gray-200">
                    Don't know what to{" "}
                    <span className="text-yellow-400">watch</span>? <br />
                    Take our <span className="text-yellow-400">quiz</span> and
                    find your perfect match!
                </p>
                <button
                    className="text-white px-8 py-3 cursor-pointer bg-blue-500 text-lg font-semibold hover:text-gray-900 rounded-full shadow-lg hover:bg-yellow-400 hover:scale-105 transform transition-all duration-300"
                    onClick={() => setStartQuiz(true)}
                >
                    Start ▶
                </button>
                {startQuiz && <MovieQuiz />}

                <div className="mt-12 md:px-24 w-full">
                    <h2 className="text-2xl font-extrabold mb-4 text-yellow-400">
                        Trending Now
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {trending.map((movie) => (
                            <a
                                key={`trending-${movie.id}`}
                                href={`/movie/${movie.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="border border-gray-600 bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition"
                            >
                                {movie.poster_path && (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                        alt={movie.title}
                                        className="w-full h-64 object-cover rounded-md mb-2"
                                    />
                                )}
                                <h3 className="text-lg font-semibold">
                                    {movie.title}
                                </h3>
                                {movie.trailerUrl ? (
                                    <p className="text-yellow-400 text-[12px] mt-1">
                                        Get More Info 🎬
                                    </p>
                                ) : (
                                    <p className="text-gray-400 text-sm mt-1">
                                        No trailer available
                                    </p>
                                )}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
