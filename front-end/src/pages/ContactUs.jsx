import { useState, useEffect } from "react";
import { useMovieStore } from "../store/useMovieStore";
import axios from "axios";

function ContactUs() {
    const movies = useMovieStore((state) => state.movies);
    const fetchMovies = useMovieStore((state) => state.fetchMovies);

    useEffect(() => {
        fetchMovies(10);
    }, [fetchMovies]);

    // Stato per raccogliere i dati del form
    const [formData, setFormData] = useState({
        email: "",
        subject: "",
        message: "",
    });

    // Stato per gestire eventuali errori o successo
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Gestore per l'aggiornamento dei campi del form
    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // Gestore per la submission del form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Verifica se tutti i campi sono stati compilati
        if (!formData.email || !formData.message) {
            setError("Email and messagge required.");
            return;
        }

        try {
            // Effettua la richiesta POST al backend
            const response = await axios.post(
                "http://localhost:3001/api/contact/contact",
                formData
            );

            // Gestisci la risposta del server
            if (response.data) {
                setSuccess("Your request was successfully sent.");
                setFormData({ email: "", subject: "", message: "" }); // Reset del form
                setError("");
            }
        } catch (err) {
            console.error("Error in your request:", err);
            setError(
                "There was an error while sending your request. Retry later."
            );
            setSuccess("");
        }
    };

    return (
        <div className="bg-black p-4">
            <div
                className="slider w-full my-4"
                style={{
                    "--width": "150px",
                    "--height": "200px",
                    "--quantity": 10,
                }}
            >
                <ul className="list flex flex-row gap-2">
                    {movies &&
                        movies.map((movie, index) => (
                            <li
                                key={movie.id}
                                style={{ "--position": index + 1 }}
                                className="item"
                            >
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title}
                                    className="w-full h-full object-cover rounded-lg shadow-xl"
                                />
                            </li>
                        ))}
                </ul>
            </div>

            <div className="bg-[#2c2c2c] text-white p-8 rounded-lg shadow-xl max-w-3xl mx-auto">
                <h2 className="text-3xl font-semibold mb-6 text-center">
                    Contact Us
                </h2>

                {error && <div className="text-red-500 mb-4">{error}</div>}

                {success && (
                    <div className="text-green-500 mb-4">{success}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-lg font-medium"
                        >
                            Email:
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="(e.g. mariorossi@example.com)"
                            required
                            className="w-full p-3 mt-2 bg-gray-800 text-white border border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="subject"
                            className="block text-lg font-medium"
                        >
                            Subject:
                        </label>
                        <select
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full p-3 mt-2 bg-gray-800 text-white border border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            required
                        >
                            <option value="">Select a subject</option>
                            <option value="Account Problems">
                                Account Problems
                            </option>
                            <option value="Suggestion">Suggestion</option>
                            <option value="Report a Bug">Report a Bug</option>
                            <option value="Suspicious Activity">
                                Suspicious Activity
                            </option>
                            <option value="Complaints">Complaints</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="message"
                            className="block text-lg font-medium"
                        >
                            Message:
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Enter your message..."
                            required
                            className="w-full p-3 mt-2 bg-gray-800 text-white border border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 h-40"
                        />
                    </div>

                    <button
                        type="submit"
                        className="cursor-pointer w-full py-3 mt-4 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors duration-300"
                    >
                        Send
                    </button>
                </form>
            </div>

            <div
                className="slider w-full my-4"
                style={{
                    "--width": "150px",
                    "--height": "200px",
                    "--quantity": 10,
                }}
            >
                <ul className="list flex flex-row gap-2">
                    {movies &&
                        movies.map((movie, index) => (
                            <li
                                key={movie.id}
                                style={{ "--position": index + 1 }}
                                className="item"
                            >
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title}
                                    className="w-full h-full object-cover rounded-lg shadow-xl"
                                />
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
}

export default ContactUs;
