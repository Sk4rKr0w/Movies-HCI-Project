export const fetchMovies = async (totalMovies = 30) => {
    try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        const today = new Date().toISOString().split("T")[0];

        const moviesPerPage = 20;
        const pagesNeeded = Math.ceil(totalMovies / moviesPerPage);

        const requests = [];
        for (let i = 1; i <= pagesNeeded; i++) {
            requests.push(
                fetch(
                    `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&release_date.lte=${today}&page=${i}`
                )
            );
        }

        const responses = await Promise.all(requests);
        const allData = await Promise.all(responses.map((res) => res.json()));

        const allMovies = allData.flatMap((data) => data.results);

        return allMovies.slice(0, totalMovies);
    } catch (error) {
        console.error("Errore nel fetch dei film:", error);
        throw error;
    }
};
