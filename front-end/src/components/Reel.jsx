import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const Reel = ({ title, items, spinning, selected, useScrollRef = true }) => {
    const movieRef = useScrollRef ? useRef(null) : null;

    useEffect(() => {
        if (useScrollRef && movieRef?.current) {
            const timeout = setTimeout(() => {
                movieRef.current.scrollIntoView({ behavior: "smooth" });
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [selected]);

    return (
        <div className="lg:scale-100 flex flex-col justify-center items-center bg-black bg-opacity-60 border-4 border-yellow-500 rounded-3xl shadow-[0_0_10px_rgba(255,215,0,0.7)] w-64 md:w-56 lg:w-64 h-[360px] overflow-hidden">
            <h2 className="text-yellow-400 text-xl md:text-2xl font-black py-3 tracking-wide animate-pulse">
                {title}
            </h2>
            <hr className="w-full border border-gray-600" />
            <div className="relative w-full h-full overflow-hidden">
                <motion.div
                    className="absolute w-full"
                    animate={{
                        y: spinning ? ["0%", "-100%", "0%"] : "0%",
                    }}
                    transition={{
                        duration: spinning ? 2.5 : 0.5,
                        repeat: spinning ? Infinity : 0,
                        ease: spinning ? "easeInOut" : "easeOut",
                    }}
                >
                    {items.map((item, idx) => (
                        <div
                            key={idx}
                            className="text-white text-sm md:text-md lg:text-[16px] text-center py-2 h-10 flex items-center justify-center"
                        >
                            {item}
                        </div>
                    ))}
                </motion.div>
            </div>
            {!spinning && selected && (
                <div
                    ref={useScrollRef ? movieRef : null}
                    className="w-full text-center bg-yellow-300 text-black font-extrabold px-4 py-2 rounded-3xl mt-2 shadow-inner animate-bounce"
                >
                    <span>{selected}</span>
                </div>
            )}
        </div>
    );
};

export default Reel;
