import { useState, view, text, input } from "@lynx-js/react";
import Avatar from "./Avatar.jsx";
import "../styles/AuthScreen.css";

export default function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = () => {
    if (isLogin) {
      // Handle login
      if (username.trim() && password.trim()) {
        onLogin({ username, type: 'login' });
      }
    } else {
      // Handle signup
      if (fullName.trim() && email.trim() && password.trim() && confirmPassword.trim()) {
        if (password !== confirmPassword) {
          // You might want to add proper error handling here
          alert("Passwords don't match");
          return;
        }
        onLogin({ username: fullName, email, type: 'signup' });
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Clear form when switching
    setUsername("");
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <view className="auth-screen">
      <view className="auth-content">
        <view className="auth-header">
          <Avatar size="xlarge" />
          <text className="auth-title">
            {isLogin ? "Welcome Back!" : "Join Lumi"}
          </text>
          <text className="auth-subtitle">
            {isLogin ? "Log in to continue chatting" : "Create your account"}
          </text>
        </view>

        <view className="auth-form">
          {isLogin ? (
            <>
              <view className="input-group">
                <text className="input-label">Email:</text>
                <input
                  value={username}
                  bindinput={(e) => {
                    const newValue = e.detail?.value || e.target?.value || "";
                    setUsername(newValue);
                  }}
                  placeholder="Enter your email"
                  className="auth-input"
                />
              </view>

              <view className="input-group">
                <text className="input-label">Password:</text>
                <input
                  value={password}
                  type="password"
                  bindinput={(e) => {
                    const newValue = e.detail?.value || e.target?.value || "";
                    setPassword(newValue);
                  }}
                  placeholder="Enter your password"
                  className="auth-input"
                />
              </view>
            </>
          ) : (
            <>
              <view className="input-group">
                <text className="input-label">Username:</text>
                <input
                  value={fullName}
                  bindinput={(e) => {
                    const newValue = e.detail?.value || e.target?.value || "";
                    setFullName(newValue);
                  }}
                  placeholder="Enter your username"
                  className="auth-input"
                />
              </view>

              <view className="input-group">
                <text className="input-label">Email:</text>
                <input
                  value={email}
                  bindinput={(e) => {
                    const newValue = e.detail?.value || e.target?.value || "";
                    setEmail(newValue);
                  }}
                  placeholder="Enter your email"
                  className="auth-input"
                />
              </view>

              <view className="input-group">
                <text className="input-label">Password:</text>
                <input
                  value={password}
                  type="password"
                  bindinput={(e) => {
                    const newValue = e.detail?.value || e.target?.value || "";
                    setPassword(newValue);
                  }}
                  placeholder="Enter your password"
                  className="auth-input"
                />
              </view>

              <view className="input-group">
                <text className="input-label">Confirm Password:</text>
                <input
                  value={confirmPassword}
                  type="password"
                  bindinput={(e) => {
                    const newValue = e.detail?.value || e.target?.value || "";
                    setConfirmPassword(newValue);
                  }}
                  placeholder="Confirm your password"
                  className="auth-input"
                />
              </view>
            </>
          )}

          <view className="auth-button" bindtap={handleSubmit}>
            <text>{isLogin ? "Log In" : "Create Account"}</text>
          </view>

          <view className="auth-switch">
            <text>{isLogin ? "Don't have an account? " : "Already have an account? "}</text>
            <text className="auth-link" bindtap={toggleMode}>
              {isLogin ? "Sign Up" : "Log In"}
            </text>
          </view>
        </view>
      </view>
    </view>
  );
}
