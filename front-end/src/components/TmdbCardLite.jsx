import React from "react";

const TmdbCardLite = ({ movie, onAdd, disabled }) => {
    if (!movie) return null;

    const image = movie.poster_path
        ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
        : "/fallback-image.jpg";

    return (
        <div className="flex flex-row justify-between items-center bg-black/50 rounded-md my-2 p-4">
            <a
                className="w-[80%] flex flex-row justify-start items-center gap-2"
                href={`/movie/${movie.id}`}
            >
                <img
                    src={image}
                    alt={movie.title}
                    className="rounded mb-2 h-16 border border-white/20"
                />
                <p className="text-white font-semibold truncate">
                    {movie.title}
                </p>
            </a>
            <div className="w-[20%]">
                {onAdd && (
                    <button
                        onClick={onAdd}
                        disabled={disabled}
                        className={`cursor-pointer transition mt-2 w-full px-2 py-1 rounded text-sm font-semibold ${
                            disabled
                                ? "bg-gray-500 text-black cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-700 text-black"
                        }`}
                    >
                        {disabled ? "✅ Added" : "➕ Add"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default TmdbCardLite;
