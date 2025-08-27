import { useState, view, text, input } from "@lynx-js/react";
import "./App.css";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  // Enhanced AI integration with better context and capabilities
  const sendMessage = async (newMessages) => {
    setLoading(true);
    try {
      // Get the last user message
      const lastUserMessage = newMessages.filter(m => m.user === "me").pop();
      const userMessage = lastUserMessage ? lastUserMessage.text : "";
      
      // Build conversation context for AI
      const conversationHistory = newMessages
        .slice(-6) // Last 6 messages for context
        .map(msg => `${msg.user === "me" ? "User" : "Assistant"}: ${msg.text}`)
        .join('\n');
      
      // Enhanced prompt with better instructions and capabilities
      const prompt = `You are LumiChat, an advanced AI assistant with specialized knowledge and helpful capabilities. You are engaging, intelligent, and provide practical solutions.

PERSONALITY: Friendly, knowledgeable, and solution-oriented. You don't just suggest "search online" - you provide actual helpful information and creative alternatives.

CAPABILITIES:
- Weather: Instead of saying "check online", provide weather-related advice, seasonal tips, outfit suggestions, or ask about their location for context
- Coding: Give specific code examples, debugging steps, and best practices
- Learning: Recommend specific resources, learning paths, and practical exercises
- Creative tasks: Brainstorm ideas, provide frameworks, and suggest approaches
- Problem-solving: Break down complex issues into actionable steps

CURRENT DATE: August 27, 2025

CONVERSATION CONTEXT:
${conversationHistory}

USER'S LATEST MESSAGE: "${userMessage}"

INSTRUCTIONS:
- Be specific and actionable rather than generic
- If you can't access real-time data, provide relevant knowledge, tips, or alternatives
- Ask follow-up questions to better understand their needs
- Give examples and practical suggestions
- Keep responses conversational but informative (2-4 sentences)
- Show personality and engagement

Respond helpfully and intelligently:`;

      // Call Gemini API directly with enhanced prompt
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyCOR9KRPh7d_jws42YFGbY7PQD9535kbWE`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8, // Higher creativity
            maxOutputTokens: 400, // Longer responses
            topP: 0.9,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text || "I apologize, but I'm having trouble generating a response right now.";
      
      setMessages([...newMessages, { text: aiResponse, user: "bot" }]);
    } catch (error) {
      console.error("AI Error:", error);
      // Enhanced fallback responses
      const fallbackResponse = generateEnhancedFallbackResponse(newMessages);
      setMessages([...newMessages, { text: fallbackResponse, user: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced fallback system with smarter responses
  const generateEnhancedFallbackResponse = (messages) => {
    const lastUserMessage = messages.filter(m => m.user === "me").pop();
    const userMessage = lastUserMessage ? lastUserMessage.text.toLowerCase() : "";
    
    // Weather-specific responses
    if (userMessage.includes("weather") || userMessage.includes("temperature") || userMessage.includes("rain") || userMessage.includes("sunny")) {
      const weatherTips = [
        "I can't check real-time weather, but I can help you prepare! What's your location? I can suggest what to typically expect this time of year and recommend outfit choices.",
        "While I don't have live weather data, I can give you seasonal advice for late August! Are you planning outdoor activities? I can suggest backup plans for different weather scenarios.",
        "I can't access current weather, but I can help you stay prepared! Try weather.com or your phone's weather app for live updates. Need tips for dressing for unpredictable weather?",
        "No live weather access here, but let me help differently! What are you planning? I can suggest weather-appropriate activities or help you prepare for different conditions."
      ];
      return weatherTips[Math.floor(Math.random() * weatherTips.length)];
    }
    
    // Coding/technical responses
    if (userMessage.includes("code") || userMessage.includes("programming") || userMessage.includes("debug") || userMessage.includes("error")) {
      return "I'm experiencing connectivity issues with my main AI system, but I love helping with coding! What programming language or specific challenge are you working on? I can share some general debugging approaches and best practices.";
    }
    
    // Learning responses
    if (userMessage.includes("learn") || userMessage.includes("study") || userMessage.includes("course")) {
      return "Learning is awesome! While I'm having some connectivity issues, I can still help plan your learning journey. What subject interests you? I can suggest effective study strategies and resource types to look for.";
    }
    
    // Creative responses
    if (userMessage.includes("idea") || userMessage.includes("creative") || userMessage.includes("brainstorm") || userMessage.includes("design")) {
      return "I love creative challenges! Even with my current connectivity issues, I can help brainstorm. What kind of project or creative challenge are you working on? Let's think through some approaches together!";
    }
    
    // General responses
    if (userMessage.includes("hello") || userMessage.includes("hi")) {
      return "Hello! I'm LumiChat, your AI assistant. I'm currently experiencing some connectivity issues with my advanced features, but I'm still here to help however I can! What's on your mind?";
    }
    
    // Default enhanced response
    return "That's interesting! I'm having some connectivity issues with my main AI system right now, but I'd still love to help. Could you tell me more about what you're trying to accomplish? Maybe I can offer some guidance or alternative approaches!";
  };

  // Handler for when the user taps the send button
  const handleSend = () => {
    const trimmedInput = inputValue ? inputValue.trim() : "";
    if (!trimmedInput || loading) {
      return;
    }
    
    // Handle the message first
    const newMessages = [...messages, { text: trimmedInput, user: "me" }];
    setMessages(newMessages);
    
    // Clear input with a small deqlay to ensure proper rendering
    setTimeout(() => {
      setInputValue("");
    }, 10);
    
    sendMessage(newMessages);
  };

  return (
    <view className="App">
      <view className="chat-container">
        {/* Chat header */}
        <view className="chat-header">
          <text>LumiChat AI Assistant</text>
        </view>

        {/* Messages container with scroll */}
        <view className="messages-container">
          <view className="messages">
            {messages.map((msg, index) => (
              <text
                key={index}
                className={msg.user === "me" ? "message me" : "message bot"}
              >
                {msg.text}
              </text>
            ))}
            {/* Loading indicator when waiting for AI response */}
            {loading && (
              <text className="message bot">
                <text>🤖 Thinking...</text>
              </text>
            )}
          </view>
        </view>

        {/* Input area fixed at bottom */}
        <view className="input-area">
          <input
            value={inputValue}
            bindinput={(e) => {
              const newValue = e.detail?.value || e.target?.value || "";
              setInputValue(newValue);
            }}
            placeholder="Ask me anything..."
          />
          <view
            className="send-button"
            bindtap={() => {
              handleSend();
            }}
            style={loading ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <text>{loading ? "..." : "Send"}</text>
          </view>
        </view>
      </view>
    </view>
  );
}