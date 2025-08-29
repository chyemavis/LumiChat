import { useState, view, text, input, useEffect, useRef } from "@lynx-js/react";
import Avatar from "./Avatar.jsx";
import DiaryMode from "./DiaryMode.jsx";
import "../styles/ChatInterface.css";

export default function ChatInterface({ user }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDiaryPopup, setShowDiaryPopup] = useState(false);
  const [isDiaryMode, setIsDiaryMode] = useState(false);
  const [connectionError, setConnectionError] = useState(false); // Start with no connection error
  
  // Refs for cleanup
  const abortControllerRef = useRef(null);
  const scrollViewRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // If in diary mode, render DiaryMode component
  if (isDiaryMode) {
    return (
      <DiaryMode 
        user={user} 
        onBackToChat={() => setIsDiaryMode(false)} 
      />
    );
  }

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

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    const scrollView = scrollViewRef.current;
    if (scrollView && scrollView.scrollTo) {
      setTimeout(() => {
        const scrollHeight = Array.from(scrollView.children).reduce(
          (height, child) => height + child.offsetHeight, 0
        );
        scrollView.scrollTo(0, scrollHeight);
      }, 100);
    }
  }, [messages]);

  // Enhanced sendMessage with better error handling and timeout
  const sendMessage = async (newMessages) => {
    console.log("🚀 sendMessage called with:", newMessages.length, "messages");
    setLoading(true);
    setConnectionError(false);
    
    // Test backend connectivity first
    try {
      console.log("🧪 Testing backend health...");
      const healthResponse = await fetch('http://localhost:3002/health');
      console.log("🧪 Health check result:", healthResponse.status, healthResponse.ok);
      
      if (!healthResponse.ok) {
        throw new Error(`Backend health check failed: ${healthResponse.status}`);
      }
    } catch (healthError) {
      console.error("❌ Backend health check failed:", healthError);
      setLoading(false);
      setConnectionError(true);
      return;
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      // Get the last user message
      const lastUserMessage = newMessages.filter(m => m.user === "me").pop();
      const userMessage = lastUserMessage ? lastUserMessage.text : "";
      
      if (!userMessage.trim()) {
        throw new Error("Empty message");
      }
     
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

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 seconds
      });

      // Call our secure backend endpoint
      const fetchPromise = fetch('http://localhost:3002/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: prompt
          }]
        }),
        signal: abortControllerRef.current.signal
      });

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return; // Exit silently if aborted
      }

      // Handle different response statuses
      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        
        switch (response.status) {
          case 400:
            errorMessage = "Invalid request format";
            break;
          case 401:
            errorMessage = "Authentication required";
            break;
          case 403:
            errorMessage = "Access denied";
            break;
          case 429:
            errorMessage = "Too many requests - please slow down";
            break;
          case 499:
            errorMessage = "Connection interrupted - please try again";
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = "Server temporarily unavailable";
            setConnectionError(true);
            break;
          default:
            errorMessage = "Network error occurred";
        }
        
        throw new Error(errorMessage);
      }

      // Parse response
      let data;
      try {
        data = await response.json();
        console.log("Backend response:", data);
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        throw new Error("Invalid response from server");
      }

      const aiResponse = data.message || data.text || "I apologize, but I'm having trouble generating a response right now.";
      console.log("🤖 AI response received:", aiResponse);
      console.log("� Current messages before adding:", newMessages.length);
      
      // Validate response
      if (typeof aiResponse !== 'string' || !aiResponse.trim()) {
        console.log("❌ Invalid AI response - empty or not string");
        throw new Error("Empty response from server");
      }
     
      const updatedMessages = [...newMessages, { text: aiResponse.trim(), user: "bot" }];
      console.log("🔢 Messages after adding bot response:", updatedMessages.length);
      console.log("🔄 Setting messages to:", updatedMessages);
      
      setMessages(updatedMessages);
      setConnectionError(false); // Reset connection error on success
      
    } catch (error) {
      console.error("AI Error:", error);
      
      // Handle aborted requests
      if (error.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
        return; // Don't show error for cancelled requests
      }
      
      let fallbackResponse;
      
      if (error.message.includes('timeout') || error.message.includes('499')) {
        // Connection/timeout issues - use smart fallback
        setConnectionError(true);
        fallbackResponse = generateSmartResponse(lastUserMessage?.text || '');
      } else if (error.message.includes('429') || error.message.includes('Too many requests')) {
        // Rate limiting - inform user
        fallbackResponse = "I'm receiving too many requests right now. Please wait a moment before sending another message.";
      } else if (error.message.includes('server') || error.message.includes('Server')) {
        // Server errors - use fallback
        setConnectionError(true);
        fallbackResponse = generateSmartResponse(lastUserMessage?.text || '');
      } else {
        // Other errors - generic fallback
        fallbackResponse = generateSmartResponse(lastUserMessage?.text || '');
      }
      
      setMessages([...newMessages, { text: fallbackResponse, user: "bot" }]);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Cancel current request
  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  };

  // Smart response system with contextual length and tone
  const generateSmartResponse = (userMessage = '') => {
    const message = userMessage.toLowerCase();
    
    // Connection error context
    const connectionPrefix = connectionError ? 
      "I'm having trouble connecting to my main systems right now, but I'm still here to help! " : 
      "I'm running on backup systems, but I can still assist you! ";
    
    // Simple greetings - short and friendly
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      const greetings = [
        "Hi there! How can I help you today?",
        "Hello! What's on your mind?",
        "Hey! How are you doing?",
        "Hi! What would you like to chat about?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Emotional/mental health content - longer and empathetic
    if (message.includes('sad') || message.includes('depressed') || message.includes('anxious') || 
        message.includes('stressed') || message.includes('worried') || message.includes('scared') ||
        message.includes('lonely') || message.includes('upset') || message.includes('crying') ||
        message.includes('hurt') || message.includes('pain') || message.includes('struggling')) {
      return connectionPrefix + "I can hear that you're going through something difficult right now. Your feelings are completely valid, and I want you to know that you're not alone. Would you like to talk about what's been weighing on your mind? Sometimes expressing these feelings can provide relief.";
    }
    
    // Relationship/personal issues - medium length, supportive
    if (message.includes('relationship') || message.includes('boyfriend') || message.includes('girlfriend') ||
        message.includes('family') || message.includes('friend') || message.includes('conflict') ||
        message.includes('argument') || message.includes('breakup') || message.includes('divorce')) {
      return connectionPrefix + "Relationships can be really complex and challenging. I'd like to help you think through this situation. What aspect of this is weighing on you most? Sometimes talking it out can help clarify your feelings.";
    }
    
    // Health concerns - caring and supportive
    if (message.includes('sick') || message.includes('pain') || message.includes('doctor') ||
        message.includes('health') || message.includes('medication') || message.includes('hospital')) {
      return connectionPrefix + "I'm concerned about what you're going through with your health. While I can't provide medical advice, I want you to know I care about your wellbeing. Have you been able to speak with a healthcare professional about this?";
    }
    
    // Work/school stress - understanding and practical
    if (message.includes('work') || message.includes('job') || message.includes('school') ||
        message.includes('exam') || message.includes('deadline') || message.includes('boss') ||
        message.includes('homework') || message.includes('project')) {
      return connectionPrefix + "Work and school pressures can feel overwhelming sometimes. I'd like to help you think through this. What's been the most challenging part? Sometimes breaking things down into smaller steps can make them feel more manageable.";
    }
    
    // Simple how are you - short and caring
    if (message.includes('how are you')) {
      return "I'm doing well, thank you for asking! How are you feeling today?";
    }
    
    // Questions about capabilities - brief and helpful
    if (message.includes('what can you do') || message.includes('capabilities')) {
      return connectionPrefix + "I can chat, answer questions, help with problems, and provide support. What would be most helpful for you right now?";
    }
    
    // Weather questions - short and practical
    if (message.includes('weather')) {
      return "I can't check live weather, but I can help you plan for different conditions! What's your location and what are you planning?";
    }
    
    // Creative/brainstorming - medium length, enthusiastic
    if (message.includes('idea') || message.includes('creative') || message.includes('brainstorm')) {
      return connectionPrefix + "I love creative projects! What kind of creative challenge are you working on? Let's explore some possibilities together!";
    }
    
    // Learning/study help - encouraging and practical
    if (message.includes('learn') || message.includes('study') || message.includes('explain')) {
      return connectionPrefix + "Learning new things is exciting! What subject are you diving into? I can help break things down step by step.";
    }
    
    // Technical/coding - direct and helpful
    if (message.includes('code') || message.includes('programming') || message.includes('bug')) {
      return connectionPrefix + "I enjoy helping with coding challenges! What programming language or technical issue are you working with? I can suggest debugging steps or best practices.";
    }
    
    // General questions - medium length, engaging
    return connectionPrefix + "Could you tell me more about what you're thinking about? I'd love to explore this with you and see how I can help!";
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
      {/* Connection status indicator */}
      {connectionError && (
        <view className="connection-status error" bindtap={() => setConnectionError(false)} style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          padding: '8px 12px',
          margin: '10px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          <text>⚠️ Connection issues - using offline responses (tap to dismiss)</text>
        </view>
      )}

      {/* Mood Diary Popup */}
      {showDiaryPopup && (
        <view className="popup-overlay" bindtap={() => setShowDiaryPopup(false)}>
          <view className="popup-content" bindtap={(e) => e && e.stopPropagation && e.stopPropagation()}>
            <text className="popup-title">Switch to Mood Diary Mode?</text>
            <text className="popup-message">
              Mood Diary mode creates a safe space for you to express your feelings and track your emotional well-being. Would you like to continue?
            </text>
            <view className="popup-buttons">
              <view className="popup-button cancel" bindtap={() => setShowDiaryPopup(false)}>
                <text>Cancel</text>
              </view>
              <view className="popup-button confirm" bindtap={() => {
                setIsDiaryMode(true);
                setShowDiaryPopup(false);
                setMessages([]);
              }}>
                <text>Yes, Continue</text>
              </view>
            </view>
          </view>
        </view>
      )}

      {/* General chat header */}
      <view className="chat-header">
        <view className="header-avatar">
          <Avatar size="large" />
        </view>
        <text>Lumi.</text>
        <view className="header-buttons">
          <view className="header-button" bindtap={() => setShowDiaryPopup(true)}>
            <text>+</text>
          </view>
        </view>
      </view>

      {/* Messages container with scroll-view */}
      <view className="messages-container">
        <scroll-view
          ref={scrollViewRef}
          scroll-orientation="vertical"
          scroll-y={true}
          style={{ flex: 1, width: "100%" }}
          className="messages"
        >
          {messages.map((msg, index) => (
            <view key={index} className={msg.user === "me" ? "message-wrapper me" : "message-wrapper bot"}>
              <view className={msg.user === "me" ? "message me" : "message bot"}>
                <text>{msg.text}</text>
              </view>
            </view>
          ))}
          
          {/* Loading indicator with cancel option */}
          {loading && (
            <view className="message-wrapper bot">
              <view className="message bot">
                <text>🤖 Thinking...</text>
                <view className="cancel-request" bindtap={cancelRequest}>
                  <text>Cancel</text>
                </view>
              </view>
            </view>
          )}
        </scroll-view>
      </view>

      {/* Input area fixed at bottom */}
      <view className="input-area">
        <input
          value={inputValue}
          bindinput={(e) => {
            const newValue = e.detail?.value || e.target?.value || "";
            setInputValue(newValue);
          }}
          placeholder="Type your message..."
          disabled={loading}
        />
        <view
          className="send-button"
          bindtap={handleSend}
          style={loading || !inputValue.trim() ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          <text>{loading ? "..." : "Send"}</text>
        </view>
      </view>
    </view>
  );
}