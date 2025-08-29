# LumiChat

LumiChat is a personal mindful companion chatbot designed to provide a supportive and engaging conversational experience. The application features a complete user flow, from a welcoming splash screen to a secure authentication process and the core chat interface.

## Features and Functionality

- **Splash Screen:** A visually appealing entry point to the application.
- **Welcome Screen:** Greets users and introduces them to LumiChat.
- **User Authentication:** A secure login and signup process to manage user accounts.
- **Chat Interface:** The main screen where users can interact with the AI-powered chatbot.
- **Mindful Companion:** The chatbot is designed to be a supportive and mindful presence for the user.

## Development Tools

- **Node.js:** The runtime environment for the application.
- **@lynx-js/rspeedy:** The primary build tool and development server for the project.
- **Vite:** Used for running tests in a simulated DOM environment.
- **ESLint:** For static code analysis and enforcing code quality.
- **Prettier:** For consistent code formatting across the project.
- **Express:** A web application framework for Node.js, used to build the backend server.

## APIs Used

- **Google Gemini API:** The application makes direct calls to the Gemini API from the frontend to power the chatbot's conversational abilities.

**Note:** The API key is currently exposed on the frontend, which is a security risk. It should be moved to a secure backend environment.

## Assets

The project uses the following assets for its user interface:

- `chatbot.png`
- `firstScreen.png`
- `test.png`
- `welcome.png`

## Libraries

### Frontend

- **@lynx-js/react:** A framework for building the user interface with React.

### Backend & AI

- **ai (Vercel AI SDK):** A library for building AI-powered user interfaces and connecting to various AI models.
- **express:** Used to create and manage the backend server.
- **cors:** Enables Cross-Origin Resource Sharing to allow the frontend and backend to communicate.
- **dotenv:** Manages environment variables for secure configuration.
- **express-rate-limit:** Provides rate limiting to protect the server from abuse.
- **node-fetch:** A module for making HTTP requests from the Node.js server.

---

## Problem Statement
The rise of LLMs, agents, and AI systems is transforming how we interact with technology. From chatbots to AI-powered tools, a new wave of UI patterns is emerging to meet the demands of this AI Era.
This track invites you to use Lynx, the newly open-sourced cross-platform UI technologies that power TikTok, to build products or prototypes that explore how AI is reshaping UI, UX and app experiences.
