import { view, text, image } from "@lynx-js/react";
import "../styles/WelcomeScreen.css";
import welcomeImage from "../assets/welcome.png";


export default function WelcomeScreen({ onContinue }) {
  return (
    <view className="welcome-screen">
      <view className="welcome-content">
        <text className="app-name">Lumi.</text>
        
        <view className="welcome-messages">
          <text className="welcome-text">Your personal mindful companion.</text>
        </view>
      </view>

      <view className="button-container">
        <view
          className="get-started-btn"
          hover-class="get-started-btn-hover"
          bindtap={onContinue}
          style={{
            background: '#fdd8dbff',
            borderRadius: '30px',
            padding: '0.7rem 1.5rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            border: 'none',
            minWidth: '150px',
            height: '44px',
            backdropFilter: 'blur(0)',
            WebkitBackdropFilter: 'blur(0)',
            backgroundColor: 'hsl(355, 61%, 79%)'
          }}
        >
          <text style={{
            color: '#ffffffff',
            fontWeight: '600',
            fontSize: '1.2rem',
            letterSpacing: '0.5px',
            background: 'transparent'
          }}>Start</text>
        </view>
      </view>


      <view className="welcome-bunny-container">
        <image
          src={welcomeImage}
          className="welcome-bunny"
          mode="aspectFit"
          width="300"
          height="230"
        />
      </view>
    </view>
  );
}
