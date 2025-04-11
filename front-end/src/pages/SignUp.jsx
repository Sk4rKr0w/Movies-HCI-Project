import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useMovieStore } from "../store/useMovieStore";
import axios from "axios";

function SignUp() {
    const movies = useMovieStore((state) => state.movies);
    const fetchMovies = useMovieStore((state) => state.fetchMovies);

    useEffect(() => {
        fetchMovies(30); // Personalizzabile: 20, 30, 40...
    }, []);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                "http://localhost:3001/api/auth/register",
                formData
            );
            alert("Registrazione avvenuta con successo!");
            console.log(res.data);
        } catch (err) {
            alert("Errore nella registrazione");
            console.error(err);
        }
    };

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
                <div className="w-full max-w-md m-4 p-6 bg-[#1e1e1e] rounded-xl shadow-lg">
                    <h2 className="text-3xl font-semibold text-yellow-400 text-center mb-6">
                        Registrazione
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm text-gray-300 mb-1 text-left"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                placeholder="(e.g. BananaJoe)"
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm text-gray-300 mb-1 text-left"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="(e.g. mariorossi@example.com)"
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm text-gray-300 mb-1 text-left"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>

                        <button
                            type="submit"
                            className="cursor-pointer w-full py-2 mt-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-md transition-colors duration-200"
                        >
                            Registrati
                        </button>
                        <NavLink
                            to="/signin"
                            className="block text-center text-sm text-gray-400 hover:text-yellow-400 transition-colors duration-200"
                        >
                            Hai già un account?{" "}
                            <strong className="text-yellow-400">Accedi!</strong>
                        </NavLink>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
