import express from "express";
import fetch from "node-fetch";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cors from "cors"; // <-- ADDED: Import cors

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Correctly retrieve Gemini API key

// Middleware
app.use(express.json());
app.use(cors()); // <-- ADDED: Enable CORS for all routes

// Middleware to log all incoming requests and responses
app.use((req, res, next) => {
  console.log("Incoming Request:", {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
  });

  const originalSend = res.send;
  res.send = function (body) {
    console.log("Outgoing Response:", body);
    originalSend.call(this, body);
  };

  next();
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each user to 10 requests per minute
  message: "Too many requests, please try again later.",
});
app.use("/api", limiter);

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running." });
});

// Chat Endpoint using Gemini API
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const chatHistory = req.body.chatHistory || []; // Get chat history from frontend

    if (!userMessage) {
      return res.status(400).json({ reply: "No message provided." }); // Consistent reply format
    }

    if (!GEMINI_API_KEY) {
      console.error("Gemini API key is not set in environment variables.");
      return res.status(500).json({ reply: "Gemini API key not configured on the server." }); // Consistent reply format
    }

    // Format chat history for Gemini API
    const geminiContents = chatHistory.map(m => ({
      role: m.role, // Assuming frontend passes 'user' or 'assistant'
      parts: [{ text: m.content }]
    }));

    // Add the current user message
    geminiContents.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`; // Using gemini-2.5-flash-preview-05-20 as a robust option, can be gemini-pro if preferred.

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: geminiContents // Send full chat history for context
      }),
    });

    if (!geminiRes.ok) {
      const errorData = await geminiRes.json(); // Try to parse error as JSON
      console.error("Gemini API error:", errorData);
      return res.status(geminiRes.status).json({
        reply: errorData.error?.message || "Failed to get response from Gemini API.", // Extract Gemini's error message
      }); // Consistent reply format
    }

    const geminiData = await geminiRes.json();
    const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply from Gemini.";

    res.json({ reply });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ reply: "Internal server error." }); // Consistent reply format
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});