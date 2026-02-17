const Chat = require("../models/chat");
const Message = require("../models/message");
const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/create-new-chat', authMiddleware, async (req, res) => {
  try {
    const chat = await new Chat(req.body);
    const savedChat = await chat.save();
    await savedChat.populate('members')
    res.status(201).send({
      message: "Chat created successfully",
      success: true,
      data: savedChat,
    });
  } catch (err) {
    res.status(400).send({
      message: err.message || "Failed to create chat",
      success: false,
    });
  }
});

router.get("/get-all-chats", authMiddleware, async (req, res) => {
  try {
    const allChats = await Chat.find({
      members: { $in: [req.user.userId] },
    })
      .populate("members")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).send({
      message: "Chat fetched successfully",
      success: true,
      data: allChats,
    });
  } catch (err) {
    res.status(400).send({
      message: err.message || "Failed to fetch chats",
      success: false,
    });
  }
});

router.post("/clear-unread-message", authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).send({
        message: "No chat found with the given ID",
        success: false,
      });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { unreadMessageCount: 0 },
      { new: true },
    )
      .populate("members")
      .populate("lastMessage");

    await Message.updateMany(
      { chatId, read: false },
      { $set: { read: true } },
    );

    res.send({
      message: "Unread message count cleared successfully",
      success: true,
      data: updatedChat,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
      success: false,
    });
  }
});

module.exports = router;
