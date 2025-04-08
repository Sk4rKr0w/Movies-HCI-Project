import { useState, useEffect } from "react";

function About() {
    const [movies, setMovies] = useState(null);
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const apiKey = import.meta.env.VITE_TMDB_API_KEY;
                const today = new Date().toISOString().split("T")[0];

                const responses = await Promise.all([
                    fetch(
                        `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&release_date.lte=${today}&page=1`
                    ),
                ]);

                const data1 = await responses[0].json();

                const allMovies = [...data1.results];

                setMovies(allMovies.slice(0, 10));
            } catch (error) {
                console.error(error);
            }
        };

        fetchMovies();
    }, []);

    return (
        <div>
            <ul className="grid grid-cols-5  md:grid-cols-10 gap-2 bg-[#141414]">
                {movies ? (
                    movies.map((movie) => (
                        <li key={movie.id} className="relative w-full h-full">
                            {movie.backdrop_path && (
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title}
                                    className="blur-[1px] w-full h-full object-cover rounded-lg shadow-xl"
                                />
                            )}
                        </li>
                    ))
                ) : (
                    <p className="text-center text-lg">
                        Caricamento in corso...
                    </p>
                )}
            </ul>
            <div className="grid grid-cols-1 md:grid-cols-2 px-10 py-5 bg-black text-white gap-y-2">
                <div className="md:col-span-2 m-5 flex flex-col justify-center items-center">
                    <h1 className="text-center text-3xl md:text-4xl font-semibold mb-2">
                        About Us
                    </h1>
                    <hr className="w-[80%] md:w-[50%]" />
                </div>
                <div className="flex flex-col justify-center items-center">
                    <h1 className="text-2xl mt-2 text-yellow-400 font-semibold">
                        Who are we?
                    </h1>
                    <p className="text-sm max-w-prose md:max-w-[55ch] mt-5 text-center">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Voluptatem ab atque fugit minus. Veritatis aliquam
                        aspernatur autem. Soluta, culpa minus magni assumenda
                        distinctio quod fuga laboriosam tempore veniam
                        recusandae. Beatae officia sit officiis accusantium
                        dicta doloribus aperiam. Et quos, eveniet veniam ex
                        perferendis sequi quisquam magni mollitia, optio omnis
                        dolorem.
                    </p>
                </div>
                <div className="flex flex-col justify-center items-center">
                    <h1 className="text-2xl mt-2 text-yellow-400 font-semibold">
                        What do we do?
                    </h1>
                    <p className="text-sm max-w-prose md:max-w-[55ch] mt-5 text-center">
                        Lorem ipsum dolor, sit amet consectetur adipisicing
                        elit. Deserunt nesciunt expedita saepe rem sint, ipsa
                        autem non consequuntur voluptatibus laborum nemo
                        veritatis, rerum nam eum repellendus aspernatur
                        obcaecati sequi nisi aliquam quod molestiae eius magni.
                        Ipsam esse, repudiandae deserunt odio tempore ad nostrum
                        necessitatibus ipsum expedita, magnam aperiam!
                    </p>
                </div>
                <div className="md:col-span-2 flex flex-col justify-center items-center">
                    <h1 className="text-2xl mt-2 text-yellow-400 font-semibold">
                        What do we offer?
                    </h1>
                    <p className="text-sm mt-5 text-center md:max-w-[90%]">
                        Lorem ipsum, dolor sit amet consectetur adipisicing
                        elit. Enim commodi ipsum, aut nam nemo quo natus
                        excepturi ut magnam. Cupiditate recusandae autem
                        incidunt fugiat ex. Eveniet ullam fugit praesentium
                        accusantium omnis dignissimos dolorum nulla ipsa
                        quisquam odio, ea eligendi molestiae enim
                        necessitatibus. Libero ullam, cupiditate autem possimus
                        dicta maiores beatae?
                    </p>
                    <hr className="my-5 col-span-2 w-[80%] md:w-[50%]" />
                </div>
            </div>
        </div>
    );
}

export default About;
