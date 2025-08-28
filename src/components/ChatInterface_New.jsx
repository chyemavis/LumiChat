import { useState, view, text } from "@lynx-js/react";
import GeneralChat from "./GeneralChat.jsx";
import DiaryMode from "./DiaryMode.jsx";
import "../styles/ChatInterface.css";

export default function ChatInterface({ user }) {
  const [showDiaryPopup, setShowDiaryPopup] = useState(false);
  const [isDiaryMode, setIsDiaryMode] = useState(false);

  const handleShowDiaryPopup = () => {
    setShowDiaryPopup(true);
  };

  const handleSwitchToDiary = () => {
    setIsDiaryMode(true);
    setShowDiaryPopup(false);
  };

  const handleBackToChat = () => {
    setIsDiaryMode(false);
  };

  return (
    <>
      {/* Mood Diary Popup */}
      {showDiaryPopup && (
        <view className="popup-overlay" bindtap={() => setShowDiaryPopup(false)}>
          <view className="popup-content" bindtap={(e) => e.stopPropagation()}>
            <text className="popup-title">Switch to Mood Diary Mode?</text>
            <text className="popup-message">
              Mood Diary mode creates a safe space for you to express your feelings and track your emotional well-being. Would you like to continue?
            </text>
            <view className="popup-buttons">
              <view className="popup-button cancel" bindtap={() => setShowDiaryPopup(false)}>
                <text>Cancel</text>
              </view>
              <view className="popup-button confirm" bindtap={handleSwitchToDiary}>
                <text>Yes, Continue</text>
              </view>
            </view>
          </view>
        </view>
      )}

      {/* Render appropriate mode */}
      {isDiaryMode ? (
        <DiaryMode user={user} onBackToChat={handleBackToChat} />
      ) : (
        <GeneralChat user={user} onShowDiaryPopup={handleShowDiaryPopup} />
      )}
    </>
  );
}
