import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('access_token');

  console.log("🔑 ResetPassword token:", token);
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/reset-password', { access_token: token, newPassword });
      setMsg('Password aggiornata! Ora puoi effettuare il login.');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Errore');
    }
  };

  //if (!token) return <p>Link non valido o scaduto.</p>;

  return (
    <div className="container">
      <h1>Nuova Password</h1>
      <form onSubmit={handleSubmit}>
        <label>Nuova password</label>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />
        <button type="submit">Aggiorna password</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}
