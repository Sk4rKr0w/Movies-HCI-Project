import { useState } from "react";
import axios from "axios";

const questions = [
  {
    question: "What's your favorite genre?",
    options: [
      "Action", "Adventure", "Animation", "Comedy", "Crime",
      "Documentary", "Drama", "Family", "Fantasy", "History",
      "Horror", "Music", "Mystery", "Romance", "Science Fiction",
      "Thriller", "War", "Western"
    ]
  },
  {
    question: "Do you want a recent movie?",
    options: ["Yes", "No"]
  },
  {
    question: "Preferred length?",
    options: ["Short", "Medium", "Long"]
  },
  {
    question: "What's the age rating you prefer?",
    options: ["G", "PG", "PG-13", "R", "NC-17"]
  },
  {
    question: "Preferred language?",
    options: ["None", "en", "it", "fr", "es", "de", "ja", "ko", "zh"]
  },
  {
    question: "Do you want a popular or hidden gem?",
    options: ["Popular", "Hidden gem"]
  },
  {
    question: "Should it have a high rating?",
    options: ["Yes", "No"]
  }
];

const genreMap = {
  Action: 28, Adventure: 12, Animation: 16, Comedy: 35, Crime: 80,
  Documentary: 99, Drama: 18, Family: 10751, Fantasy: 14, History: 36,
  Horror: 27, Music: 10402, Mystery: 9648, Romance: 10749,
  "Science Fiction": 878, Thriller: 53, War: 10752, Western: 37
};

const MovieQuiz = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async (answer) => {
    const newAnswers = [...answers.slice(0, step), answer];
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      await fetchMovie(newAnswers);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setMovie(null);
    }
  };

  const fetchMovie = async (answers) => {
    setLoading(true);

    const genre = genreMap[answers[0]];
    const recent = answers[1] === "Yes";
    const length = answers[2];
    const certification = answers[3];
    const language = answers[4] === "None" ? null : answers[4];
    const popularity = answers[5];
    const minRating = answers[6] === "Yes" ? 7 : null;

    const today = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(today.getFullYear() - 5);

    const params = {
      api_key: import.meta.env.VITE_TMDB_API_KEY,
      with_genres: genre,
      sort_by: popularity === "Popular" ? "popularity.desc" : "popularity.asc",
      certification_country: "US",
      certification: certification,
      language: "en-US",
      include_adult: false,
      page: 1
    };

    if (recent) {
      params["primary_release_date.gte"] = fiveYearsAgo.toISOString().split("T")[0];
    } else {
      params["primary_release_date.lte"] = fiveYearsAgo.toISOString().split("T")[0];
    }

    if (length === "Short") {
      params["with_runtime.lte"] = 90;
    } else if (length === "Medium") {
      params["with_runtime.gte"] = 91;
      params["with_runtime.lte"] = 120;
    } else if (length === "Long") {
      params["with_runtime.gte"] = 121;
    }

    if (language) {
      params["with_original_language"] = language;
    }

    if (minRating) {
      params["vote_average.gte"] = minRating;
    }

    try {
      const res = await axios.get("https://api.themoviedb.org/3/discover/movie", { params });
      const movies = res.data.results;
      if (movies.length > 0) {
        const pick = movies[Math.floor(Math.random() * movies.length)];
        setMovie(pick);
      } else {
        setMovie({ title: "No movie found", overview: "Try different answers!" });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMovie({ title: "Error", overview: "Something went wrong." });
    }

    setLoading(false);
  };

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black text-white flex items-center justify-center z-50 px-4">
      <div className="text-center max-w-xl">
        {loading ? (
          <h2 className="text-2xl font-bold animate-pulse">Finding your match...</h2>
        ) : movie ? (
          <div>
            <h2 className="text-3xl font-bold mb-4">We recommend:</h2>
            <h3 className="text-xl font-semibold">{movie.title}</h3>
            <p className="text-gray-300 mt-2">{movie.overview}</p>
            {movie.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                alt={movie.title}
                className="mx-auto mt-4 rounded shadow"
              />
            )}
            <button
              onClick={() => {
                setStep(0);
                setAnswers([]);
                setMovie(null);
              }}
              className="mt-6 bg-yellow-400 text-black font-bold px-6 py-2 rounded-full hover:bg-yellow-300"
            >
              Restart Quiz
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6">{questions[step].question}</h2>
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
                  className="bg-white text-black font-semibold py-3 px-6 rounded-full hover:bg-yellow-400 transition-all duration-200"
                >
                  {option}
                </button>
              ))}
            </div>
            {step > 0 && (
              <button
                onClick={handleBack}
                className="mt-6 bg-gray-400 text-white font-bold px-6 py-2 rounded-full hover:bg-gray-500"
              >
                Back
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MovieQuiz;
