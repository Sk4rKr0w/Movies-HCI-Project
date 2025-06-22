const supabase = require("../supabaseClient"); // Assicurati di avere il client di Supabase configurato
//const { validateEmail } = require('../utils/validateEmail'); // Se hai bisogno di una funzione per validare l'email (opzionale)

const submitContactRequest = async (req, res) => {
    const { email, subject, message } = req.body;

    // Validazione dei dati ricevuti
    if (!email || !message) {
        return res.status(400).json({ error: "Email and message required." });
    }

    // (Opzionale) Validazione dell'email
    /*if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Email non valida.' });
  }*/

    try {
        // Inserisci la richiesta nella tabella contact_requests
        const { data, error } = await supabase
            .from("contact_us")
            .insert([
                {
                    email,
                    message,
                    subject,
                    created_at: new Date().toISOString(),
                },
            ])
            .select();

        // Se c'è un errore durante l'inserimento
        if (error) {
            console.error("Error during request insertion:", error);
            return res.status(500).json({
                error: "Error sending your request. Please try again later.",
            });
        }

        // Risposta di successo
        return res
            .status(201)
            .json({ message: "Request sent successfully", data });
    } catch (err) {
        console.error("Request error:", err);
        return res
            .status(500)
            .json({ error: "Something went wrong, retry later." });
    }
};

module.exports = { submitContactRequest };
