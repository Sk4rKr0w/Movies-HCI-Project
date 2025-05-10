import React, { useState } from 'react';
import axios from 'axios';
import TmdbCardLite from '../components/TmdbCardLite.jsx';

export default function RouletteFilmSearch({ groupId, onSuccess }) {
    const userId = JSON.parse(localStorage.getItem('user'))?.id;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const searchMovies = async () => {
    try {
      const res = await axios.get('https://api.themoviedb.org/3/search/movie', {
        params: {
          api_key: import.meta.env.VITE_TMDB_API_KEY,
          query,
        },
      });
      setResults(res.data.results);
    } catch (err) {
      console.error('❌ Errore ricerca TMDB:', err);
    }
  };

  const addMovie = (movie) => {
    if (!selectedMovies.find((m) => m.id === movie.id)) {
      setSelectedMovies([...selectedMovies, {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
      }]);
    }
  };

  const removeMovie = (id) => {
    setSelectedMovies(selectedMovies.filter((m) => m.id !== id));
  };

  const saveMovies = async () => {
    try {
      await axios.post(`http://localhost:3001/api/group/roulette/${groupId}`, {
        userId,
        movies: selectedMovies,
      });
      setSelectedMovies([]);
      setResults([]);
      setQuery('');
      setSuccessMsg('✅ Film salvati con successo!');
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 3000);
      onSuccess(); // refresh lista roulette
    } catch (err) {
      console.error('❌ Errore salvataggio film:', err);
      setErrorMsg('❌ Errore durante il salvataggio. Riprova.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  return (
    <div>
      <div className="flex mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-2 flex-grow rounded-l"
          placeholder="Cerca film da TMDB..."
        />
        <button
          onClick={searchMovies}
          className="bg-blue-600 text-white px-4 py-2 rounded-r"
        >
          Cerca
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {results.map((movie) => (
          <TmdbCardLite
            key={movie.id}
            movie={movie}
            onAdd={() => addMovie(movie)}
            disabled={selectedMovies.find((m) => m.id === movie.id)}
          />
        ))}
      </div>

      {selectedMovies.length > 0 && (
        <>
          <h4 className="mt-6 font-bold">🎯 Film selezionati:</h4>
          <ul className="list-disc list-inside text-blue-700">
            {selectedMovies.map((m) => (
              <li key={m.id}>
                {m.title}{' '}
                <button
                  onClick={() => removeMovie(m.id)}
                  className="text-red-500 ml-2"
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            onClick={saveMovies}
          >
            Salva Roulette
          </button>
        </>
      )}

      {successMsg && (
        <div className="mt-4 text-green-600 font-semibold">{successMsg}</div>
      )}
      {errorMsg && (
        <div className="mt-4 text-red-600 font-semibold">{errorMsg}</div>
      )}
    </div>
  );
}
