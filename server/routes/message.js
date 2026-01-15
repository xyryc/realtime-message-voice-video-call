const express = require("express");
const authMiddleware = require("../middleware/auth");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const router = express.Router();

router.post("/conversation", authMiddleware, async (req, res) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.userId;

    // find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, recipientId] },
    }).populate("participants", "name email avatar");

    // create if doesn't exist
    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, recipientId],
      });

      await conversation.save();
      await conversation.populate("participants", "name email avatar");
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get(
  "/conversation/:conversationId/messages",
  authMiddleware,
  async (req, res) => {
    try {
      const { conversationId } = req.params;

      const messages = await Message.find({ conversationId })
        .populate("sender", "name email avatar")
        .sort({ createdAt: 1 });

      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
