import { useEffect } from "react";
import { useMovieStore } from "../store/useMovieStore";

function About() {
    const movies = useMovieStore((state) => state.movies);
    const fetchMovies = useMovieStore((state) => state.fetchMovies);

    useEffect(() => {
        fetchMovies(10);
    }, [fetchMovies]);

    return (
        <div>
            <ul className="grid grid-cols-5 md:grid-cols-10 gap-2 bg-[#141414]">
                {movies && movies.length > 0 ? (
                    movies.map((movie) =>
                        movie.poster_path ? (
                            <li
                                key={movie.id}
                                className="relative w-full h-full"
                            >
                                <img
                                    src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                                    alt={movie.title}
                                    className="blur-[1px] w-full h-full object-cover rounded-lg shadow-xl"
                                />
                            </li>
                        ) : null
                    )
                ) : (
                    <li className="col-span-full flex justify-center items-center h-full">
                        <div className="flex space-x-2">
                            <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-3 h-3 bg-white rounded-full animate-bounce"></span>
                        </div>
                    </li>
                )}
            </ul>

            <div className="grid grid-cols-1 md:grid-cols-2 px-10 py-5 bg-black text-white gap-y-2">
                <div className="md:col-span-2 m-5 flex flex-col justify-center items-center">
                    <h1 className="text-center text-3xl md:text-4xl font-semibold mb-2">
                        About Us
                    </h1>
                    <hr className="w-[80%] md:w-[50%]" />
                </div>

                <div className="mt-4 md:mt-0 flex flex-col justify-center items-center">
                    <h1 className="text-2xl text-yellow-400 font-semibold">
                        Who are we?
                    </h1>
                    <p className="text-md lg:text-lg max-w-prose md:max-w-[55ch] mt-5 text-center">
                        We are a passionate team of{" "}
                        <strong className="font-extrabold text-yellow-400">
                            movie lovers
                        </strong>{" "}
                        dedicated to making film selection more fun,
                        interactive, and social. Whether you're into
                        blockbusters or indie gems, we believe that{" "}
                        <em className="italic font-semibold">
                            discovering what to watch should be as exciting as
                            the movie itself
                        </em>
                        .
                    </p>
                </div>

                <div className="mt-6 md:mt-0 flex flex-col justify-center items-center">
                    <h1 className="text-2xl text-yellow-400 font-semibold">
                        What do we do?
                    </h1>
                    <p className="text-md lg:text-lg max-w-prose md:max-w-[55ch] mt-5 text-center">
                        Our platform helps users explore new movies through an
                        engaging{" "}
                        <strong className="font-extrabold text-yellow-400">
                            quiz system
                        </strong>{" "}
                        that understands your taste and mood. Plus, with our
                        group feature, you can{" "}
                        <em className="italic font-semibold">
                            team up with friends
                        </em>{" "}
                        to vote and choose the perfect film for your next movie
                        night.
                    </p>
                </div>

                <div className="mt-6 md:mt-8 md:col-span-1 flex flex-col justify-center items-center">
                    <h1 className="text-2xl mt-2 text-yellow-400 font-semibold">
                        What do we offer?
                    </h1>
                    <p className="text-md lg:text-lg mt-5 text-center md:max-w-[90%]">
                        We offer a smart movie discovery tool powered by data
                        from TMDb, a unique recommendation quiz, and the ability
                        to{" "}
                        <strong className="font-extrabold text-yellow-400">
                            create private or public groups
                        </strong>{" "}
                        where everyone can contribute to the film choice. It's
                        like having your own digital cinema club at your
                        fingertips.
                    </p>
                    <hr className="hidden md:flex my-5 col-span-2 w-[80%] md:w-[50%]" />
                </div>

                <div className="mt-6 md:mt-0 md:col-span-1 flex flex-col justify-center items-center">
                    <h1 className="text-2xl mt-2 text-yellow-400 font-semibold">
                        What can you do?
                    </h1>
                    <p className="text-md lg:text-lg mt-5 text-center md:max-w-[90%]">
                        As a user, you can{" "}
                        <strong className="font-extrabold text-yellow-400">
                            explore popular and hidden gems
                        </strong>
                        , take a quiz to find a movie that matches your
                        preferences, and{" "}
                        <em className="italic font-semibold">
                            invite friends to join your group
                        </em>
                        . Once inside, everyone can suggest titles and vote
                        together to decide what to watch next.
                    </p>
                    <hr className="hidden md:flex my-5 col-span-2 w-[80%] md:w-[50%]" />
                </div>

                <div className="mt-6 md:mt-8 md:col-span-2 flex flex-col justify-center items-center">
                    <h1 className="text-2xl mt-2 text-yellow-400 font-semibold">
                        Why does it matter?
                    </h1>
                    <p className="text-md lg:text-lg mt-5 text-center md:max-w-[90%] lg:max-w-[70%]">
                        Choosing a movie doesn't have to be a chore. With our
                        platform, it becomes a{" "}
                        <strong className="font-extrabold text-yellow-400">
                            shared experience
                        </strong>
                        , fostering connection and fun. Whether it's a cozy
                        night in or a long-distance movie session, we make it
                        easy to{" "}
                        <em className="italic font-semibold">
                            come together around great stories
                        </em>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}

export default About;
