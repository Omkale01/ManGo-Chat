const express = require("express");
const path = require("path");
const app = express();
const authRouter = require("./controller/authController");
const userRouter = require("./controller/userController");
const chatRouter = require("./controller/chatController");
const messageRouter = require("./controller/messageController");
const cors = require("cors");

app.use(cors());
app.use(express.json());

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

const distPath = path.join(__dirname, "../client/dist");
app.use(express.static(distPath));

app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Online users tracking
const onlineUsers = [];

io.on("connection", (socket) => {
  console.log("Connected socket ID:", socket.id);

  socket.on("join-room", (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room ${userId}`);

    onlineUsers.push({ userId, socketId: socket.id });
    io.emit("user-online", userId);

    const uniqueOnlineIds = [...new Set(onlineUsers.map((u) => u.userId))];
    socket.emit("online-users", uniqueOnlineIds);
  });

  socket.on("disconnect", (reason) => {
    console.log("Disconnected socket ID:", socket.id, "| Reason:", reason);

    const index = onlineUsers.findIndex((u) => u.socketId === socket.id);
    if (index === -1) return;

    const disconnectedUserId = onlineUsers[index].userId;
    onlineUsers.splice(index, 1);

    const stillConnected = onlineUsers.some(
      (u) => u.userId === disconnectedUserId,
    );
    if (!stillConnected) {
      io.emit("user-offline", disconnectedUserId);
    }
  });

  socket.on("send-message", (message) => {
    console.log("send-message:", message);
    const receiverId = message.members.find((id) => id !== message.sender);
    if (receiverId) {
      io.to(receiverId).emit("receive-message", message);
    }
  });

  socket.on("typing", (data) => {
    io.to(data.receiverId).emit("typing", data);
  });

  socket.on("stop-typing", (data) => {
    io.to(data.receiverId).emit("stop-typing", data);
  });
});

module.exports = server;
