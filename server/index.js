import express from "express";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cors from "cors";
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

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

// Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    console.log("Incoming request body:", req.body);
    
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Generate response using AI SDK
    const { text } = await generateText({
      model: openai('gpt-3.5-turbo'),
      prompt: message,
    });

    res.json({ reply: text });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
