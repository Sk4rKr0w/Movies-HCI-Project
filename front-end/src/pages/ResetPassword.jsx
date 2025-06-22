import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [msg, setMsg] = useState("");
    const navigate = useNavigate();

    // If token is missing or invalid
    if (!token) {
        return (
            <div className="w-screen h-screen bg-gradient-to-r from-[#1b1b1b] via-[#2d2d2d] to-[#141414] flex items-center justify-center text-white p-4">
                <div className="max-w-md w-full bg-[#1e1e1e] rounded-xl shadow-lg p-6 text-center">
                    <p className="text-red-500 text-lg font-medium">
                        ❌ Invalid or expired reset link.
                    </p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("/api/auth/reset-password", {
                token,
                newPassword,
            });
            setMsg(res.data.message || "✅ Password successfully updated!");
            setTimeout(() => navigate("/signin"), 2000);
        } catch (err) {
            const errorMsg =
                err.response?.data?.error || "❌ Something went wrong.";
            setMsg(errorMsg);
        }
    };

    return (
        <div className="w-screen h-screen bg-gradient-to-r from-[#1b1b1b] via-[#2d2d2d] to-[#141414] text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#1e1e1e] rounded-xl shadow-lg p-6">
                <h2 className="text-3xl font-semibold text-yellow-400 text-center mb-6">
                    Reset Your Password
                </h2>

                {msg && (
                    <div
                        className={`text-sm text-center mb-4 py-2 px-4 rounded-md ${
                            msg.includes("success") || msg.includes("✅")
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
                            htmlFor="newPassword"
                            className="block text-sm text-gray-300 mb-1 text-left"
                        >
                            New Password
                        </label>
                        <input
                            id="newPassword"
                            type="password"
                            name="newPassword"
                            placeholder="Enter your new password"
                            title="Choose a strong password with at least 8 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                        <p className="text-sm text-gray-500 mt-1 text-left">
                            Must be at least 8 characters long
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-md transition-colors duration-200"
                    >
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    );
}
