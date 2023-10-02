require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json()); // This allows you to parse JSON payloads

app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

// Example endpoint to fetch all facts
app.get('/api/facts', async (req, res) => {
    const { data, error } = await supabase.from('facts').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Example endpoint to insert a new fact
app.post('/api/facts', async (req, res) => {
    const { text, source, category } = req.body;
    const { data, error } = await supabase.from('facts').insert([{ text, source, category }]);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
