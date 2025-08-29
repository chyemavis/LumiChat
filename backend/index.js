import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
  origin: true,  // Allow all origins for local development
  credentials: true
}));
app.use(bodyParser.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} from ${req.headers.origin || 'unknown'}`);
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request format" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({ history: messages });
    const userMessage = messages[messages.length - 1].content;

    const result = await chat.sendMessage(userMessage);
    const reply = result.response.text();

    res.json({
      message: reply,
      processingTime: `${result.response?.usageMetadata?.totalTokenCount || 0} tokens`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`🌐 Network access: http://192.168.1.1:${PORT}/api/chat`);
});
