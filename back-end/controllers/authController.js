const supabase = require('../supabaseClient');

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const { data, error } = await supabase
    .from('users')
    .insert([{ username, email, password }]);

  if (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({ error: 'Registration failed' });
  }

  return res.status(201).json({ message: 'User registered', user: data[0] });
};

module.exports = { registerUser };
