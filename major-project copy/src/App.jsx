// src/App.jsx
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client"; // Make sure to use destructured import
import ChatRoom from "./components/ChatRoom";
import Login from "./components/Login";
import "./App.css";

// Create socket outside component to prevent multiple connections
const SOCKET_URL = "http://localhost:4000";
console.log(`Attempting to connect to socket server at: ${SOCKET_URL}`);

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: true
});

function App() {
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    function onConnect() {
      console.log("Connected to Socket.io server!");
      setIsConnected(true);
      setConnectionError(null);
    }

    function onDisconnect(reason) {
      console.log(`Disconnected from Socket.io server: ${reason}`);
      setIsConnected(false);
    }

    function onConnectionError(err) {
      console.error("Connection error:", err);
      setConnectionError(`Connection failed: ${err.message}`);
      setIsConnected(false);
    }

    function onConnectionConfirmed(data) {
      console.log("Server confirmed connection:", data);
    }

    // Register event handlers
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectionError);
    socket.on('connection_confirmed', onConnectionConfirmed);

    // Make sure socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    // Cleanup on component unmount
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectionError);
      socket.off('connection_confirmed', onConnectionConfirmed);
    };
  }, []);

  const handleLogin = (name) => {
    if (name.trim() !== '') {
      if (isConnected) {
        setUsername(name);
        setLoggedIn(true);
        socket.emit('join', name);
        console.log(`Logged in as: ${name}`);
      } else {
        alert("Not connected to chat server. Please try again in a moment.");
        // Attempt to reconnect
        socket.connect();
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Socket.io React Chat</h1>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '✅ Connected' : '❌ Disconnected'}
        </div>
        {connectionError && <div className="connection-error">{connectionError}</div>}
      </header>
      <main>
        {!loggedIn ? (
          <Login onLogin={handleLogin} />
        ) : (
          <ChatRoom socket={socket} username={username} />
        )}
      </main>
    </div>
  );
}

export default App;