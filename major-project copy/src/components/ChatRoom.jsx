import React, { useState, useEffect, useRef } from 'react';
import Message from './Message';

function ChatRoom({ socket, username }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    socket.on('message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });
    
    // Cleanup on component unmount
    return () => {
      socket.off('message');
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() !== '') {
      socket.emit('send_message', { text: message });
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((msg) => (
          <Message
            key={msg.id}
            text={msg.text}
            user={msg.user}
            time={msg.time}
            isMine={msg.user === username}
            isSystem={msg.user === 'system'}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="message-form" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatRoom;