import { useState, view, text, input, useEffect } from "@lynx-js/react";
import Avatar from "./Avatar.jsx";
import "../styles/ChatInterface.css";

export default function GeneralChat({ user, onShowDiaryPopup }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Welcome message when user enters general chat
  useEffect(() => {
    if (user) {
      const welcomeMessage = {
        text: `Hello ${user.username}! I'm Lumi, your friendly AI assistant! What's on your mind today?`,
        user: "bot"
      };
      setMessages([welcomeMessage]);
    }
  }, [user]);

  // General AI integration
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
      
      // General assistant prompt
      const prompt = `You are LumiChat, an advanced AI assistant with specialized knowledge and helpful capabilities. You are engaging, intelligent, and provide practical solutions.

PERSONALITY: Friendly, knowledgeable, and solution-oriented. You don't just suggest "search online" - you provide actual helpful information and creative alternatives.

CAPABILITIES:
- Weather: Instead of saying "check online", provide weather-related advice, seasonal tips, outfit suggestions, or ask about their location for context
- Coding: Give specific code examples, debugging steps, and best practices
- Learning: Recommend specific resources, learning paths, and practical exercises
- Creative tasks: Brainstorm ideas, provide frameworks, and suggest approaches
- Problem-solving: Break down complex issues into actionable steps

CURRENT DATE: August 28, 2025

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

      // Call Gemini API directly with general assistant prompt
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyBY2wKZEGOJOmB8Uokt1OzVqeMaKit_RSY`, {
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
            temperature: 0.8, // Balanced creativity
            maxOutputTokens: 400, // Longer responses for detailed help
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
      console.error("General AI Error:", error);
      // General assistant fallback responses
      const fallbackResponse = generateGeneralFallbackResponse(userMessage);
      setMessages([...newMessages, { text: fallbackResponse, user: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  // General assistant fallback system
  const generateGeneralFallbackResponse = (userMessage) => {
    const message = userMessage ? userMessage.toLowerCase() : "";
    
    // Weather-specific responses
    if (message.includes("weather") || message.includes("temperature") || message.includes("rain") || message.includes("sunny")) {
      const weatherTips = [
        "I can't check real-time weather, but I can help you prepare! What's your location? I can suggest what to typically expect this time of year and recommend outfit choices.",
        "While I don't have live weather data, I can give you seasonal advice for late August! Are you planning outdoor activities? I can suggest backup plans for different weather scenarios.",
        "I can't access current weather, but I can help you stay prepared! Try weather.com or your phone's weather app for live updates. Need tips for dressing for unpredictable weather?",
        "No live weather access here, but let me help differently! What are you planning? I can suggest weather-appropriate activities or help you prepare for different conditions."
      ];
      return weatherTips[Math.floor(Math.random() * weatherTips.length)];
    }
    
    // Coding/technical responses
    if (message.includes("code") || message.includes("programming") || message.includes("debug") || message.includes("error")) {
      return "I'm experiencing connectivity issues with my main AI system, but I love helping with coding! What programming language or specific challenge are you working on? I can share some general debugging approaches and best practices.";
    }
    
    // Learning responses
    if (message.includes("learn") || message.includes("study") || message.includes("course")) {
      return "Learning is awesome! While I'm having some connectivity issues, I can still help plan your learning journey. What subject interests you? I can suggest effective study strategies and resource types to look for.";
    }
    
    // Creative responses
    if (message.includes("idea") || message.includes("creative") || message.includes("brainstorm") || message.includes("design")) {
      return "I love creative challenges! Even with my current connectivity issues, I can help brainstorm. What kind of project or creative challenge are you working on? Let's think through some approaches together!";
    }
    
    // General responses
    if (message.includes("hello") || message.includes("hi")) {
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
    
    const newMessages = [...messages, { text: trimmedInput, user: "me" }];
    setMessages(newMessages);
    setInputValue("");
    sendMessage(newMessages);
  };

  return (
    <view className="chat-container">
      {/* General chat header */}
      <view className="chat-header">
        <view className="header-avatar">
          <Avatar size="large" />
        </view>
        <text>Lumi.</text>
        <view className="header-buttons">
          <view className="header-button" bindtap={onShowDiaryPopup}>
            <text>+</text>
          </view>
        </view>
      </view>

      {/* Messages container with scroll */}
      <view className="messages-container">
        <view className="messages">
          {messages.map((msg, index) => (
            <view key={index} className={msg.user === "me" ? "message-wrapper me" : "message-wrapper bot"}>
              <view className={msg.user === "me" ? "message me" : "message bot"}>
                <text>{msg.text}</text>
              </view>
            </view>
          ))}
          {/* Loading indicator when waiting for AI response */}
          {loading && (
            <view className="message-wrapper bot">
              <view className="message bot">
                <text>🤖 Thinking...</text>
              </view>
            </view>
          )}
        </view>
      </view>

      {/* Input area fixed at bottom */}
      <view className="input-area">
        <input
          value={inputValue}
          bindinput={(res) => {
            setInputValue(res.detail.value);
          }}
          placeholder="Type a message..."
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
  );
}
