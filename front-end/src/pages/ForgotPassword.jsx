import { useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/api/auth/forgot-password", { email });
            setMsg("📧 Email sent! Check your inbox to reset your password.");
        } catch (err) {
            setMsg(
                err.response?.data?.error ||
                    "❌ Something went wrong. Try again."
            );
        }
    };

    return (
        <div className="w-screen h-screen bg-gradient-to-r from-[#1b1b1b] via-[#2d2d2d] to-[#141414] text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#1e1e1e] rounded-xl shadow-lg p-6">
                <h2 className="text-3xl font-semibold text-yellow-400 text-center mb-6">
                    Forgot Password
                </h2>

                {msg && (
                    <div
                        className={`text-sm text-center mb-4 py-2 px-4 rounded-md ${
                            msg.startsWith("📧")
                                ? "bg-green-600 text-white"
                                : "bg-red-600 text-white"
                        }`}
                    >
                        {msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm text-gray-300 mb-1 text-left"
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            title="Enter the email associated with your account"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                        <p className="text-sm text-gray-500 mt-1 text-left">
                            You'll receive a link to reset your password
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="cursor-pointer w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-md transition-colors duration-200"
                    >
                        Send Reset Link
                    </button>

                    <NavLink
                        to="/signin"
                        className="block text-center text-sm text-gray-400 hover:text-yellow-400 transition-colors duration-200"
                    >
                        Back to{" "}
                        <strong className="text-yellow-400">Login</strong>
                    </NavLink>
                </form>
            </div>
        </div>
    );
}
