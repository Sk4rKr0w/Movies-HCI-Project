// back-end/controllers/authController.js

const supabase = require("../supabaseClient");
const db = require("../supabaseClient"); // per query SQL
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { createTestTransporter } = require("../config/mail"); // Ethereal in dev

// 1) Registrazione
const registerUser = async (req, res) => {
    const { username, email, password, favorite_genres } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { data, error } = await supabase
            .from("users")
            .insert([
                {
                    username,
                    email,
                    password: hashedPassword,
                    avatar_url: "default_avatar.png",
                    favorite_genres,
                },
            ])
            .select();

        if (error) {
            console.error("Registration error:", error);
            return res.status(500).json({ error: "Registration failed" });
        }

        return res
            .status(201)
            .json({ message: "User registered", user: data[0] });
    } catch (err) {
        console.error("Unexpected error:", err);
        return res.status(500).json({ error: "Something went wrong" });
    }
};

// 2) Login
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res
            .status(400)
            .json({ error: "Both email and password are required" });
    }

    try {
        const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: "Unregistered Email" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Wrong password" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "5h" }
        );

        return res
            .status(200)
            .json({ message: "Login successful", token, user });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Something went wrong" });
    }
};

// 3) Forgot Password (Ethereal in dev)
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Trova utente
    const { data: user, error: userErr } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();
    if (userErr || !user) {
        return res.status(404).json({ error: "User not found" });
    }

    // Genera token + scadenza (1h)
    const token = crypto.randomBytes(32).toString("hex");
    // salviamo l'ISO string con timezone
    const expiresAt = new Date(Date.now() + 3600_000).toISOString();

    await db.from("password_reset_tokens").insert({
        user_id: user.id,
        token,
        expires_at: expiresAt,
    });

    // Invia email con Ethereal
    const transporter = await createTestTransporter();
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    const info = await transporter.sendMail({
        from: `"GuruFilm" <noreply@gurufilm.com>`,
        to: email,
        subject: "Reset your password",
        html: `
      <p>You requested to reset your password. The link is valid for 1 hour:</p>
      <a href="${resetLink}">${resetLink}</a>
    `,
    });

    console.log(
        "Preview URL ethereal:",
        require("nodemailer").getTestMessageUrl(info)
    );
    return res.status(200).json({
        message: "Password reset email sent (in dev on Ethereal)",
        previewUrl: require("nodemailer").getTestMessageUrl(info),
    });
};

// 4) Reset Password
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res
            .status(400)
            .json({ error: "Token and new password required" });
    }

    // Verifica token e lettura record
    const { data: row, error: tokenErr } = await db
        .from("password_reset_tokens")
        .select("user_id, expires_at")
        .eq("token", token)
        .single();
    if (tokenErr || !row) {
        return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Confronto a numeri (ms) per evitare problemi di fuso orario
    const nowMs = Date.now();
    const expMs = new Date(row.expires_at).getTime();
    console.log("⏱ now:", nowMs, "expires at:", expMs);
    if (nowMs > expMs) {
        return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Hash e aggiorna password
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.from("users").update({ password: hashed }).eq("id", row.user_id);

    // Elimina token usato
    await db.from("password_reset_tokens").delete().eq("token", token);

    return res.status(200).json({ message: "Password successfully updated" });
};

module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
};
