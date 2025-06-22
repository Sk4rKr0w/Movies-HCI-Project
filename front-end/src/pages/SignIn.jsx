import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useMovieStore } from "../store/useMovieStore";
import axios from "axios";

function SignIn() {
    const movies = useMovieStore((state) => state.movies);
    const fetchMovies = useMovieStore((state) => state.fetchMovies);
    const [loginMessage, setLoginMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchMovies(30);
    }, []);

    // Impedisce accesso se già loggato
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/");
        }
    }, []);

    const [formData, setFormData] = useState({
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
                "http://localhost:3001/api/auth/login",
                formData
            );

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            setLoginMessage("✅ Logged successfully!");
            setErrorMessage("");

            setTimeout(() => {
                navigate("/profile");
                window.location.reload();
            }, 1500);
        } catch (err) {
            setErrorMessage("❌ Email or password not valid.");
            setLoginMessage("");
            console.error(err);
        }
    };

    return (
        <div className="w-screen h-screen bg-gradient-to-r from-[#1b1b1b] via-[#2d2d2d] to-[#141414] text-white relative overflow-hidden">
            <ul className="absolute inset-0 grid grid-cols-3 md:grid-cols-6 gap-3 z-0 opacity-40 filter blur-[5px]">
                {movies.length > 0 ? (
                    movies.map((movie) =>
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
                                title="Enter your email to login"
                                placeholder="(e.g. mariorossi@example.com)"
                                onChange={handleChange}
                                value={formData.email}
                                className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                            <p class="text-sm text-gray-500 mt-1 text-left">
                                Enter your correct email to login
                            </p>
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
                                title="Enter a password with at least 8 characters"
                                onChange={handleChange}
                                value={formData.password}
                                className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                            <div class="w-full flex flex-row justify-between">
                                <p class="text-sm text-gray-500 mt-1 text-left max-w-[25ch]">
                                    Enter a password with at least 8 characters
                                </p>
                                {/* Forgot password: */}
                                <div className="text-right">
                                    <NavLink
                                        to="/forgot-password"
                                        className="text-sm text-gray-400 hover:text-yellow-400 transition-colors duration-200"
                                    >
                                        Forgot password?
                                    </NavLink>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="cursor-pointer w-full py-2 mt-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-md transition-colors duration-200"
                        >
                            Sign in
                        </button>

                        <NavLink
                            to="/signup"
                            className="block text-center text-sm text-gray-400 hover:text-yellow-400 transition-colors duration-200"
                        >
                            Don't have an account?{" "}
                            <strong className="text-yellow-400">
                                Sign Up!
                            </strong>
                        </NavLink>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignIn;
