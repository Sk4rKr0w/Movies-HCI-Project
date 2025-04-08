const supabase = require('../supabaseClient');
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // 🔒 Hashing della password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Inserisci l'utente con password criptata
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, email, password: hashedPassword }])
      .select();

    if (error) {
      console.error('Registration error:', error.message);
      return res.status(500).json({ error: 'Registration failed' });
    }

    return res.status(201).json({ message: 'User registered', user: data[0] });
  } catch (err) {
    console.error('Unexpected error:', err.message);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Both email and password are required' });
  }

  try {
    // Cerca l'utente per email
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Unregistered Email' });
    }

    const user = data;

    // Compara la password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    //Login riuscito
    return res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { registerUser, loginUser };
