const supabase = require('../supabaseClient'); // Assicurati di avere il client di Supabase configurato
//const { validateEmail } = require('../utils/validateEmail'); // Se hai bisogno di una funzione per validare l'email (opzionale)

const submitContactRequest = async (req, res) => {
  const { email, subject, message } = req.body;

  // Validazione dei dati ricevuti
  if (!email || !message) {
    return res.status(400).json({ error: 'Email e messaggio sono obbligatori.' });
  }

  // (Opzionale) Validazione dell'email
  /*if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Email non valida.' });
  }*/

  try {
    // Inserisci la richiesta nella tabella contact_requests
    const { data, error } = await supabase
      .from('contact_us')
      .insert([
        {
          email,
          message,
          subject,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    // Se c'è un errore durante l'inserimento
    if (error) {
      console.error('Errore nell\'inserimento della richiesta:', error);
      return res.status(500).json({ error: 'Errore nell\'invio della tua richiesta. Riprova più tardi.' });
    }

    // Risposta di successo
    return res.status(201).json({ message: 'Richiesta inviata con successo', data });
  } catch (err) {
    console.error('Errore nella richiesta:', err);
    return res.status(500).json({ error: 'Qualcosa è andato storto, riprova più tardi.' });
  }
};

module.exports = { submitContactRequest };
