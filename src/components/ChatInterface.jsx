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
  
  const BACKEND_URLS = [
    'https://4a0a76d27125.ngrok-free.app', 
    'http://localhost:3002',
  ];
  
  const [currentBackendUrl, setCurrentBackendUrl] = useState(null);
  
  const abortControllerRef = useRef(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const findWorkingBackend = async () => {
      for (const baseUrl of BACKEND_URLS) {
        try {
          const response = await fetch(`${baseUrl}/health`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'ok' && data.geminiConfigured) {
              setCurrentBackendUrl(baseUrl);
              return;
            }
          }
        } catch (error) {
          // ignore failed backend
        }
      }
      setConnectionError(true);
    };
    
    findWorkingBackend();
  }, []);

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
    if (user && currentBackendUrl) {
      const welcomeMessage = {
        text: `Hello ${user.username}! I'm Lumi, your friendly AI assistant! What's on your mind today?`,
        user: "bot"
      };
      setMessages([welcomeMessage]);
    }
  }, [user, currentBackendUrl]);

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
    if (!currentBackendUrl) {
      const fallbackResponse = "I'm having trouble connecting to my systems right now, but I'm still here to help!";
      setMessages([...newMessages, { text: fallbackResponse, user: "bot" }]);
      return;
    }

    setLoading(true);
    setConnectionError(false);
    
    abortControllerRef.current = new AbortController();
    
    const lastUserMessage = newMessages.filter(m => m.user === "me").pop();
    const userMessage = lastUserMessage ? lastUserMessage.text : "";
    
    try {
      if (!userMessage.trim()) {
        throw new Error("Empty message");
      }
      
      const requestBody = {
        messages: [{
          parts: [{ text: userMessage }]
        }]
      };

      const response = await fetch(`${currentBackendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.message || data.text || "No response received";
      
      const updatedMessages = [...newMessages, { text: aiResponse.trim(), user: "bot" }];
      setMessages(updatedMessages);
      setConnectionError(false);
      
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
      
      const fallbackResponse = "I'm having trouble connecting to my main systems right now, but I'm still here to help! Could you tell me more about what you're thinking about?";
      setMessages([...newMessages, { text: fallbackResponse, user: "bot" }]);
      setConnectionError(true);
      
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
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
      {connectionError && (
        <view className="connection-status error" bindtap={() => setConnectionError(false)} style={{
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          padding: '8px 12px',
          margin: '10px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          <text>Connection issues - using offline responses</text>
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
          disabled={loading || !currentBackendUrl}
        />
        <view
          className="send-button"
          bindtap={handleSend}
          style={loading || !inputValue.trim() || !currentBackendUrl ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          <text>{loading ? "..." : "Send"}</text>
        </view>
      </view>
    </view>
  );
}