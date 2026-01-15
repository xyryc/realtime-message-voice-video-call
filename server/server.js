const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const userRoutes = require("./routes/users")

const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const User = require('./models/User');

const logger = require("./middleware/logger");

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/message', messageRoutes);
app.use('/api/v1/user', userRoutes)

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


// Socket.IO authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    
    await User.findByIdAndUpdate(decoded.userId, { online: true });
    
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Store active connections
const userSockets = new Map();

// Socket.IO events
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.userId);
  
  userSockets.set(socket.userId, socket.id);
  socket.join(socket.userId);

  io.emit('user_status', { userId: socket.userId, online: true });

  // Join conversation
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
  });

  // Send message
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, content, type = 'text' } = data;

      const message = new Message({
        conversationId,
        sender: socket.userId,
        content,
        type
      });
      await message.save();
      await message.populate('sender', 'name email avatar');

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        updatedAt: new Date()
      });

      io.to(conversationId).emit('new_message', message);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('message_error', { error: error.message });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { conversationId, isTyping } = data;
    socket.to(conversationId).emit('user_typing', {
      userId: socket.userId,
      conversationId,
      isTyping
    });
  });

  // Disconnect
  socket.on('disconnect', async () => {
    console.log('❌ User disconnected:', socket.userId);
    
    userSockets.delete(socket.userId);

    await User.findByIdAndUpdate(socket.userId, {
      online: false,
      lastSeen: new Date()
    });

    io.emit('user_status', { userId: socket.userId, online: false });
  });
});

app.get("/", (req, res) => {
  res.send({status: 200,message: "Server Running"});
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

