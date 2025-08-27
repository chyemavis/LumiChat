import { view, text } from "@lynx-js/react";

export default function Avatar({ size = "small", className = "", showName = false }) {
  const getAvatarClass = () => {
    switch (size) {
      case "xlarge": return "avatar-xlarge";
      case "large": return "avatar-placeholder";
      case "small": return "avatar-small";
      case "tiny": return "avatar-tiny";
      default: return "avatar-small";
    }
  };

  const getAvatarEmoji = () => {
    // Lumi is a cute fox character
    return "🦊";
  };

  if (size === "tiny") {
    return (
      <view className={`message-avatar ${className}`}>
        <text className={getAvatarClass()}>{getAvatarEmoji()}</text>
      </view>
    );
  }

  return (
    <view className={`avatar-container ${className}`}>
      <text className={getAvatarClass()}>
        {getAvatarEmoji()}
      </text>
      {showName && (
        <text className="avatar-name">Lumi</text>
      )}
    </view>
  );
}
