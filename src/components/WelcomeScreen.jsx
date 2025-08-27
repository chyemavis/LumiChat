import { view, text } from "@lynx-js/react";
import Avatar from "./Avatar.jsx";
import "../styles/WelcomeScreen.css";

export default function WelcomeScreen({ onContinue }) {
  return (
    <view className="welcome-screen">
      <view className="welcome-content">
        <view className="welcome-avatar">
          <Avatar size="large" showName={true} />
        </view>
        
        <view className="welcome-messages">
          <text className="welcome-title">Hello! I'm Lumi </text>
          <text className="welcome-description">
            I'm your friendly AI assistant, here to help you with anything you need! 
            From answering questions to having conversations, I'm excited to chat with you.
          </text>
          <text className="welcome-sub">
            Let's get you set up so we can start our journey together!
          </text>
        </view>

        <view className="welcome-button" bindtap={onContinue}>
          <text>Get Started</text>
        </view>
      </view>
    </view>
  );
}
