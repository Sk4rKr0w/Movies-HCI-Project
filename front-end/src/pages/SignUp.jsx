import { useState } from 'react';
import axios from 'axios';

function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/auth/register', formData);
      alert('Registrazione avvenuta con successo!');
      console.log(res.data);
    } catch (err) {
      alert('Errore nella registrazione');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Registrazione</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" onChange={handleChange} /><br />
        <input name="email" placeholder="Email" type="email" onChange={handleChange} /><br />
        <input name="password" placeholder="Password" type="password" onChange={handleChange} /><br />
        <button type="submit">Registrati</button>
      </form>
    </div>
  );
}

export default SignUp;
