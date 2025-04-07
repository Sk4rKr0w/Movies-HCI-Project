const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tqauenvomazqsblbeauj.supabase.co';
const supabaseKey = '<eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYXVlbnZvbWF6cXNibGJlYXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMjc3MzUsImV4cCI6MjA1OTYwMzczNX0.6Z3oda-5NseyvF5lKC7UEbs5fxx_3_2n3XFznVzG3-A>';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
