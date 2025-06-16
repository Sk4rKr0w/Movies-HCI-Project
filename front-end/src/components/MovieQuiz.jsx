import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const questions = [
    {
        question: "When was the last time a movie moved you deeply?",
        options: [
            "Recently – I still think about it",
            "It’s been a while – I miss that feeling",
            "I can’t remember – maybe never",
        ],
    },
    {
        question: "Which emotion are you craving right now?",
        options: [
            "Joy and lightness",
            "Tears and catharsis",
            "Adrenaline and excitement",
            "Wonder and imagination",
            "Love and connection",
            "Mystery and curiosity",
        ],
    },
    {
        question: "Do you want to feel understood or escape reality?",
        options: [
            "I want to feel understood",
            "I want to escape",
            "Maybe both",
        ],
    },
    {
        question:
            "Would you rather watch something that challenges you or comforts you?",
        options: ["Challenge me", "Comfort me", "Surprise me"],
    },
    {
        question:
            "Do you feel like discovering something unknown or revisiting a familiar vibe?",
        options: ["Discover the unknown", "Revisit something familiar"],
    },
    {
        question:
            "Do you want something others love or something just for you?",
        options: ["Loved by many", "Hidden just for me"],
    },
    {
        question:
            "Are you watching the movie alone or with children? (Film 18+)",
        options: ["I'm with children", "I'm alone or with adults"],
    },
    {
        question:
            "Do you feel like watching a short, snappy movie or a long, epic journey?",
        options: [
            "Short and sweet – I don't want to invest too much time",
            "Long and epic – I'm ready for a full experience",
        ],
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

const MovieQuiz = ({ crossClicked, setCrossClicked }) => {
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

        const [
            lastMoved,
            emotion,
            reality,
            challenge,
            discovery,
            audience,
            withChildren,
            movieLength,
        ] = answers;

        const params = {
            api_key: import.meta.env.VITE_TMDB_API_KEY,
            sort_by:
                audience === "Loved by many"
                    ? "popularity.desc"
                    : "popularity.asc",
            include_adult: false,
            language: "en-US",
            page: 1,
        };

        // EMOTION -> genre
        const emotionGenreMap = {
            "Joy and lightness": 35, // Comedy
            "Tears and catharsis": 18, // Drama
            "Adrenaline and excitement": 28, // Action
            "Wonder and imagination": 14, // Fantasy
            "Love and connection": 10749, // Romance
            "Mystery and curiosity": 9648, // Mystery
        };
        params["with_genres"] = emotionGenreMap[emotion];

        // LAST MOVED -> rating filter
        if (lastMoved === "Recently – I still think about it") {
            params["vote_average.gte"] = 7.5;
        } else if (lastMoved === "It’s been a while – I miss that feeling") {
            params["vote_average.gte"] = 6.5;
        }

        // REALITY -> escape or realism -> genres
        if (reality === "I want to escape") {
            params["with_genres"] += ",878"; // Add Sci-Fi
        } else if (reality === "I want to feel understood") {
            params["with_genres"] += ",18"; // Add Drama
        }

        // CHALLENGE -> maybe sort by vote count
        if (challenge === "Challenge me") {
            params["sort_by"] = "vote_average.desc";
            params["vote_count.gte"] = 100;
        } else if (challenge === "Comfort me") {
            params["vote_average.lte"] = 7.0;
        }

        // DISCOVERY -> release date
        const today = new Date();
        const fiveYearsAgo = new Date(
            today.setFullYear(today.getFullYear() - 5)
        );
        if (discovery === "Discover the unknown") {
            params["primary_release_date.gte"] = fiveYearsAgo
                .toISOString()
                .split("T")[0];
        }

        // Watching with children filter
        if (withChildren === "I'm with children") {
            params["with_genres"] += ",10751"; // Family genre
            params["include_adult"] = false; // Exclude adult movies
        } else if (withChildren === "I'm alone or with adults") {
            params["include_adult"] = true; // Include adult movies
        }

        // MOVIE LENGTH filter
        if (
            movieLength ===
            "Short and sweet – I don't want to invest too much time"
        ) {
            params["with_runtime.gte"] = 60; // Short movies (60 minutes or more)
        } else if (
            movieLength === "Long and epic – I'm ready for a full experience"
        ) {
            params["with_runtime.lte"] = 180; // Long movies (up to 3 hours)
        }

        try {
            const res = await axios.get(
                "https://api.themoviedb.org/3/discover/movie",
                { params }
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
        <div
            className={`${
                crossClicked ? "hidden" : "block"
            } fixed top-0 left-0 w-screen h-screen bg-black text-white z-50 overflow-y-auto`}
        >
            <div
                className="cursor-pointer absolute top-12 md:top-10 right-10 md:right-25 scale-150 md:scale-200"
                onClick={() => setCrossClicked((prev) => !prev)}
            >
                ❌
            </div>

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
                                                src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                                                alt={movie.title}
                                                className="h-72 mx-auto mb-3 rounded shadow"
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
                                    className="font-semibold w-[25%] cursor-pointer mt-6 bg-yellow-400 text-black px-6 py-2 rounded-full hover:bg-yellow-500"
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
