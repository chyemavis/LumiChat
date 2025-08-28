import { view, text, image } from "@lynx-js/react";
import "../styles/WelcomeScreen.css";
import welcomeImage from "../assets/welcome.png";

export default function WelcomeScreen({ onContinue }) {
  return (
    <view className="welcome-screen">
      <view className="welcome-content">
        <text className="app-name">Lumi</text>
        
        <view className="welcome-messages">
          <text className="welcome-text">Hello! Welcome To</text>
          <text className="welcome-text">Lumi, your personal</text>
          <text className="welcome-text">mindful companion</text>
        </view>

        <view className="button-container">
          <view
            className="get-started-btn"
            hover-class="get-started-btn-hover"
            bindtap={onContinue}
            style={{
              background: '#FFD1EA',
              borderRadius: '30px',
              padding: '1.2rem 3rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              border: 'none',
              minWidth: '220px',
              height: '55px',
              backdropFilter: 'blur(0)',
              WebkitBackdropFilter: 'blur(0)',
              backgroundColor: '#ffc0cb'
            }}
          >
            <text style={{ 
              color: '#333333',
              fontWeight: '500',
              fontSize: '1.5rem',
              letterSpacing: '0.5px',
              background: 'transparent'
            }}>Get Started</text>
          </view>
        </view>
      </view>

      <view className="welcome-bunny-container">
        <image
          src={welcomeImage}
          className="welcome-bunny"
          mode="aspectFit"
          width="200"
          height="200"
        />
      </view>
    </view>
  );
}