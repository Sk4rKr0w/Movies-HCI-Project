import { create } from "zustand";

export const useMovieStore = create((set) => ({
    movies: [],
    fetchMovies: async (count = 30) => {
        try {
            const apiKey = import.meta.env.VITE_TMDB_API_KEY;
            const today = new Date().toISOString().split("T")[0];

            const responses = await Promise.all([
                fetch(
                    `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&release_date.lte=${today}&page=1`
                ),
                fetch(
                    `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&release_date.lte=${today}&page=2`
                ),
            ]);

            const data1 = await responses[0].json();
            const data2 = await responses[1].json();
            const allMovies = [...data1.results, ...data2.results];

            set({ movies: allMovies.slice(0, count) });
        } catch (error) {
            console.error("Errore nel fetch dei film:", error);
        }
    },
}));
