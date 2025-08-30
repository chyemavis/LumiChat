import { useState, view, text, input, useEffect } from "@lynx-js/react";
import Avatar from "./Avatar.jsx";
import "../styles/ChatInterface.css";

export default function DiaryMode({ user, onBackToChat }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Welcome message when user enters diary mode
  useEffect(() => {
    if (user) {
      const welcomeMessage = {
        text: `Hello ${user.username}! Welcome to your mood diary space. I'm here to listen and support you as you express your thoughts and feelings. What's on your heart today?`,
        user: "bot"
      };
      setMessages([welcomeMessage]);
    }
  }, [user]);

  // Diary-specific AI integration
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
      
      // Diary mode specific prompt
      const prompt = `You are LumiChat in Mood Diary mode, acting as a compassionate and understanding companion for emotional support and mood tracking.

DIARY MODE PERSONALITY: Warm, empathetic, non-judgmental, and supportive. You create a safe space for users to express their feelings and thoughts.

MOOD DIARY CAPABILITIES:
- Emotional support: Validate feelings and provide gentle guidance
- Mood tracking: Help users identify and name their emotions
- Reflection prompts: Ask thoughtful questions to encourage self-reflection
- Coping strategies: Suggest healthy ways to process emotions
- Mindfulness: Offer simple grounding techniques when needed
- Progress recognition: Acknowledge growth and positive changes

CURRENT DATE: August 28, 2025

CONVERSATION CONTEXT:
${conversationHistory}

USER'S LATEST MESSAGE: "${userMessage}"

DIARY MODE INSTRUCTIONS:
- Listen actively and validate their feelings
- Ask gentle follow-up questions to encourage deeper reflection
- Suggest journaling prompts or coping strategies when appropriate
- Keep responses supportive and non-clinical (2-4 sentences)
- Create a judgment-free space for emotional expression

Respond as a caring mood diary companion:`;

      // Call Gemini API directly with diary-specific prompt
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAMHBHXP7GWfkXZ3rUYJVk-SD2HIoQrm3k`, {
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
            temperature: 0.9, // Higher creativity for emotional responses
            maxOutputTokens: 350, // Moderate length responses
            topP: 0.95,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text || "I'm here to listen and support you, even when I'm having technical difficulties.";
      
      setMessages([...newMessages, { text: aiResponse, user: "bot" }]);
    } catch (error) {
      console.error("Diary AI Error:", error);
      // Diary-specific fallback responses
      const fallbackResponse = generateDiaryFallbackResponse(userMessage);
      setMessages([...newMessages, { text: fallbackResponse, user: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  // Diary-specific fallback system
  const generateDiaryFallbackResponse = (userMessage) => {
    const message = userMessage ? userMessage.toLowerCase() : "";
    
    if (message.includes("sad") || message.includes("depressed") || message.includes("down")) {
      return "I'm here to listen and support you through these difficult feelings. It's okay to feel sad sometimes - your emotions are valid. Would you like to talk more about what's contributing to these feelings?";
    }
    
    if (message.includes("happy") || message.includes("good") || message.includes("great")) {
      return "It's wonderful to hear that you're feeling positive! Celebrating these good moments is so important. What's bringing you joy today?";
    }
    
    if (message.includes("anxious") || message.includes("worried") || message.includes("stress")) {
      return "Anxiety can feel overwhelming, but you're not alone. Taking a moment to acknowledge these feelings is already a brave step. Would you like to share what's on your mind?";
    }
    
    if (message.includes("angry") || message.includes("frustrated") || message.includes("mad")) {
      return "It sounds like you're experiencing some intense emotions. Anger is a valid feeling, and it's okay to feel this way. What's been triggering these feelings for you?";
    }
    
    if (message.includes("confused") || message.includes("lost") || message.includes("overwhelmed")) {
      return "Feeling overwhelmed or confused is completely understandable. Sometimes life can feel like a lot to handle. Take a deep breath - I'm here to listen and help you sort through these feelings.";
    }
    
    return "I'm here to listen and support you in this safe space. While I'm having some connectivity issues, please know that your feelings matter and I'm here for you. How are you feeling right now?";
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
      {/* Diary mode header */}
      <view className="chat-header">
        <view className="header-avatar">
          <Avatar size="large" />
        </view>
        <text>Mood Diary</text>
        <view className="header-buttons">
          <view className="header-button" bindtap={onBackToChat}>
            <text>←</text>
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
          placeholder="Share your thoughts and feelings..."
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
