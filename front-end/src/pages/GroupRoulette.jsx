import React, { useEffect, useState } from 'react';
import RoulettePro from 'react-roulette-pro';
import 'react-roulette-pro/dist/index.css';
import axios from 'axios';

const generateId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`;

const reproductionArray = (array = [], length = 0) => [
  ...Array(length)
    .fill('_')
    .map(() => array[Math.floor(Math.random() * array.length)]),
];

export default function GroupRoulette() {
  const groupId = 33;
  const userId = 'a8edcb1c-602d-4096-b803-558bad3e82a7';

  const [movies, setMovies] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [start, setStart] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState(0);
  const [newList, setNewList] = useState('');

  useEffect(() => {
    fetchMovies();
    checkOwnership();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/group/roulette/${groupId}`);
      console.log('🎬 Movies:', res.data.movies);
      const raw = res.data.movies || [];
      const full = [
        ...raw,
        ...reproductionArray(raw, raw.length * 2),
        ...raw,
        ...reproductionArray(raw, raw.length),
      ].map((title) => ({
        image: `https://via.placeholder.com/150?text=${encodeURIComponent(title)}`,
        id: generateId(),
      }));
      setMovies(full);
    } catch (err) {
      console.error("❌ Errore fetchMovies:", err);
    }
  };

  const checkOwnership = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/group/${groupId}/owner`);
      console.log("✅ OWNER FROM API:", res.data.ownerId);
      console.log("🧑‍💻 HARDCODED USER:", userId);
      const isOwnerCheck = res.data.ownerId === userId;
      console.log("🧠 IS OWNER?", isOwnerCheck);
      setIsOwner(isOwnerCheck);
    } catch (err) {
      console.error("❌ Errore checkOwnership:", err);
    }
  };

  const handleSpin = () => {
    const index = Math.floor(Math.random() * movies.length);
    setPrizeIndex(index);
    setStart(true);
  };

  const handlePrizeDefined = () => {
    setStart(false);
  };

  const handleSaveMovies = async () => {
    const moviesArray = newList
      .split('\n')
      .map((m) => m.trim())
      .filter(Boolean);
    await axios.post(`http://localhost:3001/api/group/roulette/${groupId}`, {
      userId,
      movies: moviesArray,
    });
    setNewList('');
    fetchMovies();
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">🎯 Group Roulette</h1>

      {movies.length > 0 && (
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
      )}

      {isOwner && (
        <div className="mt-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-2">🎬 Inserisci Film</h3>
          <textarea
            className="w-full p-2 border rounded"
            rows={4}
            value={newList}
            onChange={(e) => setNewList(e.target.value)}
            placeholder="Un film per riga"
          />
          <button
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleSaveMovies}
          >
            Salva
          </button>
        </div>
      )}
    </div>
  );
}
