import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import MovieReviews from "../components/MovieReviews";
import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function MoviePage() {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [cast, setCast] = useState([]);
    const [trailerKey, setTrailerKey] = useState(null);
    const [provider, setProvider] = useState({});
    const [isFavorite, setIsFavorite] = useState(false);
    const token = localStorage.getItem("token");
    const COUNTRY_CODE = "IT";

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

        const fetchProvider = async () => {
            try {
                const res = await fetch(
                    `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${API_KEY}`
                );
                const data = await res.json();
                const countryData = data.results[COUNTRY_CODE];
                if (
                    countryData &&
                    (countryData.flatrate ||
                        countryData.buy ||
                        countryData.rent)
                ) {
                    setProvider({
                        flatrate: countryData.flatrate || [],
                        buy: countryData.buy || [],
                        rent: countryData.rent || [],
                    });
                } else {
                    setProvider({ flatrate: [], buy: [], rent: [] });
                }
            } catch (error) {
                console.error("Errore nel recupero dei provider:", error);
            }
        };

        fetchMovie();
        fetchCast();
        fetchTrailer();
        fetchProvider();
    }, [id]);

    // Al montaggio, controlla se questo film è già nei preferiti
    useEffect(() => {
      const checkFavorite = async () => {
        if (!token) return;
    
        try {
          const res = await axios.get("http://localhost:3001/api/favorites", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
    
          const favorites = res.data.movies || [];
          const exists = favorites.some((m) => m.id.toString() === id);
          setIsFavorite(exists);
        } catch (err) {
          console.error("Errore nel recupero dei preferiti:", err);
        }
      };
    
      checkFavorite();
    }, [id]);
      

    const toggleFavorite = async () => {
        if (!token) return alert("Devi essere loggato");
      
        try {
          if (isFavorite) {
            await axios.delete(`http://localhost:3001/api/favorites?movieId=${id}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            setIsFavorite(false);
          } else {
            const newMovie = {
              id: parseInt(id),
              title: movie.title,
              poster_path: movie.poster_path,
            };
      
            console.log("Sto inviando questo movie:", newMovie); // 👈 AGGIUNGILO QUI
      
            await axios.post(
              "http://localhost:3001/api/favorites",
              { movie: newMovie },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
            setIsFavorite(true);
          }
        } catch (err) {
          console.error("Errore nella gestione dei preferiti:", err);
        }
      };
      

    return (
        <div className="min-h-screen bg-black">
            {movie ? (
                <div className="relative min-h-screen">
                    <div
                        className="absolute inset-0 bg-cover bg-center z-0 after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-black"
                        style={{
                            backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
                        }}
                    ></div>

                    <div className="relative z-10 w-full h-full bg-black/70 flex flex-col lg:gap-10 md:p-2 md:flex-row justify-center items-center min-h-screen">
                        <a
                            href="#trailer"
                            className="cursor-pointer mt-4 md:mt-0 border-1 border-gray-600 rounded-xl"
                        >
                            <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={`${movie.title} IMG`}
                                className="border-2 border-transparent hover:scale-105 hover:border-yellow-400 transition max-h-84 md:max-h-96 lg:max-h-[420px] rounded-xl"
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
                                <span>
                                    ⭐{movie.vote_average.toFixed(1)}/10
                                </span>
                                <span>📅{movie.release_date}</span>
                                <span>🕖{movie.runtime}min</span>
                            </div>


                            {/* -- PULSANTE PREFERITI -- */}
                           {token && (
                             <button
                               onClick={toggleFavorite}
                               className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition ${
                                 isFavorite
                                   ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                                   : "bg-gray-800 hover:bg-gray-700 text-yellow-400"
                               }`}
                             >
                               {isFavorite ? "★ In preferiti" : "☆ Aggiungi ai preferiti"}
                             </button>
                           )}


                            <div className="my-4">
                                <span className="text-2xl font-semibold">
                                    Available on:{" "}
                                </span>
                                {provider.flatrate &&
                                provider.flatrate.length > 0 ? (
                                    <ul className="flex flex-col justify-center items-start">
                                        {provider.flatrate.map(
                                            (providerItem) => (
                                                <li
                                                    key={
                                                        providerItem.provider_id
                                                    }
                                                    className="flex flex-row gap-3 my-1 justify-center items-center"
                                                >
                                                    <img
                                                        src={`https://image.tmdb.org/t/p/w45${providerItem.logo_path}`}
                                                        alt={
                                                            providerItem.provider_name
                                                        }
                                                        className="h-8 w-8 rounded-full"
                                                    />
                                                    <strong className="text-yellow-400">
                                                        {
                                                            providerItem.provider_name
                                                        }
                                                    </strong>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                ) : (
                                    <p className="underline">
                                        Not currently available in your country
                                    </p>
                                )}
                            </div>
                            <p className="w-full text-md md:max-w-[75ch]">
                                {movie.overview}
                            </p>
                        </div>
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

            <div id="trailer">
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

            <div className="bg-black/70 p-4 flex flex-col justify-center items-center">
                <h2 className="text-center text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                    Cast
                </h2>
                <div className="flex flex-wrap gap-6 justify-center">
                    {cast.length > 0 ? (
                        cast.slice(0, 6).map((actor) => (
                            <a
                                key={actor.id}
                                className="cursor-pointer flex flex-col items-center text-white"
                                href={`https://en.wikipedia.org/wiki/${actor.name}`}
                            >
                                {actor.profile_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                        alt={actor.name}
                                        className="h-24 md:h-32 lg:h-36 rounded-lg hover:scale-105 transition border-3 border-transparent hover:border-yellow-600"
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

                <MovieReviews movieId={id} />

                <hr className="mt-6 w-[60%] border border-white"></hr>

                <div className="w-full md:w-[85%] lg:w-[75%] mb-2 flex flex-col justify-center items-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {provider.buy && provider.buy.length > 0 && (
                            <ul className="list-none text-white flex flex-col">
                                <li className="text-lg md:text-xl lg:text-2xl mt-8 text-center font-semibold text-yellow-400">
                                    Available for Purchase:
                                </li>
                                {provider.buy.map((item) => (
                                    <li
                                        key={item.provider_id}
                                        className="flex justify-center items-center gap-3 mt-2"
                                    >
                                        <img
                                            src={`https://image.tmdb.org/t/p/w45${item.logo_path}`}
                                            alt={item.provider_name}
                                            className="h-8 w-8 rounded-full"
                                        />
                                        <span>{item.provider_name}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {provider.rent && provider.rent.length > 0 && (
                            <ul className="list-none text-white flex flex-col">
                                <li className="text-lg md:text-xl lg:text-2xl mt-8 text-center font-semibold text-yellow-400">
                                    Available for Rent:
                                </li>
                                {provider.rent.map((item) => (
                                    <li
                                        key={item.provider_id}
                                        className="flex justify-center items-center gap-3 mt-2"
                                    >
                                        <img
                                            src={`https://image.tmdb.org/t/p/w45${item.logo_path}`}
                                            alt={item.provider_name}
                                            className="h-8 w-8 rounded-full"
                                        />
                                        <span>{item.provider_name}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MoviePage;
