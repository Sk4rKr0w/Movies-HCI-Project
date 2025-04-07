import { useState } from 'react';
import axios from 'axios';

function ContactUs() {
  // Stato per raccogliere i dati del form
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: ''
  });

  // Stato per gestire eventuali errori o successo
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Gestore per l'aggiornamento dei campi del form
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Gestore per la submission del form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verifica se tutti i campi sono stati compilati
    if (!formData.email || !formData.message) {
      setError('Email e messaggio sono obbligatori.');
      return;
    }

    try {
      // Effettua la richiesta POST al backend
      const response = await axios.post('http://localhost:3001/api/contact/contact', formData);

      // Gestisci la risposta del server
      if (response.data) {
        setSuccess('La tua richiesta è stata inviata con successo.');
        setFormData({ email: '', subject: '', message: '' }); // Reset del form
        setError('');
      }
    } catch (err) {
      console.error('Errore nella richiesta:', err);
      setError('C\'è stato un errore nell\'invio della tua richiesta. Riprova più tardi.');
      setSuccess('');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Contattaci</h2>

      {/* Messaggio di errore */}
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {/* Messaggio di successo */}
      {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Campo email */}
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Inserisci la tua email"
            required
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>

        {/* Campo oggetto */}
        <div>
          <label htmlFor="subject">Oggetto:</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Oggetto del messaggio"
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>

        {/* Campo messaggio */}
        <div>
          <label htmlFor="message">Messaggio:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Scrivi il tuo messaggio"
            required
            style={{ width: '100%', padding: '8px', marginBottom: '10px', height: '150px' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>
          Invia
        </button>
      </form>
    </div>
  );
}

export default ContactUs;
