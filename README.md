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

- **Google Gemini API:** The application uses a secure backend server to communicate with the Gemini API, ensuring API keys are never exposed to the frontend.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/chyemavis/LumiChat.git
cd LumiChat
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Set up environment variables:
   - Create a `.env` file in the `backend` directory
   - Add your Google Gemini API key:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

### Running the Application

1. Start the backend server:
```bash
cd backend
node index.js
```
The backend will run on `http://localhost:3002`

2. In a new terminal, start the frontend:
```bash
npm run dev
```
The frontend will run on `http://localhost:3001`

3. Open your browser and navigate to `http://localhost:3001`

## Project Structure

```
LumiChat/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── styles/            # CSS styles
│   └── assets/            # Images and static files
├── backend/               # Backend server
│   ├── index.js          # Express server
│   ├── package.json      # Backend dependencies
│   └── .env              # Environment variables (not committed)
├── package.json          # Frontend dependencies
├── lynx.config.js        # Lynx configuration
└── README.md
```

## Architecture

- **Frontend:** React-based UI built with Lynx that sends user messages to the backend
- **Backend:** Express server that securely handles API key management and communicates with Google's Gemini API
- **Security:** API keys are stored as environment variables on the backend, never exposed to the client

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
