import { useState } from 'react';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setMsg('Email inviata: segui il link per creare una nuova password.');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Errore');
    }
  };

  return (
    <div className="container">
      <h1>Recupera password</h1>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit">Invia email</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}
