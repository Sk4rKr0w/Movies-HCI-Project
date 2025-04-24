import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const questions = [
    {
        question: "What's your favorite genre?",
        options: [
            "Action",
            "Adventure",
            "Animation",
            "Comedy",
            "Crime",
            "Documentary",
            "Drama",
            "Family",
            "Fantasy",
            "History",
            "Horror",
            "Music",
            "Mystery",
            "Romance",
            "Science Fiction",
            "Thriller",
            "War",
            "Western",
        ],
    },
    {
        question: "Do you want a recent movie?",
        options: ["Yes", "No"],
    },
    {
        question: "Preferred length?",
        options: ["Short", "Long"],
    },
    {
        question: "What's the age rating you prefer?",
        options: ["All Ages", "Teens and up", "Adults only"],
    },
    {
        question: "Do you want a popular or hidden gem?",
        options: ["Popular", "Hidden gem"],
    },
    {
        question: "Should it have a high rating?",
        options: ["Yes", "No"],
    },
];

const genreMap = {
    Action: 28,
    Adventure: 12,
    Animation: 16,
    Comedy: 35,
    Crime: 80,
    Documentary: 99,
    Drama: 18,
    Family: 10751,
    Fantasy: 14,
    History: 36,
    Horror: 27,
    Music: 10402,
    Mystery: 9648,
    Romance: 10749,
    "Science Fiction": 878,
    Thriller: 53,
    War: 10752,
    Western: 37,
};

const MovieQuiz = () => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    const MOVIES_PER_PAGE = 3;

    const handleClick = async (answer) => {
        const newAnswers = [...answers.slice(0, step), answer];
        setAnswers(newAnswers);

        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            await fetchMovies(newAnswers);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
            setMovies([]);
        }
    };

    const fetchMovies = async (answers) => {
        setLoading(true);
        setCurrentPage(0);

        const genre = genreMap[answers[0]];
        const recent = answers[1] === "Yes";
        const length = answers[2];
        const ageGroup = answers[3];
        const popularity = answers[4];
        const minRating = answers[5] === "Yes" ? 7 : null;

        const today = new Date();
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(today.getFullYear() - 5);

        const params = {
            api_key: import.meta.env.VITE_TMDB_API_KEY,
            with_genres: genre,
            sort_by:
                popularity === "Popular" ? "popularity.desc" : "popularity.asc",
            certification_country: "US",
            include_adult: false,
            language: "en-US",
            page: 1,
        };

        if (recent) {
            params["primary_release_date.gte"] = fiveYearsAgo
                .toISOString()
                .split("T")[0];
        } else {
            params["primary_release_date.lte"] = fiveYearsAgo
                .toISOString()
                .split("T")[0];
        }

        if (length === "Short") {
            params["with_runtime.lte"] = 100;
        } else {
            params["with_runtime.gte"] = 101;
        }

        if (ageGroup === "All Ages") {
            params["certification"] = "G|PG";
        } else if (ageGroup === "Teens and up") {
            params["certification"] = "PG-13";
        } else {
            params["certification"] = "R|NC-17";
        }

        if (minRating) {
            params["vote_average.gte"] = minRating;
        }

        try {
            const res = await axios.get(
                "https://api.themoviedb.org/3/discover/movie",
                {
                    params,
                }
            );

            let results = res.data.results;

            const seen = new Set();
            results = results.filter((m) => {
                if (seen.has(m.title)) return false;
                seen.add(m.title);
                return true;
            });

            setMovies(results);
        } catch (error) {
            console.error("Fetch error:", error);
            setMovies([]);
        }

        setLoading(false);
    };

    const paginatedMovies = movies.slice(
        currentPage * MOVIES_PER_PAGE,
        (currentPage + 1) * MOVIES_PER_PAGE
    );

    return (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black text-white z-50 overflow-y-auto">
            <div className="min-h-screen flex items-center justify-center px-4 py-10">
                <div className="text-center w-full">
                    {loading ? (
                        <h2 className="text-2xl font-bold animate-pulse">
                            Finding your match...
                        </h2>
                    ) : movies.length > 0 ? (
                        <div>
                            <h2 className="text-3xl font-bold mb-6">
                                We recommend:
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {paginatedMovies.map((movie, idx) => (
                                    <Link
                                        to={`/movie/${movie.id}`}
                                        key={idx}
                                        className="block bg-[#1e1e1e] p-4 rounded-lg shadow-lg hover:bg-[#2a2a2a] transition"
                                    >
                                        {movie.poster_path && (
                                            <img
                                                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                                                alt={movie.title}
                                                className="lg:w-86 mx-auto mb-3 rounded shadow"
                                            />
                                        )}
                                        <h3 className="text-xl font-semibold mb-1">
                                            {movie.title}
                                        </h3>
                                        <p className="text-sm max-w-[55ch] text-gray-300 line-clamp-4">
                                            {movie.overview}
                                        </p>
                                        <p className="text-yellow-400 text-[12px] mt-1">
                                            Get More Info 🎬
                                        </p>
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-6 flex justify-center gap-4 flex-wrap">
                                <button
                                    disabled={currentPage === 0}
                                    onClick={() =>
                                        setCurrentPage((prev) => prev - 1)
                                    }
                                    className="cursor-pointer bg-gray-300 hover:bg-gray-400 transition text-black px-4 py-2 rounded-full disabled:opacity-40"
                                >
                                    ◀ Prev
                                </button>
                                <button
                                    disabled={
                                        (currentPage + 1) * MOVIES_PER_PAGE >=
                                        movies.length
                                    }
                                    onClick={() =>
                                        setCurrentPage((prev) => prev + 1)
                                    }
                                    className="cursor-pointer bg-gray-300 hover:bg-gray-400 transition text-black px-4 py-2 rounded-full disabled:opacity-40"
                                >
                                    Next ▶
                                </button>
                            </div>

                            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => {
                                        setStep(0);
                                        setAnswers([]);
                                        setMovies([]);
                                        setCurrentPage(0);
                                    }}
                                    className="cursor-pointer bg-yellow-400 text-black px-6 py-2 rounded-full hover:bg-yellow-300"
                                >
                                    Restart Quiz
                                </button>
                                <button
                                    onClick={() => (window.location.href = "/")}
                                    className="cursor-pointer bg-white text-black px-6 py-2 rounded-full hover:bg-gray-300"
                                >
                                    Return to Home
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold mb-6">
                                {questions[step].question}
                            </h2>
                            <div
                                className={`${
                                    questions[step].options.length > 4
                                        ? "grid grid-cols-2 gap-3"
                                        : "flex flex-col gap-4"
                                } max-w-xl mx-auto`}
                            >
                                {questions[step].options.map((option, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleClick(option)}
                                        className="cursor-pointer bg-white text-black font-semibold py-2 px-4 rounded-full hover:bg-yellow-400 transition-all duration-200"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                            {step > 0 && (
                                <button
                                    onClick={handleBack}
                                    className="w-[25%] cursor-pointer mt-6 bg-yellow-400 text-black px-6 py-2 rounded-full hover:bg-yellow-500"
                                >
                                    Back
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieQuiz;
