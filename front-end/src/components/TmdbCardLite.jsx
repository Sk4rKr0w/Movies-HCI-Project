import React from 'react';

const TmdbCardLite = ({ movie, onAdd, disabled }) => {
  if (!movie) return null;

  return (
    <div className="bg-gray-800 rounded shadow p-2 text-sm">
      <img
        src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
        alt={movie.title}
        className="rounded w-full mb-2"
      />
      <p className="text-white font-semibold truncate">{movie.title}</p>

      {onAdd && (
        <button
          onClick={() => onAdd(movie)}
          disabled={disabled}
          className={`mt-2 w-full px-2 py-1 rounded text-sm font-semibold ${
            disabled
              ? 'bg-gray-500 text-white cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-400 text-white'
          }`}
        >
          {disabled ? '✅ Aggiunto' : '➕ Aggiungi'}
        </button>
      )}
    </div>
  );
};

export default TmdbCardLite;
