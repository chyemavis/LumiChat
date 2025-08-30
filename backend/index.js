import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Gemini API Configuration
const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const systemInstruction = [{
    text: `You are Lumi, a kind, supportive, and empathetic mental wellness companion. Your role is to listen, encourage, and provide thoughtful responses that help the user feel understood. Always respond in a calm, gentle, and reassuring tone. Ask reflective or open-ended questions that help users explore their thoughts. Provide practical coping strategies (e.g., mindfulness, breathing exercises, journaling, gratitude prompts). Avoid giving medical diagnoses or prescriptions. If a user mentions serious distress or crisis (e.g., wanting to hurt themselves), gently encourage them to reach out to a trusted person or seek professional help. Keep responses short, simple, and easy to read. Use encouraging language like: “I hear you,” “That sounds tough,” or “It’s okay to feel that way.”`,
}];

// Enhanced health check
app.get("/health", (req, res) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    apiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
    port: PORT,
    nodeEnv: process.env.NODE_ENV || 'not set'
  };
  console.log("🏥 Health check response:", health);
  res.json(health);
});

app.post('/api/chat', async (req, res) => {
    console.log("🤖 Chat request received");
    try {
        // Correctly read the 'messages' property from the request body
        const { messages } = req.body;
        
        if (!messages) {
            return res.status(400).json({ error: "Request body must contain a 'messages' property." });
        }

        const payload = {
            contents: messages, // Use the 'messages' array as the contents
            systemInstruction: {
                parts: systemInstruction
            }
        };

        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            return res.status(response.status).json({ error: errorData.error.message });
        }

        const result = await response.json();
        
        if (!result.candidates || !result.candidates[0].content || !result.candidates[0].content.parts[0].text) {
            console.error('Invalid API response structure:', result);
            return res.status(500).json({ error: "Invalid response structure from AI service." });
        }

        const botResponse = result.candidates[0].content.parts[0].text;
        
        res.json({ message: botResponse });

    } catch (error) {
        console.error('An error occurred on the server:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`🌐 Network access: http://192.168.1.1:${PORT}/api/chat`);
});