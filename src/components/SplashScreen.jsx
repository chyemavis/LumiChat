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
        <view className="splash-title-row">
          <text className="splash-title">Lumi.</text>
        </view>
  <image src={welcomeImg} className="splash-image" style={{ width: '260px', height: '260px', margin: 0 }} />
      </view>
    </view>
  );
}
