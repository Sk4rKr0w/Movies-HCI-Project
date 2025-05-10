import React, { useEffect, useState } from 'react';
import RoulettePro from 'react-roulette-pro';
import 'react-roulette-pro/dist/index.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import RouletteFilmSearch from '../components/RouletteFilmSearch';

const generateId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`;

const reproductionArray = (array = [], length = 0) =>
  Array(length)
    .fill('_')
    .map(() => array[Math.floor(Math.random() * array.length)]);

export default function GroupRoulette() {
  const { id: groupId } = useParams();
  const userId = JSON.parse(localStorage.getItem('user'))?.id;

  const [movies, setMovies] = useState([]);
  const [rawMovies, setRawMovies] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [start, setStart] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState(0);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    fetchMovies();
    checkOwnership();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/group/roulette/${groupId}`);
      const raw = res.data.movies || [];

      setRawMovies(raw); // serve per sapere il titolo reale poi

      const full = [
        ...raw,
        ...reproductionArray(raw, raw.length * 2),
        ...raw,
        ...reproductionArray(raw, raw.length),
      ].map((movie) => ({
        image: `https://image.tmdb.org/t/p/original${movie.poster_path}`,
        id: generateId(),
        ...movie,
      }));

      setMovies(full);
    } catch (err) {
      console.error('❌ Errore fetchMovies:', err);
    }
  };

  const checkOwnership = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/group/${groupId}/owner`);
      setIsOwner(res.data.ownerId === userId);
    } catch (err) {
      console.error('❌ Errore checkOwnership:', err);
    }
  };

  const handleSpin = () => {
    const index = Math.floor(Math.random() * movies.length);
    setPrizeIndex(index);
    setStart(true);
  };

  const handlePrizeDefined = async () => {
    setStart(false);
    const winnerMovie = movies[prizeIndex];
    setWinner(winnerMovie);

    try {
      // Svuota la lista nel DB dopo lo spin
      await axios.post(`http://localhost:3001/api/group/roulette/${groupId}`, {
        userId,
        movies: [],
      });
      setRawMovies([]);
      setMovies([]);
    } catch (err) {
      console.error('❌ Errore svuotamento roulette:', err);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">🎯 Group Roulette</h1>

      {movies.length > 0 ? (
        <>
          <RoulettePro
            prizes={movies}
            prizeIndex={prizeIndex}
            start={start}
            onPrizeDefined={handlePrizeDefined}
          />
          <button
            onClick={handleSpin}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
          >
            Avvia la roulette
          </button>
        </>
      ) : (
        <p className="text-pink-600 font-semibold mb-4">
          🎬 Nessun film disponibile. Aggiungine uno!
        </p>
      )}

      {winner && (
        <div className="mt-6 text-center">
          <h3 className="text-xl font-bold text-green-600">🎉 Film Vincente!</h3>
          <p className="text-lg text-white">{winner.title}</p>
          <img
            src={winner.image}
            alt={winner.title}
            className="mt-2 w-40 rounded shadow"
          />
        </div>
      )}

      {isOwner && (
        <div className="mt-8 w-full max-w-xl">
          <h3 className="text-lg font-semibold mb-2">🎬 Inserisci Film</h3>
          <RouletteFilmSearch
            groupId={groupId}
            userId={userId}
            onSuccess={fetchMovies}
          />
        </div>
      )}
    </div>
  );
}
