const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/message");
const logger = require("./middleware/logger");
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");

const app = express();
const server = http.createServer(app);

// socket.io setup
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/message", messageRoutes);

// socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

// socket.io connection
io.on("connection", (socket) => {
  console.log("User connected", socket.id, "UserID", socket.userId);

  // join conversation room
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
  });

  // send message
  socket.on("send_message", async (data) => {
    try {
      const { conversationId, content, type } = data;

      // save message to db
      const message = new Message({
        conversationId,
        sender: socket.userId,
        content,
        type: type || "text",
      });
      await message.save();
      await message.populate("sender", "name email avatar");

      // update conversation last message
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
      });

      // broadcast to conversation room
      io.to(conversationId).emit("receive_message", message);
      console.log("Message sent: ", message._id);
    } catch (error) {
      console.error("Send message error: ", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send({ status: 200, message: "Server Running" });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
