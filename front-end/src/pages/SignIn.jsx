import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useMovieStore } from "../store/useMovieStore";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SignIn() {
    const movies = useMovieStore((state) => state.movies);
    const fetchMovies = useMovieStore((state) => state.fetchMovies);
    const [loginMessage, setLoginMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchMovies(30); // Personalizzabile: 20, 30, 40...
    }, []);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const navigate = useNavigate();

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
                "http://localhost:3001/api/auth/login",
                formData
            );

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            setLoginMessage("✅ Login avvenuto con successo!");
            setErrorMessage("");

            setTimeout(() => {
                navigate("/");
                window.location.reload();
            }, 1500);
        } catch (err) {
            setErrorMessage("❌ Email o password non validi.");
            setLoginMessage("");
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
                        Login
                    </h2>
                    {(loginMessage || errorMessage) && (
                        <div
                            className={`text-sm text-center mb-4 py-2 px-4 rounded-md ${
                                loginMessage
                                    ? "bg-green-600 text-white"
                                    : "bg-red-600 text-white"
                            }`}
                        >
                            {loginMessage || errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                value={formData.email}
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
                                value={formData.password}
                                className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>

                        <button
                            type="submit"
                            className="cursor-pointer w-full py-2 mt-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-md transition-colors duration-200"
                        >
                            Accedi
                        </button>
                        <NavLink
                            to="/signup"
                            className="block text-center text-sm text-gray-400 hover:text-yellow-400 transition-colors duration-200"
                        >
                            Non hai un account?{" "}
                            <strong className="text-yellow-400">
                                Registrati!
                            </strong>
                        </NavLink>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignIn;
