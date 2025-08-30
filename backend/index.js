import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables and show debug info
const envResult = dotenv.config();
console.log("📄 Environment loading result:", envResult);
console.log("🔑 GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
console.log("🔑 API Key length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
console.log("🔑 First 10 chars of API Key:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + "..." : "N/A");

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

// Enhanced chat endpoint with detailed debugging
app.post("/api/chat", async (req, res) => {
  console.log("🤖 Chat request received");
  console.log("📝 Request body keys:", Object.keys(req.body));
  
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      console.error("❌ Invalid request format - messages not array");
      return res.status(400).json({ error: "Invalid request format" });
    }

    console.log("📝 Messages array length:", messages.length);
    console.log("📝 Last message:", messages[messages.length - 1]);

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY not found in environment");
      return res.status(500).json({ 
        error: "GEMINI_API_KEY not configured",
        hint: "Add GEMINI_API_KEY to your .env file"
      });
    }

    console.log("🔑 API key found, initializing Gemini...");
    
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log("✅ GoogleGenerativeAI initialized");
      
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      console.log("✅ Model created");

      const chat = model.startChat({ history: messages.slice(0, -1) });
      console.log("✅ Chat started");
      
      const userMessage = messages[messages.length - 1].content;
      console.log("💬 Sending to Gemini:", userMessage.substring(0, 100) + "...");

      const result = await chat.sendMessage(userMessage);
      console.log("✅ Gemini response received");
      
      const reply = result.response.text();
      console.log("📤 Response length:", reply.length);
      console.log("📤 Response preview:", reply.substring(0, 100) + "...");

      res.json({
        message: reply,
        processingTime: `${result.response?.usageMetadata?.totalTokenCount || 0} tokens`,
        timestamp: new Date().toISOString(),
      });
      
    } catch (geminiError) {
      console.error("❌ Gemini API Error:", geminiError);
      console.error("❌ Error message:", geminiError.message);
      console.error("❌ Error status:", geminiError.status);
      
      return res.status(500).json({ 
        error: "Gemini AI service error",
        details: geminiError.message,
        status: geminiError.status
      });
    }
    
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`🌐 Network access: http://192.168.1.1:${PORT}/api/chat`);
  
  // Show environment status
  console.log("\n📋 Environment Status:");
  console.log(`   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ Set (' + process.env.GEMINI_API_KEY.length + ' chars)' : '❌ Not set'}`);
  console.log(`   PORT: ${process.env.PORT || '3002 (default)'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
});