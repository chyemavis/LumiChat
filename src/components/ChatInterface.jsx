import { useState, view, text, input, useEffect } from "@lynx-js/react";
import Avatar from "./Avatar.jsx";
import DiaryMode from "./DiaryMode.jsx";
import "../styles/ChatInterface.css";

export default function ChatInterface({ user }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDiaryPopup, setShowDiaryPopup] = useState(false);
  const [isDiaryMode, setIsDiaryMode] = useState(false);


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

      // Call Gemini API directly with enhanced prompt
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAGptA81rmXeLLSG2jPlOFImQ31gfCI_5A`, {
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
      
      if (error.message.includes('429')) {
        // Rate limit - use smart fallback responses
        const smartResponse = generateSmartResponse(userMessage);
        setMessages([...newMessages, { text: smartResponse, user: "bot" }]);
      } else {
        // Other errors - show debug info
  const errorMessage = `API Error: ${error.message} | Status: ${error.status || 'none'}`;
  setMessages([...newMessages, { text: errorMessage, user: "bot" }]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Smart response system with contextual length and tone
  const generateSmartResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
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
      const empathetic = [
        "I'm really sorry you're going through this difficult time. Your feelings are completely valid, and it takes courage to share what you're experiencing. While I'm currently running on backup systems, I want you to know that you're not alone. Would you like to talk more about what's been weighing on your heart? Sometimes just expressing these feelings can provide some relief.",
        "I can hear that you're dealing with something really challenging right now, and I want you to know that your emotions matter. It's okay to feel overwhelmed sometimes - that's part of being human. Even though my main systems are experiencing high traffic, I'm here to listen and support you in whatever I can. What's been the hardest part for you lately?",
        "Thank you for trusting me with how you're feeling. I can sense you're going through a tough time, and I want you to know that reaching out shows real strength. While I'm operating on limited capacity right now, I genuinely care about your wellbeing. Would it help to talk through what's been troubling you? Sometimes having someone listen can make a difference."
      ];
      return empathetic[Math.floor(Math.random() * empathetic.length)];
    }
    
    // Relationship/personal issues - medium length, supportive
    if (message.includes('relationship') || message.includes('boyfriend') || message.includes('girlfriend') ||
        message.includes('family') || message.includes('friend') || message.includes('conflict') ||
        message.includes('argument') || message.includes('breakup') || message.includes('divorce')) {
      return "Relationships can be really complex and challenging. I understand you're dealing with something personal right now, and that takes emotional energy. Even though I'm running on backup systems, I'd like to help you think through this situation. What aspect of this is weighing on you most? Sometimes talking it out can help clarify your feelings.";
    }
    
    // Health concerns - caring and supportive
    if (message.includes('sick') || message.includes('pain') || message.includes('doctor') ||
        message.includes('health') || message.includes('medication') || message.includes('hospital')) {
      return "I'm concerned about what you're going through with your health. While I can't provide medical advice and I'm currently on backup systems, I want you to know I care about your wellbeing. Have you been able to speak with a healthcare professional about this? Your health and comfort are important.";
    }
    
    // Work/school stress - understanding and practical
    if (message.includes('work') || message.includes('job') || message.includes('school') ||
        message.includes('exam') || message.includes('deadline') || message.includes('boss') ||
        message.includes('homework') || message.includes('project')) {
      return "Work and school pressures can feel really overwhelming sometimes. I understand you're dealing with stress in that area of your life. Even with my systems running slowly, I'd like to help you think through this. What's been the most challenging part? Sometimes breaking things down into smaller steps can make them feel more manageable.";
    }
    
    // Simple how are you - short and caring
    if (message.includes('how are you')) {
      return "I'm doing well, thank you for asking! How are you feeling today?";
    }
    
    // Questions about capabilities - brief and helpful
    if (message.includes('what can you do') || message.includes('capabilities')) {
      return "I can chat, answer questions, help with problems, and provide support. Right now I'm on backup systems, but I'm still here for you! What would be most helpful?";
    }
    
    // Weather questions - short and practical
    if (message.includes('weather')) {
      return "I can't check live weather, but I can help you plan for different conditions! What's your location and what are you planning?";
    }
    
    // Creative/brainstorming - medium length, enthusiastic
    if (message.includes('idea') || message.includes('creative') || message.includes('brainstorm')) {
      return "I love creative projects! Even with my systems running slowly, brainstorming is one of my favorite things to do. What kind of creative challenge are you working on? Let's explore some possibilities together!";
    }
    
    // Learning/study help - encouraging and practical
    if (message.includes('learn') || message.includes('study') || message.includes('explain')) {
      return "Learning new things is exciting! I'd be happy to help explain concepts or suggest study approaches. What subject are you diving into? I can break things down step by step.";
    }
    
    // Technical/coding - direct and helpful
    if (message.includes('code') || message.includes('programming') || message.includes('bug')) {
      return "I enjoy helping with coding challenges! What programming language or technical issue are you working with? I can suggest debugging steps or best practices.";
    }
    
    // General questions - medium length, engaging
    return "That's an interesting topic! I'm currently experiencing high traffic on my main systems, but I'm still here to help and chat. Could you tell me more about what you're thinking about? I'd love to explore this with you.";
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
   
    const newMessages = [...messages, { text: trimmedInput, user: "me" }];
    setMessages(newMessages);
    setInputValue("");
    sendMessage(newMessages);
  };


  return (
    <view className="chat-container" style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh"
    }}>
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
      <view className="messages-container" style={{ flex: 1, minHeight: 0 }}>
        <scroll-view
          scroll-y={true}
          scroll-into-view="messagesEnd"
          style={{
            flex: 1,
            width: "100%",
            minHeight: 0,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "18px"
          }}
          className="messages"
        >
          {messages.map((msg, index) => (
            <view key={index} className={msg.user === "me" ? "message-wrapper me" : "message-wrapper bot"}>
              <view
                className={msg.user === "me" ? "message me" : "message bot"}
                style={{
                  maxWidth: "80%",
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                  padding: "12px 16px",
                  borderRadius: 18,
                  lineHeight: 1.5,
                  marginBottom: "2px",
                  alignSelf: msg.user === "me" ? "flex-end" : "flex-start",
                  background: msg.user === "me" ? "#ff9bb3" : "#fff",
                  color: msg.user === "me" ? "#fff" : "#000"
                }}
              >
                <text>{msg.text}</text>
              </view>
              {index === messages.length - 1 && <view id="messagesEnd" />}
            </view>
          ))}
          {loading && (
            <view className="message-wrapper bot">
              <view className="message bot" style={{
                  maxWidth: "80%",
                  padding: "12px 16px",
                  borderRadius: 18,
                  lineHeight: 1.5,
                  marginBottom: "2px",
                  alignSelf: "flex-start",
                  background: "#fff",
                  color: "#000",
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap"
                }}>
                <text>🤖 Thinking...</text>
              </view>
            </view>
          )}
        </scroll-view>
      </view>


      {/* Input area fixed at bottom */}
      <view className="input-area" style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "12px",
        borderTop: "1px solid #ddd"
      }}>
        <input
          value={inputValue}
          bindinput={(e) => setInputValue(e.detail?.value || e.target?.value || "")}
          style={{ flex: 1, padding: "10px" }}
          placeholder="Type a message..."
        />
        <view
          className="send-button"
          bindtap={handleSend}
          style={{
            marginLeft: "10px",
            opacity: loading ? 0.5 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          <text>{loading ? "..." : "Send"}</text>
        </view>
      </view>
    </view>
  );
}