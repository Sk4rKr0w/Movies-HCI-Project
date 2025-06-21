import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  // 1) Leggi il parametro corretto:
  const token = searchParams.get('token');

  console.log("🔑 ResetPassword token:", token);

  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg]                 = useState('');
  const navigate                     = useNavigate();

  // 2) Guard:
  if (!token) return <p>Link non valido o scaduto.</p>;

  const handleSubmit = async e => {
    e.preventDefault();
    // 3) Usa le variabili corrette:
    console.log("⏳ Sending reset:", { token, newPassword });

    try {
      // Invia il campo “token” (non access_token)
      const res = await axios.post('/api/auth/reset-password', {
        token,
        newPassword
      });
      setMsg(res.data.message);
      // facoltativo: rimanda al login dopo 2s
      setTimeout(() => navigate('/signin'), 2000);
    } catch (err) {
      setMsg(err.response?.data?.error || 'Errore durante il reset');
    }
  };

  return (
    <div className="container mx-auto max-w-md p-4">
      <h1 className="text-2xl mb-4">Nuova Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="Nuova password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded"
        />
        <button
          type="submit"
          className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 rounded"
        >
          Aggiorna password
        </button>
      </form>
      {msg && <p className="mt-4 text-center">{msg}</p>}
    </div>
  );
}
