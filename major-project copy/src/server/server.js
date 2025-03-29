// SERVER SIDE (server.js)
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

// Serve static files - useful for production
app.use(express.static(path.join(__dirname, 'public')));

// Add a basic route to confirm server is running
app.get('/', (req, res) => {
  res.send('Socket.IO server is running correctly. Connect with your client application.');
});

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io with the server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
  },
  pingTimeout: 60000,
  transports: ['websocket', 'polling']
});

// Store connected users
const users = {};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Send immediate confirmation to client
  socket.emit('connection_confirmed', { id: socket.id, message: 'Successfully connected to server' });
  
  // Handle user joining
  socket.on('join', (username) => {
    users[socket.id] = username;
    console.log(`${username} joined the chat`);
    io.emit('message', {
      id: Date.now(),
      user: 'system',
      text: `${username} joined the chat`,
      time: new Date().toLocaleTimeString()
    });
  });
  
  // Handle message sending
  socket.on('send_message', (data) => {
    console.log(`Message received from ${users[socket.id]}: ${data.text}`);
    io.emit('message', {
      id: Date.now(),
      user: users[socket.id],
      text: data.text,
      time: new Date().toLocaleTimeString()
    });
  });
  
  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`Socket ${socket.id} disconnected due to ${reason}`);
    if (users[socket.id]) {
      io.emit('message', {
        id: Date.now(),
        user: 'system',
        text: `${users[socket.id]} left the chat`,
        time: new Date().toLocaleTimeString()
      });
      delete users[socket.id];
    }
  });
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});