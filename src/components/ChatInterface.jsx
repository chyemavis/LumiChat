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
  const [connectionError, setConnectionError] = useState(false);
  
  // Replace with your actual Railway URL
  const BACKEND_URL = 'http://localhost:3002';
  
  // Debug state
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebug, setShowDebug] = useState(false); // Set to true for debugging
  
  const abortControllerRef = useRef(null);
  const scrollViewRef = useRef(null);

  const addDebugLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { id: Date.now(), timestamp, message, type };
    setDebugLogs(prev => [...prev.slice(-9), logEntry]);
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (isDiaryMode) {
    return (
      <DiaryMode 
        user={user} 
        onBackToChat={() => setIsDiaryMode(false)} 
      />
    );
  }

  useEffect(() => {
    if (user) {
      const welcomeMessage = {
        text: `Hello ${user.username}! I'm Lumi, your friendly AI assistant! What's on your mind today?`,
        user: "bot"
      };
      setMessages([welcomeMessage]);
      addDebugLog(`Welcome message set for user: ${user.username}`, "info");
    }
  }, [user]);

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

  const sendMessage = async (newMessages) => {
    addDebugLog(`Sending message to Railway backend`, "info");
    setLoading(true);
    setConnectionError(false);
    
    abortControllerRef.current = new AbortController();
    
    const lastUserMessage = newMessages.filter(m => m.user === "me").pop();
    const userMessage = lastUserMessage ? lastUserMessage.text : "";
    
    addDebugLog(`User message: "${userMessage.substring(0, 50)}..."`, "info");
    
    try {
      if (!userMessage.trim()) {
        throw new Error("Empty message");
      }
      
      const formattedMessages = newMessages.map(msg => ({
        role: msg.user === 'me' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const requestBody = {
        // Send the entire formatted history
        messages: formattedMessages
      };

      addDebugLog(`Sending to: ${BACKEND_URL}/api/chat`, "info");

      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal
      });
      
      addDebugLog(`Response status: ${response.status}`, response.ok ? "success" : "error");
      
      if (!response.ok) {
        const errorText = await response.text();
        addDebugLog(`Error response: ${errorText}`, "error");
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const aiResponse = data.message || data.text || "No response received";
      
      addDebugLog(`AI response: "${aiResponse.substring(0, 50)}..."`, "success");
      
      const updatedMessages = [...newMessages, { text: aiResponse.trim(), user: "bot" }];
      setMessages(updatedMessages);
      setConnectionError(false);
      
    } catch (error) {
      addDebugLog(`Error: ${error.message}`, "error");
      
      if (error.name === 'AbortError') {
        return;
      }
      
      const fallbackResponse = generateSmartResponse(userMessage);
      setMessages([...newMessages, { text: fallbackResponse, user: "bot" }]);
      setConnectionError(true);
      
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  };

  const generateSmartResponse = (userMessage = '') => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      const greetings = [
        "Hi there! How can I help you today?",
        "Hello! What's on your mind?",
        "Hey! How are you doing?",
        "Hi! What would you like to chat about?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    return "I'm having trouble connecting to my main systems right now, but I'm still here to help! Could you tell me more about what you're thinking about?";
  };

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
      {/* Backend Status */}
      <view style={{
        backgroundColor: '#e8f5e8',
        border: '1px solid #4caf50',
        padding: '8px 12px',
        margin: '10px',
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <text>Connected to Railway Backend</text>
      </view>

      {/* Debug Panel */}
      {showDebug && (
        <view style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          width: '300px',
          maxHeight: '200px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          overflow: 'auto',
          zIndex: 1000
        }}>
          <view style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <text style={{ fontWeight: 'bold', color: '#00ff00' }}>Debug Logs</text>
            <view style={{ display: 'flex', gap: '5px' }}>
              <text bindtap={() => setDebugLogs([])} style={{ cursor: 'pointer', color: '#ffff00' }}>Clear</text>
              <text bindtap={() => setShowDebug(false)} style={{ cursor: 'pointer', color: '#ff0000' }}>Hide</text>
            </view>
          </view>
          {debugLogs.map(log => (
            <view key={log.id} style={{ 
              marginBottom: '3px', 
              color: log.type === 'error' ? '#ff6b6b' : 
                    log.type === 'success' ? '#51cf66' : 
                    log.type === 'warning' ? '#ffd43b' : '#74c0fc'
            }}>
              <text>[{log.timestamp}] {log.message}</text>
            </view>
          ))}
        </view>
      )}

      {!showDebug && (
        <view bindtap={() => setShowDebug(true)} style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 1000
        }}>
          <text>Debug</text>
        </view>
      )}

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
          <text>Connection issues - using offline responses (tap to dismiss)</text>
        </view>
      )}

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
          
          {loading && (
            <view className="message-wrapper bot">
              <view className="message bot">
                <text>Thinking...</text>
                <view className="cancel-request" bindtap={cancelRequest}>
                  <text>Cancel</text>
                </view>
              </view>
            </view>
          )}
        </scroll-view>
      </view>

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