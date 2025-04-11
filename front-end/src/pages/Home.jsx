import { useEffect, useState } from "react";
import { useMovieStore } from "../store/useMovieStore";
import MovieQuiz from "../components/MovieQuiz";

function Home() {
    const [startQuiz, setStartQuiz] = useState(false);
    const movies = useMovieStore((state) => state.movies);
    const fetchMovies = useMovieStore((state) => state.fetchMovies);

    useEffect(() => {
        fetchMovies(30); // Personalizzabile: 20, 30, 40...
    }, []);

    return (
        <div className="w-screen h-screen bg-gradient-to-r from-[#1b1b1b] via-[#2d2d2d] to-[#141414] text-white relative overflow-hidden">
            <ul className="absolute inset-0 grid grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-3 z-0 opacity-40 filter blur-[1px]">
                {movies.length > 0 ? (
                    movies.map((movie) => (
                        <li key={movie.id} className="relative w-full h-full">
                            {movie.backdrop_path && (
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title}
                                    className="w-full h-full object-cover rounded-lg shadow-xl hover:scale-105 transform transition-all duration-300"
                                />
                            )}
                        </li>
                    ))
                ) : (
                    <p className="text-center text-lg">
                        Caricamento in corso...
                    </p>
                )}
            </ul>

            <div className="absolute top-0 left-0 right-0 bottom-0 p-6 flex flex-col items-center justify-start z-10 text-center">
                <h1 className="text-3xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
                    Movie Recommendations Quiz
                </h1>
                <p className="text-xl font-medium mb-6 max-w-lg mx-auto text-gray-200">
                    Don't know what to{" "}
                    <span className="text-yellow-400">watch</span>? Take our{" "}
                    <span className="text-yellow-400">quiz</span> and find your
                    perfect match!
                </p>
                <button
                    className="px-8 py-3 cursor-pointer bg-blue-500 text-lg font-semibold text-gray-900 rounded-full shadow-lg hover:bg-yellow-400 hover:scale-105 transform transition-all duration-300"
                    onClick={() => setStartQuiz(true)}
                >
                    Start ▶
                </button>
                {startQuiz && <MovieQuiz />}
            </div>
        </div>
    );
}

export default Home;
