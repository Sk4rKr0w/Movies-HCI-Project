import { useState } from "react";
import axios from "axios";

const questions = [
  {
    question: "What's your mood?",
    options: ["Happy", "Sad", "Scared", "Romantic"]
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
    question: "Please choose any genre you're interested in.",
    options: [
      "Action", "Adventure", "Animation", "Biography", "Comedy",
      "Crime", "Disaster", "Drama", "Family", "Fantasy",
      "History", "Horror", "Music", "Mystery", "Romance",
      "Science Fiction", "Sport", "Thriller", "War", "Western"
    ],
    multi: true
  },
  {
    question: "Please select all MPAA ratings that you’re okay with.",
    options: ["G", "PG", "PG-13", "R"],
    multi: true
  },
  {
    question: "Please select any other category you’re interested in.",
    options: [
      "I don’t have a preference",
      "Movies based on a true story",
      "Movies that may change the way you look at life",
      "Movies set in New York City",
      "Spy Movies and Cop Movies",
      "Space Movies",
      "Wedding Movies",
      "Heist Movies",
      "Movies based on a book",
      "Racing Movies",
      "Girl Power Movies",
      "Movies set in Las Vegas",
      "Movies with pre- or sequels",
      "IMDb Top 250 Movies"
    ],
    multi: true
  }
];

const MovieQuiz = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [multiAnswers, setMultiAnswers] = useState([]);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async (answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    setMultiAnswers([]); // reset ogni step

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      await fetchMovie(newAnswers);
    }
  };

  const fetchMovie = async (answers) => {
    setLoading(true);

    const moodGenre = {
      Happy: 35,
      Sad: 18,
      Scared: 27,
      Romantic: 10749
    };

    const runtime = {
      Short: { lte: 90 },
      Medium: { gte: 91, lte: 120 },
      Long: { gte: 121 }
    };

    const genreMap = {
      Action: 28, Adventure: 12, Animation: 16, Biography: 1, Comedy: 35,
      Crime: 80, Disaster: 1, Drama: 18, Family: 10751, Fantasy: 14,
      History: 36, Horror: 27, Music: 10402, Mystery: 9648, Romance: 10749,
      "Science Fiction": 878, Sport: 1, Thriller: 53, War: 10752, Western: 37
    };

    const keywordMap = {
      "Movies based on a true story": "based on a true story",
      "Movies set in New York City": "new york city",
      "Spy Movies and Cop Movies": "spy",
      "Space Movies": "space",
      "Wedding Movies": "wedding",
      "Heist Movies": "heist",
      "Movies based on a book": "book",
      "Racing Movies": "racing",
      "Girl Power Movies": "female protagonist",
      "Movies set in Las Vegas": "las vegas",
      "Movies with pre- or sequels": "sequel",
      "IMDb Top 250 Movies": "top rated",
      "Movies that may change the way you look at life": "thought-provoking"
    };

    const selectedGenres = answers[3];
    const mpaaAccepted = answers[4];
    const otherCategories = answers[5];

    const genreIds = Array.isArray(selectedGenres)
      ? selectedGenres.map((g) => genreMap[g]).filter(Boolean).join(",")
      : "";

    const certifications = Array.isArray(mpaaAccepted)
      ? mpaaAccepted.join("|")
      : "";

    const keywordQuery = Array.isArray(otherCategories)
      ? otherCategories
          .filter(cat => keywordMap[cat])
          .map(cat => keywordMap[cat])
          .join(",")
      : "";

    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    const params = {
      api_key: apiKey,
      with_genres: genreIds || moodGenre[answers[0]],
      sort_by: answers[1] === "Yes" ? "release_date.desc" : "popularity.desc",
      include_adult: false,
      language: "en-US",
      certification_country: "US",
      certification: certifications,
      page: 1
    };

    const selectedRuntime = runtime[answers[2]];
    if (selectedRuntime?.gte) params["with_runtime.gte"] = selectedRuntime.gte;
    if (selectedRuntime?.lte) params["with_runtime.lte"] = selectedRuntime.lte;
    if (keywordQuery) params.with_keywords = keywordQuery;

    try {
      const res = await axios.get("https://api.themoviedb.org/3/discover/movie", { params });
      const movies = res.data.results;
      if (movies.length > 0) {
        const pick = movies[Math.floor(Math.random() * movies.length)];
        setMovie(pick);
      } else {
        setMovie({ title: "No movie found", overview: "Try different answers!" });
      }
    } catch (err) {
      console.error(err);
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
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6">{questions[step].question}</h2>

            {questions[step].multi ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (multiAnswers.length > 0) {
                    handleClick(multiAnswers);
                  }
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto"
              >
                {questions[step].options.map((opt, i) => (
                  <label
                    key={i}
                    className="border border-gray-400 rounded-md px-4 py-2 text-left cursor-pointer hover:bg-yellow-400 transition flex gap-2 items-center"
                  >
                    <input
                      type="checkbox"
                      value={opt}
                      checked={multiAnswers.includes(opt)}
                      onChange={(e) => {
                        const value = e.target.value;
                        setMultiAnswers((prev) =>
                          prev.includes(value)
                            ? prev.filter((v) => v !== value)
                            : [...prev, value]
                        );
                      }}
                    />
                    {opt}
                  </label>
                ))}
                <button
                  type="submit"
                  className="col-span-full mt-4 bg-white text-black font-bold px-6 py-2 rounded-full hover:bg-yellow-400"
                >
                  Continue
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MovieQuiz;
