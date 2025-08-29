require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');


const app = express();
app.use(cors({
  origin: "http://localhost:3004", // update to your frontend port if different
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// Gemini proxy endpoint
app.post('/api/gemini', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

  console.log('Received Gemini prompt:', prompt);
  console.log('Using API key:', process.env.GEMINI_API_KEY ? '[set]' : '[missing]');

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 400,
        topP: 0.9,
        topK: 40
      }
    };
    console.log('Sending POST to Gemini API:', apiUrl);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('Gemini API response status:', response.status);
    const text = await response.text();
    console.log('Gemini API raw response:', text);
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }
    if (!response.ok) {
      console.error('Gemini API error:', data);
      return res.status(response.status).json({ error: 'Gemini API error', status: response.status, details: data });
    }
    res.json(data);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
