import React from "react";

export interface MessageItem {
  id?: string | number;
  messages: string[];
}

type Props = {
  messagesGroup: MessageItem[];
  visible?: boolean;
};

const MessageDisplay: React.FC<Props> = ({ messagesGroup, visible = true }) => {
  if (!visible || !messagesGroup || messagesGroup.length === 0) {
    return null;
  }

  return (
    <div className="errorSCT">
      <div className="cont">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "14px", color: "#d99899" }}>
            アラート
          </h3>
        </div>
        <ul>
          {messagesGroup.map((group) =>
            group.messages.map((message, i) => (
              <li key={`${group.id}-${i}`}>
                <i className="fas fa-exclamation-circle"></i> {message}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default MessageDisplay;
