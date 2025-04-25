import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function MoviePage() {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [cast, setCast] = useState([]);
    const [trailerKey, setTrailerKey] = useState(null);

    const fetchYouTubeTrailer = async (movieId) => {
        const res = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`
        );
        const data = await res.json();

        const trailer = data.results.find(
            (vid) => vid.site === "YouTube" && vid.type === "Trailer"
        );

        return trailer ? trailer.key : null;
    };

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const res = await fetch(
                    `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`
                );
                const data = await res.json();
                setMovie(data);
            } catch (err) {
                console.error("Errore nella fetch:", err);
            }
        };

        const fetchCast = async () => {
            try {
                const res = await fetch(
                    `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}`
                );
                const data = await res.json();
                setCast(data.cast);
            } catch (err) {
                console.error("Errore nella fetch del cast:", err);
            }
        };

        const fetchTrailer = async () => {
            try {
                const key = await fetchYouTubeTrailer(id);
                setTrailerKey(key);
            } catch (err) {
                console.error("Errore nella fetch del trailer:", err);
            }
        };

        fetchMovie();
        fetchCast();
        fetchTrailer();
    }, [id]);

    return (
        <div
            className="min-h-screen bg-cover bg-center"
            style={{
                backgroundImage: movie
                    ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
                    : "none",
            }}
        >
            {movie ? (
                <div className="lg:gap-10 md:p-2 min-h-screen flex bg-black/70 flex-col md:flex-row justify-center items-center">
                    <a href="#target-section">
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={`${movie.title} IMG`}
                            className="mt-4 md:mt-0 cursor-pointer border-2 border-transparent hover:scale-105 hover:border-yellow-400 transition max-h-84 md:max-h-96 lg:max-h-[420px] rounded-xl"
                        />
                    </a>
                    <div className="text-white mt-4 p-4">
                        <h1 className="text-3xl font-extrabold mb-2 w-full text-yellow-400">
                            {movie.title}
                        </h1>
                        <div className="flex flex-wrap gap-2 my-4">
                            {movie.genres?.map((genre) => (
                                <span
                                    key={genre.id}
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                                >
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                        <div className="flex flex-row gap-x-2">
                            <span>⭐{movie.vote_average.toFixed(1)}/10</span>
                            <span>📅{movie.release_date}</span>
                            <span>🕖{movie.runtime}min</span>
                        </div>
                        <p className="w-full text-md md:max-w-[75ch]">
                            {movie.overview}
                        </p>
                    </div>
                </div>
            ) : (
                <li className="col-span-full flex justify-center items-center h-full">
                    <div className="flex space-x-2">
                        <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-3 h-3 bg-white rounded-full animate-bounce"></span>
                    </div>
                </li>
            )}

            <div id="target-section">
                {trailerKey && (
                    <div className="flex flex-col gap-2 justify-center items-center bg-black/70 py-8 px-4">
                        <h1 className="text-white text-xl font-bold">
                            Watch the trailer NOW!
                        </h1>
                        <div className="flex justify-center items-center w-full max-w-4xl aspect-video">
                            <iframe
                                id="iframe-target"
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${trailerKey}`}
                                title="Trailer YouTube"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="rounded-xl shadow-lg md:w-[80%] md:h-[80%] lg:w-[90%] lg:h-[90%]"
                            ></iframe>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-black/70 p-4">
                <h2 className="text-center text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                    Cast
                </h2>
                <div className="flex flex-wrap gap-6 justify-center">
                    {cast.length > 0 ? (
                        cast.slice(0, 6).map((actor) => (
                            <a
                                key={actor.id}
                                className="cursor-pointer flex flex-col items-center text-white"
                                href={`https://it.wikipedia.org/wiki/${actor.name}`}
                            >
                                {actor.profile_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                        alt={actor.name}
                                        className="h-24 md:h-32 lg:h-36 rounded-lg hover:scale-105 transition border-2 border-transparent hover:border-yellow-700"
                                    />
                                ) : (
                                    <div className="h-24 md:h-32 lg:h-36 rounded-full bg-gray-500"></div>
                                )}
                                <p className="text-sm mt-2">{actor.name}</p>
                                <p className="text-xs text-gray-300">
                                    {actor.character}
                                </p>
                            </a>
                        ))
                    ) : (
                        <p>Caricamento cast...</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MoviePage;
