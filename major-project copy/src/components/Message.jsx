// src/components/Message.js
import React from 'react';

function Message({ text, user, time, isMine, isSystem }) {
  return (
    <div className={`message ${isMine ? 'mine' : ''} ${isSystem ? 'system' : ''}`}>
      {!isSystem && <div className="message-user">{user}</div>}
      <div className="message-bubble">
        <p>{text}</p>
        <span className="message-time">{time}</span>
      </div>
    </div>
  );
}

export default Message;