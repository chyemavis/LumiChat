import { useState, useEffect } from "react";
// The App.css import was causing a build error as the file was not available.
// All styling is now handled with Tailwind CSS classes directly on the elements.

// This is a complete, self-contained React app. It includes all components and logic.
export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Check for the lynx-root element to ensure the app can render.
  useEffect(() => {
    const rootElement = document.getElementById("lynx-root");
    if (rootElement) {
      console.log("Found #lynx-root, app is ready to render.");
      setIsMounted(true);
    } else {
      console.error("Error: The #lynx-root element was not found in the HTML. Please ensure your index.html file contains <div id='lynx-root'></div>.");
    }
  }, []);

  const handleSend = () => {
    if (input.trim() === "") return;
    setMessages([...messages, { text: input, user: "me" }]);
    setInput("");
  };

  // Render the UI only if the root element is found.
  if (!isMounted) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        {/* Changed p tags to div tags to fix DOM nesting warning */}
        <div>
          <strong>Error:</strong> The app could not find the required root element.
        </div>
        <div>
          Please ensure your HTML has a `<pre>&lt;div id="lynx-root"&gt;&lt;/div&gt;</pre>` element.
        </div>
      </div>
    );
  }

  return (
    // Use Tailwind CSS classes for a modern, responsive chat container.
    <div className="flex flex-col h-screen p-4 bg-gray-100 rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, index) => (
          // Use dynamic classes to style messages based on the user.
          <div key={index} className={`p-3 rounded-xl max-w-xs ${msg.user === "me" ? "bg-blue-500 text-white ml-auto" : "bg-gray-300 text-gray-800"}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex p-2 bg-white rounded-xl shadow-md">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border-none outline-none px-3 bg-transparent"
        />
        <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
          Send
        </button>
      </div>
    </div>
  );
}
