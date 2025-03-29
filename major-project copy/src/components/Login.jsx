import React, { useState } from 'react';

async function generateKey() {
  return await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

function Login({ onLogin }) {
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const aesKey = await generateKey(); // Generate AES key
    onLogin(name, aesKey); // Pass key along with username
  };

  return (
    <div className="login-container">
      <h2>Enter Chat Room</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Join Chat</button>
      </form>
    </div>
  );
}

export default Login;
