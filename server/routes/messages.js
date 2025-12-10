const express = require('express');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get conversations
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId
    })
    .populate('participants', 'name email avatar online lastSeen')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or get conversation
router.post('/conversations', authMiddleware, async (req, res) => {
  try {
    const { participantId } = req.body;

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [req.userId, participantId] }
    })
    .populate('participants', 'name email avatar online lastSeen')
    .populate('lastMessage');

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [req.userId, participantId]
      });
      await conversation.save();
      await conversation.populate('participants', 'name email avatar online lastSeen');
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages
router.get('/conversations/:conversationId/messages', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({ conversationId });

    res.json({
      messages: messages.reverse(),
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark messages as read
router.put('/conversations/:conversationId/read', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.updateMany(
      { 
        conversationId,
        sender: { $ne: req.userId },
        read: false
      },
      { 
        read: true,
        $push: {
          readBy: {
            user: req.userId,
            readAt: new Date()
          }
        }
      }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;