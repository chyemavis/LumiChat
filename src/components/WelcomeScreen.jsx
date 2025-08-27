import { view, text, image } from "@lynx-js/react"; // Add image import
import "../styles/WelcomeScreen.css";
import welcomeImage from "../assets/welcome.png";

export default function WelcomeScreen({ onContinue }) {
  return (
    <view className="welcome-screen">
      <view className="welcome-content">
        <view className="welcome-messages">
          <text className="welcome-title">Hello!</text>
          <text className="welcome-title">Welcome to Lumi</text>
          <text className="welcome-description">
            Your Personal Mindful Companion
          </text>
        </view>

        <view className="welcome-button" bindtap={onContinue}>
          <text>Get Started</text>
        </view>
        <view className="welcome-bunny-container">
          <image 
            src={welcomeImage}
            className="welcome-bunny" 
            mode="aspectFit"
          />
        </view>
      </view>
    </view>
  );
}