import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function GroupRoulette() {
  // 👇 Hardcoded IDs per test
  const groupId = '33';
  const userId = 'a8edcb1c-602d-4096-b803-558bad3e82a7';

  const [movies, setMovies] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [newList, setNewList] = useState('');
  const wheelRef = useRef(null);

  useEffect(() => {
    fetchMovies();
    checkOwnership();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await axios.get(`/api/group/roulette/${groupId}`);
      console.log("✅ MOVIES FROM API:", res.data.movies);
      setMovies(res.data.movies || []);
    } catch (err) {
      console.error("❌ Errore fetch movies:", err);
    }
  };

  const checkOwnership = async () => {
    try {
      const res = await axios.get(`/api/group/${groupId}/owner`);
      console.log("✅ OWNER FROM API:", res.data.ownerId);
      console.log("🆔 HARDCODED USER ID:", userId);
      const isOwnerCheck = res.data.ownerId === userId;
      console.log("🧠 IS OWNER?", isOwnerCheck);
      setIsOwner(isOwnerCheck);
    } catch (err) {
      console.error("❌ Errore check owner:", err);
    }
  };

  const spin = () => {
    if (isSpinning || movies.length < 2) {
      console.warn("❗ Not enough movies to spin or already spinning");
      return;
    }

    const segmentAngle = 360 / movies.length;
    const randomIndex = Math.floor(Math.random() * movies.length);
    const rotation = 3600 + (randomIndex * segmentAngle) + segmentAngle / 2;

    setIsSpinning(true);
    setSelected(null);

    wheelRef.current.style.transition = 'transform 5s ease-out';
    wheelRef.current.style.transform = `rotate(${rotation}deg)`;

    setTimeout(() => {
      setIsSpinning(false);
      setSelected(movies[randomIndex]);
    }, 5000);
  };

  const getSegmentStyle = (i) => {
    const angle = 360 / movies.length;
    return {
      transform: `rotate(${i * angle}deg) skewY(-${90 - angle}deg)`,
      background: i % 2 === 0 ? '#4f46e5' : '#3b82f6',
    };
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-xl font-bold mb-6">🎯 Group Movie Roulette</h2>

      <div className="relative w-[300px] h-[300px] rounded-full overflow-hidden border-4 border-gray-800 shadow-xl">
        <div
          ref={wheelRef}
          className="absolute w-full h-full origin-center"
          style={{ borderRadius: '50%' }}
        >
          {movies.map((movie, i) => (
            <div
              key={i}
              className="absolute w-1/2 h-1/2 origin-bottom-left text-white text-xs text-center flex items-center justify-center"
              style={getSegmentStyle(i)}
            >
              <span style={{ transform: 'skewY(90deg) rotate(90deg)' }}>{movie}</span>
            </div>
          ))}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[145%] text-2xl">🔻</div>
      </div>

      <button
        onClick={spin}
        className="mt-6 bg-green-600 text-white px-4 py-2 rounded shadow"
        disabled={isSpinning}
      >
        {isSpinning ? 'Spinning...' : 'Spin'}
      </button>

      {selected && (
        <div className="mt-4 text-lg font-medium text-center">
          🎉 Selected Movie: <span className="text-blue-600 font-bold">{selected}</span>
        </div>
      )}

      {/* 👇 FORM visibile solo se isOwner === true */}
      {isOwner && (
        <div className="mt-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-2">🎬 Set Roulette Movies</h3>
          <textarea
            className="w-full p-2 border rounded"
            rows="4"
            placeholder="One movie per line..."
            value={newList}
            onChange={(e) => setNewList(e.target.value)}
          />
          <button
            className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
            onClick={async () => {
              const newMovies = newList.split('\n').map((m) => m.trim()).filter(Boolean);
              console.log("🎬 Saving movies:", newMovies);
              await axios.post(`/api/group/roulette/${groupId}`, { movies: newMovies });
              setNewList('');
              fetchMovies();
            }}
          >
            Save Movies
          </button>
        </div>
      )}
    </div>
  );
}
