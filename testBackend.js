const fetch = require("node-fetch");

(async () => {
  try {
    console.log("Sending test request to backend...");

    const response = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { user: "me", text: "Hello, backend!" }
        ],
      }),
    });

    console.log("Raw response:", response);
    const text = await response.text();
    console.log("Raw response text:", text);

    const data = JSON.parse(text);
    console.log("Parsed response data:", data);
  } catch (error) {
    console.error("Error during test request:", error);
  }
})();
