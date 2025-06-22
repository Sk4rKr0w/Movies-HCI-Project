import React, { useEffect, useState, useRef } from "react";
import RoulettePro from "react-roulette-pro";
import "react-roulette-pro/dist/index.css";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import RouletteFilmSearch from "./RouletteFilmSearch";
import confetti from "canvas-confetti";

const reproductionArray = (array = [], length = 0) =>
    Array(length)
        .fill("_")
        .map(() => array[Math.floor(Math.random() * array.length)]);

const preloadImages = (urls) => {
    return Promise.all(
        urls.map(
            (url) =>
                new Promise((resolve) => {
                    const img = new Image();
                    img.src = url;
                    img.onload = resolve;
                    img.onerror = resolve;
                })
        )
    );
};

export default function GroupRoulette() {
    const { id: groupId } = useParams();
    const userId = JSON.parse(localStorage.getItem("user"))?.id;
    const navigate = useNavigate();

    const [rawMovies, setRawMovies] = useState([]);
    const [prizeList, setPrizeList] = useState([]);
    const [isOwner, setIsOwner] = useState(false);
    const [start, setStart] = useState(false);
    const [prizeIndex, setPrizeIndex] = useState(0);
    const [winner, setWinner] = useState(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const winnerRef = useRef(null);

    useEffect(() => {
        fetchMovies();
        checkOwnership();
    }, []);

    const fetchMovies = async () => {
        try {
            const res = await axios.get(
                `http://localhost:3001/api/group/roulette/${groupId}`
            );
            const raw = res.data.movies || [];
            setRawMovies(raw);
            setWinner(null);

            if (raw.length === 0) {
                setPrizeList([]);
                return;
            }

            const extendedList = [
                ...raw,
                ...reproductionArray(raw, raw.length * 3),
                ...raw,
                ...reproductionArray(raw, raw.length),
            ].map((movie) => ({
                ...movie,
                image: `https://image.tmdb.org/t/p/original${movie.poster_path}`,
            }));

            const imageUrls = extendedList.map((movie) => movie.image);
            await preloadImages(imageUrls);

            const finalPrizeList = extendedList.map((prize) => ({
                ...prize,
                id: prize.id,
            }));

            setPrizeList(finalPrizeList);
        } catch (err) {
            console.error("❌ Error fetching movies:", err);
        }
    };

    const checkOwnership = async () => {
        try {
            const res = await axios.get(
                `http://localhost:3001/api/group/${groupId}/owner`
            );
            setIsOwner(res.data.ownerId === userId);
        } catch (err) {
            console.error("❌ Error checking ownership:", err);
        }
    };

    const handleSpin = () => {
        if (!prizeList.length) return;

        const winIndex = Math.floor(Math.random() * rawMovies.length);
        const offset = rawMovies.length * 4;

        setPrizeIndex(offset + winIndex);
        setStart(true);
        setIsSpinning(true);
    };

    const handlePrizeDefined = async () => {
        const winnerMovie = prizeList[prizeIndex];
        setWinner(winnerMovie);
        setStart(false);
        setIsSpinning(false);
        launchConfetti();

        try {
            await axios.post(
                `http://localhost:3001/api/group/roulette/${groupId}`,
                {
                    userId,
                    movies: [],
                }
            );
            setRawMovies([]);
            setPrizeList([]);
        } catch (err) {
            console.error("❌ Error clearing roulette:", err);
        }
    };

    const handleWinnerClick = () => {
        if (winner && winner.id) {
            navigate(`/movie/${winner.id}`);
        }
    };

    const launchConfetti = () => {
        confetti({
            particleCount: 500,
            spread: 360,
            origin: { x: 0.5, y: 0.5 },
            colors: ["#ff0000", "#00ff00", "#0000ff"],
        });
    };

    useEffect(() => {
        if (winnerRef.current) {
            winnerRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [winner]);

    return (
        <div className="p-3 md:p-6 flex flex-col items-center text-gray-100 bg-gray-800/50 my-4 rounded-lg">
            <h1 className="text-2xl font-bold text-center mb-4 text-yellow-400">
                🎲 Can't decide what to watch? 🎲
                <br /> Let the roulette choose for you!
            </h1>

            {prizeList.length > 0 ? (
                <div className="flex flex-col w-full">
                    <RoulettePro
                        prizes={prizeList}
                        prizeIndex={prizeIndex}
                        start={start}
                        onPrizeDefined={handlePrizeDefined}
                        type="horizontal"
                        spinningTime={5}
                    />

                    <button
                        onClick={handleSpin}
                        disabled={isSpinning}
                        className="cursor-pointer mt-4 bg-gray-700 hover:bg-gray-800 text-yellow-400 hover:text-yellow-500 transition px-4 py-2 rounded disabled:opacity-50"
                    >
                        Start the Roulette
                    </button>
                </div>
            ) : (
                <hr className="w-[80%]" />
            )}

            {winner && (
                <div className="mt-6 text-center" onClick={handleWinnerClick}>
                    <h3 className="text-xl font-bold text-yellow-400">
                        The fate has been decided! 🎉
                    </h3>
                    <div className="cursor-pointer flex flex-col justify-center items-center gap-2  hover:scale-105 transition">
                        <img
                            src={winner.image}
                            alt={winner.title}
                            className="mt-2 w-40 rounded shadow-lg border-2 border-yellow-500/80"
                        />
                        <p className="text-lg text-gray-200 font-medium">
                            {winner.title}
                        </p>
                    </div>
                </div>
            )}

            <div className="mt-8 w-full max-w-xl flex flex-col">
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">
                    🎬 Add Movies
                </h3>
                <RouletteFilmSearch
                    groupId={groupId}
                    userId={userId}
                    onSuccess={fetchMovies}
                />
            </div>
        </div>
    );
}
