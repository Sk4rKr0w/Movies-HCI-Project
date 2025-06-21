import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token          = searchParams.get('token'); // legge ?token=

  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg]                 = useState('');
  const navigate                       = useNavigate();

  // Se non c’è token, mostro subito un messaggio
  if (!token) {
    return (
      <div className="container mx-auto max-w-md p-4">
        <p className="text-center text-red-600">Link non valido o scaduto.</p>
      </div>
    );
  }

  const handleSubmit = async e => {
    e.preventDefault();
    console.log("⏳ Sending reset:", { token, newPassword });

    try {
      const res = await axios.post('/api/auth/reset-password', {
        token,          // il controller si aspetta `token`
        newPassword,    // ed una chiave newPassword
      });
      setMsg(res.data.message);
      // Dopo 2 secondi torno al login
      setTimeout(() => navigate('/signin'), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Errore durante il reset';
      setMsg(errorMsg);
    }
  };

  return (
    <div className="container mx-auto max-w-md p-4">
      <h1 className="text-2xl mb-4 text-center">Imposta Nuova Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="Nuova password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded focus:outline-none"
        />
        <button
          type="submit"
          className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 rounded font-medium"
        >
          Aggiorna password
        </button>
      </form>
      {msg && (
        <p
          className={`mt-4 text-center ${
            msg.includes('successo') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {msg}
        </p>
      )}
    </div>
  );
}
