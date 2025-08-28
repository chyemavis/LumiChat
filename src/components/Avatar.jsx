import { view, text, image } from "@lynx-js/react";
import chatbotIcon from "../assets/chatbot.png";

export default function Avatar({ size = "small", className = "", showName = false }) {
  const getAvatarSize = () => {
    switch (size) {
      case "xlarge": return { width: "120px", height: "120px" };
      case "large": return { width: "60px", height: "60px" };
      case "small": return { width: "32px", height: "32px" };
      case "tiny": return { width: "24px", height: "24px" };
      default: return { width: "32px", height: "32px" };
    }
  };

  const avatarStyle = {
    ...getAvatarSize(),
    borderRadius: "50%",
    objectFit: "cover"
  };

  if (size === "tiny") {
    return (
      <view className={`message-avatar ${className}`}>
        <image src={chatbotIcon} style={avatarStyle} alt="Lumi Avatar" />
      </view>
    );
  }

  return (
    <view className={`avatar-container ${className}`}>
      <image src={chatbotIcon} style={avatarStyle} alt="Lumi Avatar" />
      {showName && (
        <text className="avatar-name">Lumi</text>
      )}
    </view>
  );
}
