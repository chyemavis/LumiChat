import { view, text, image, useEffect } from "@lynx-js/react";
import welcomeImg from "../assets/test.png";
import "../styles/SplashScreen.css";

export default function SplashScreen({ onNext }) {

  const handleTap = () => {
    onNext();
  };

  return (
    <view className="splash-screen" bindtap={handleTap}>
      <view className="splash-content">
        <text className="splash-title">Lumi</text>
        <view style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <image src={welcomeImg} className="splash-image" style={{ width: '220px', height: '220px', margin: 0 }} />
        </view>
      </view>
    </view>
  );
}
