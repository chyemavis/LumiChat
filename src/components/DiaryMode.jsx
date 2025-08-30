import React, { useState, useEffect, useRef } from "react";
import Avatar from "./Avatar.jsx";
import "../styles/ChatInterface.css";

export default function DiaryMode({ user, onBackToChat }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);

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

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    const scrollView = scrollViewRef.current;
    if (scrollView) {
      setTimeout(() => {
        scrollView.scrollTop = scrollView.scrollHeight;
      }, 100);
    }
  }, [messages]);

  // Diary-specific AI integration
  const sendMessage = async (newMessages) => {
    setLoading(true);
    try {
      const lastUserMessage = newMessages.filter(m => m.user === "me").pop();
      const userMessage = lastUserMessage ? lastUserMessage.text : "";

      const conversationHistory = newMessages
        .slice(-6)
        .map(msg => ({ role: msg.user === "me" ? "user" : "assistant", content: msg.text }));

      const response = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory, userMessage })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.message || data.text || "I'm here to listen and support you, even when I'm having technical difficulties.";
      setMessages([...newMessages, { text: aiResponse, user: "bot" }]);
    } catch (error) {
      console.error("Diary AI Error:", error);
      const fallbackResponse = generateDiaryFallbackResponse(newMessages[newMessages.length-1]?.text || "");
      setMessages([...newMessages, { text: fallbackResponse, user: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  // Fallback responses
  const generateDiaryFallbackResponse = (userMessage) => {
    const message = userMessage ? userMessage.toLowerCase() : "";
    if (message.includes("sad") || message.includes("depressed") || message.includes("down")) {
      return "I'm here to listen and support you through these difficult feelings. It's okay to feel sad sometimes - your emotions are valid. Would you like to talk more about what's contributing to these feelings?";
    }
    if (message.includes("happy") || message.includes("good") || message.includes("great")) {
      return "It's wonderful to hear that you're feeling positive! What's bringing you joy today?";
    }
    if (message.includes("anxious") || message.includes("worried") || message.includes("stress")) {
      return "Anxiety can feel overwhelming, but you're not alone. Would you like to share what's on your mind?";
    }
    if (message.includes("angry") || message.includes("frustrated") || message.includes("mad")) {
      return "It sounds like you're experiencing some intense emotions. What's been triggering these feelings for you?";
    }
    if (message.includes("confused") || message.includes("lost") || message.includes("overwhelmed")) {
      return "Feeling overwhelmed is completely understandable. Take a deep breath—I'm here to listen.";
    }
    return "I'm here to listen and support you. How are you feeling right now?";
  };

  const handleSend = () => {
    const trimmedInput = inputValue ? inputValue.trim() : "";
    if (!trimmedInput || loading) return;
    const newMessages = [...messages, { text: trimmedInput, user: "me" }];
    setMessages(newMessages);
    setInputValue("");
    sendMessage(newMessages);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-avatar"><Avatar size="large" /></div>
        <span>Mood Diary</span>
        <div className="header-buttons">
          <button className="header-button" onClick={onBackToChat}>
            ←
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        <div
          ref={scrollViewRef}
          style={{ flex: 1, width: "100%", overflowY: "auto" }}
          className="messages"
        >
          {messages.map((msg, index) => (
            <div key={index} className={msg.user === "me" ? "message-wrapper me" : "message-wrapper bot"}>
              <div className={msg.user === "me" ? "message me" : "message bot"}>
                <span>{msg.text}</span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message-wrapper bot">
              <div className="message bot"><span>🤖 Thinking...</span></div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="input-area">
        <input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Share your thoughts and feelings..."
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          disabled={loading}
        />
        <button
          className="send-button"
          onClick={handleSend}
          style={loading ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}