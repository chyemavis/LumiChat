import { useState, view, text, input } from "@lynx-js/react";
import "./App.css";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to send messages to the backend API
  const sendMessage = async (newMessages) => {
    setLoading(true);
    try {
      console.log("Payload being sent to backend:", {
        messages: newMessages.map((m) => ({
          role: m.user === "me" ? "user" : "assistant",
          content: m.text,
        })),
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.user === "me" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      const text = await response.text();
      console.log("Raw response text:", text);

      if (!response.ok) {
        throw new Error(text || "Unknown error from backend.");
      }

      const data = JSON.parse(text);
      console.log("Parsed response data:", data);

      if (!data.reply) {
        throw new Error("Invalid response from backend.");
      }

      setMessages([...newMessages, { text: data.reply, user: "bot" }]);
    } catch (error) {
      console.error("Error during API call:", error);
      setMessages([...newMessages, { text: error.message || "Sorry, something went wrong. Please try again.", user: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  // Handler for when the user taps the send button
  const handleSend = () => {
    const trimmedInput = inputValue ? inputValue.trim() : ""; // Fallback for undefined inputValue
    console.log("handleSend triggered. Input value:", trimmedInput); // Debugging
    if (!trimmedInput || loading) {
      console.log("Blocked: Empty input or loading."); // Debugging
      return;
    }
    const newMessages = [...messages, { text: trimmedInput, user: "me" }];
    console.log("New messages array before setMessages:", newMessages); // Debugging
    setMessages(newMessages);
    console.log("Messages state after setMessages:", messages); // Debugging
    setInputValue(""); // Clear the input field after sending the message
    sendMessage(newMessages);
  };

  return (
    <view className="chat-container">
      {/* Chat messages display area */}
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
        {loading && <text className="message bot">Typing...</text>}
      </view>

      {/* Input area with text input and send button */}
      <view className="input-area">
        <input
          value={inputValue}
          bindinput={(e) => {
            const newValue = e.detail?.value || e.target?.value || ""; // Handle different event data structures
            if (!loading) { // Prevent overwriting cleared state during loading
              console.log("bindinput event triggered. Input value:", newValue); // Debugging
              setInputValue(newValue); // Update state with the new value
            }
          }}
          placeholder="Type a message..."
        />
        <view
          className="send-button"
          bindtap={() => {
            console.log("bindtap event triggered"); // Debugging
            handleSend();
          }}
          style={loading ? { opacity: 0.5 } : {}} // Basic visual feedback for loading state
        >
          <text>{loading ? "..." : "Send"}</text>
        </view>
      </view>

      {/* Inline Debugging: Display inputValue, messages, and event trigger status */}
      <view className="debug-inline">
        <text>Inline Debug - Input Value: {inputValue}</text>
        <text>Inline Debug - Messages: {JSON.stringify(messages)}</text>
        <text>Inline Debug - Loading: {loading ? "true" : "false"}</text>
        <text>Inline Debug - Last Event: {"bindinput or bindtap triggered"}</text>
      </view>

      {/* Static Debug Message */}
      <view className="static-debug">
        <text>Static Debug: App is rendering correctly.</text>
      </view>
    </view>
  );
}