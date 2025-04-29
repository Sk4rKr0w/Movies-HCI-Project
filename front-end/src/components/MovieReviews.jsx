import { useEffect, useState } from "react";
import axios from "axios";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const MovieReviews = ({ movieId }) => {
    const [reviews, setReviews] = useState([]);
    const [expandedReviews, setExpandedReviews] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `https://api.themoviedb.org/3/movie/${movieId}/reviews`,
                    {
                        params: {
                            api_key: API_KEY,
                            language: "en-US",
                            page: 1,
                        },
                    }
                );
                setReviews(response.data.results);
                setExpandedReviews({}); // reset espansioni su cambio film
            } catch (err) {
                setError("Errore nel recupero delle recensioni.");
            } finally {
                setLoading(false);
            }
        };

        if (movieId) {
            fetchReviews();
        }
    }, [movieId]);

    const toggleExpand = (reviewId) => {
        setExpandedReviews((prev) => ({
            ...prev,
            [reviewId]: !prev[reviewId],
        }));
    };

    if (loading) return <p>Caricamento...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="w-full md:w-[85%] lg:w-[75%] my-4 flex flex-col justify-center items-center ">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold ml-2 md:ml-0 my-4 text-yellow-400">
                Reviews
            </h2>
            {reviews.length === 0 ? (
                <p className="text-gray-400 italic">No reviews found.</p>
            ) : (
                <ul className="grid gap-4">
                    {reviews.map((review) => {
                        const isExpanded = expandedReviews[review.id];
                        const content = isExpanded
                            ? review.content
                            : review.content.slice(0, 500);

                        return (
                            <li
                                key={review.id}
                                className="bg-gray-800 rounded-xl p-4 shadow"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    {review.author_details.avatar_path ? (
                                        <img
                                            src={
                                                review.author_details.avatar_path.startsWith(
                                                    "/https"
                                                )
                                                    ? review.author_details.avatar_path.slice(
                                                          1
                                                      )
                                                    : `https://image.tmdb.org/t/p/w45${review.author_details.avatar_path}`
                                            }
                                            alt={review.author}
                                            className="w-10 h-10 rounded-full object-cover object-top"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-sm text-white">
                                            {review.author[0]}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-white">
                                            {review.author}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(
                                                review.created_at
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className="text-sm text-gray-200 whitespace-pre-line"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            !isExpanded &&
                                            review.content.length > 500
                                                ? content + "..."
                                                : content,
                                    }}
                                />
                                {review.content.length > 500 && (
                                    <button
                                        onClick={() => toggleExpand(review.id)}
                                        className="mt-2 text-blue-400 text-sm hover:underline"
                                    >
                                        {isExpanded ? "Show Less" : "Read More"}
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default MovieReviews;
