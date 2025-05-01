import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import search from "../assets/images/search.svg";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function SearchBar({ className = "" }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.length > 1) {
                fetch(
                    `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
                        searchTerm
                    )}`
                )
                    .then((res) => res.json())
                    .then((data) => {
                        const topResults = data.results.slice(0, 5);
                        setResults(topResults);
                    })
                    .catch((err) =>
                        console.error("Errore nella fetch TMDB:", err)
                    );
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const handleChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleResultClick = (id) => {
        navigate(`/movie/${id}`);
        setSearchTerm("");
        setResults([]);
    };

    return (
        <div
            className={`relative bg-white p-2 rounded-3xl gap-1 w-60 ${className}`}
        >
            <div className="flex flex-row items-center gap-2">
                <button className="m-1 cursor-pointer">
                    <img src={search} alt="Search" className="w-6 h-6" />
                </button>
                <input
                    className="text-black outline-0 text-sm w-full"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleChange}
                />
            </div>

            {results.length > 0 && (
                <ul className="bg-white mt-2 rounded-xl shadow-md text-black text-sm absolute top-full left-0 w-full z-100">
                    {results.map((movie) => (
                        <li
                            key={movie.id}
                            className="bg-[#2c2c2c] py-5 text-white flex flex-row justify-start items-center gap-2 px-4 md:py-2 hover:bg-gray-100 hover:text-black transition cursor-pointer"
                            onClick={() => handleResultClick(movie.id)}
                        >
                            <img
                                className="h-15 md:h-20 rounded-md"
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            />
                            <span>{movie.title}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SearchBar;
