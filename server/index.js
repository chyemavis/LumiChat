import express from "express";
import fetch from "node-fetch";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
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
app.post("/api/chat", (req, res) => {
  console.log("Incoming request body:", req.body);

  // Return a minimal hardcoded JSON response
  res.json({ reply: "Hello from the backend!" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
