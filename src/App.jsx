import { useState, view, text, input } from "@lynx-js/react"; // Combined imports
import "./App.css";

// Replace with your OpenAI API key
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"; // <-- REMEMBER TO REPLACE THIS!

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to send messages to the OpenAI API
  const sendMessage = async (userMessage) => {
    console.log("Sending message to AI:", userMessage); // Debugging
    setMessages((prev) => [...prev, { text: userMessage, user: "me" }]);
    setLoading(true); // Indicate that a response is being loaded

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are a helpful AI assistant." },
              // Map existing messages to the OpenAI format
              ...messages.map((m) => ({
                role: m.user === "me" ? "user" : "assistant",
                content: m.text,
              })),
              { role: "user", content: userMessage }, // Add the current user message
            ],
          }),
        }
      );

      // Handle potential API errors (e.g., invalid API key, rate limits)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = data.choices[0].message.content;

      console.log("AI response received:", aiMessage); // Debugging
      setMessages((prev) => [...prev, { text: aiMessage, user: "bot" }]);
    } catch (error) {
      console.error("AI Error:", error);
      // Display an error message to the user
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, something went wrong. Please try again.", user: "bot" },
      ]);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  // Handler for when the user taps the send button
  const handleSend = () => {
    console.log("handleSend triggered. Input value:", inputValue); // Debugging
    if (!inputValue.trim() || loading) {
        console.log("Blocked: Empty input or loading."); // Debugging
        return;
    }
    const userMessage = inputValue;
    setInputValue(""); // Clear the input field
    sendMessage(userMessage); // Send the message
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
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
        />
        {/* Reverted to <view> with bindtouchstart to avoid 990100 error */}
        <view 
          className="send-button" 
          bindtouchstart={handleSend} 
          style={loading ? { opacity: 0.5 } : {}} // Basic visual feedback for loading state
        >
          <text>{loading ? "..." : "Send"}</text>
        </view>
      </view>
    </view>
  );
}