import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is working!', port: process.env.PORT });
});

// Initialize Gemini API with key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create a chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    console.log('Received chat request:', req.body);
    const { messages } = req.body;
    
    if (!messages || !messages.length) {
      console.error('No messages received in request');
      return res.status(400).json({ error: 'No messages provided' });
    }

    console.log('Initializing Gemini model...');
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 400,
        topP: 0.9,
        topK: 40
      }
    });
    
    console.log('Starting chat session...');
    const chat = model.startChat();
    
    const messageContent = messages[messages.length - 1].content;
    console.log('Sending message to Gemini:', messageContent);
    
    const result = await chat.sendMessage(messageContent);
    const response = await result.response;
    const responseText = response.text();
    console.log('Received response from Gemini:', responseText);
    
    res.json({ 
      message: responseText
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack
    });
  }
});

const PORT = process.env.PORT || 3001;  // Changed from 3002 to 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
