import { useState, view } from "@lynx-js/react";
import SplashScreen from "./components/SplashScreen.jsx";
import WelcomeScreen from "./components/WelcomeScreen.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import ChatInterface from "./components/ChatInterface.jsx";
import "./styles/App.css";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash'); // 'splash', 'welcome', 'auth', 'chat'
  const [user, setUser] = useState(null);

  // Handle splash screen transition
  const handleNext = () => {
    if (currentScreen === 'splash') {
      setCurrentScreen('welcome');
    } else if (currentScreen === 'welcome') {
      setCurrentScreen('auth');
    }
  };

  // Handle login/signup
  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentScreen('chat');
  };

  // Render appropriate screen
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onNext={handleNext} />;
      case 'welcome':
        return <WelcomeScreen onContinue={handleNext} />;
      case 'auth':
        return <AuthScreen onLogin={handleLogin} />;
      case 'chat':
        return <ChatInterface user={user} />;
      default:
        return <SplashScreen onNext={handleNext} />;
    }
  };

  return (
    <view className={`App ${currentScreen === 'chat' ? 'chat-mode' : ''}`}>
      {renderCurrentScreen()}
    </view>
  );
}