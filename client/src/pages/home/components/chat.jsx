import { useDispatch, useSelector } from "react-redux";
import { createNewMessage, getAllMessages } from "../../../apiCalls/message";
import { clearUnreadMessageCount } from "../../../apiCalls/chats";
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import {
  setAllChats,
  setSelectedChat,
  clearUnreadCount,
} from "../../../redux/usersSlice";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import moment from "moment";
import { socket } from "../../../socket";

function ChatArea() {
  const dispatch = useDispatch();
  const { selectedChat, user, allChats, onlineUsers } = useSelector(
    (state) => state.userReducer,
  );
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // The other person in this chat
  const otherMember = selectedChat?.members?.find((m) => m._id !== user._id);
  const isOtherOnline = onlineUsers?.includes(otherMember?._id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages, isTyping]);

  const selectedChatIdRef = useRef(selectedChat?._id);
  useEffect(() => {
    selectedChatIdRef.current = selectedChat?._id;
  }, [selectedChat?._id]);

  const getReceiverId = () =>
    selectedChat?.members?.find((m) => m._id !== user._id)?._id;

  const sendMessage = async () => {
    try {
      const newMessage = {
        chatId: selectedChat._id,
        sender: user._id,
        text: message,
      };

      const receiverId = getReceiverId();
      if (receiverId) {
        socket.emit("stop-typing", {
          senderId: user._id,
          receiverId,
          chatId: selectedChat._id,
        });
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      const optimisticMsg = {
        ...newMessage,
        _id: `temp-${Date.now()}`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      setAllMessages((prev) => [...prev, optimisticMsg]);
      setMessage("");

      socket.emit("send-message", {
        ...newMessage,
        members: selectedChat.members.map((m) => m._id),
        read: false,
        createdAt: moment().toISOString(),
      });

      await createNewMessage(newMessage);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    const receiverId = getReceiverId();
    if (!receiverId) return;

    socket.emit("typing", {
      senderId: user._id,
      receiverId,
      chatId: selectedChat._id,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", {
        senderId: user._id,
        receiverId,
        chatId: selectedChat._id,
      });
    }, 2000);
  };

  const getMessages = async () => {
    try {
      dispatch(showLoader());
      const response = await getAllMessages(selectedChat._id);
      dispatch(hideLoader());
      if (response.success) setAllMessages(response.data);
    } catch (err) {
      dispatch(hideLoader());
      toast.error(err.message);
    }
  };

  const clearUnreadMessages = async () => {
    try {
      dispatch(clearUnreadCount(selectedChat._id));
      dispatch(showLoader());
      const response = await clearUnreadMessageCount(selectedChat._id);
      dispatch(hideLoader());
      if (response.success) {
        const updatedChats = allChats.map((chat) =>
          chat._id === selectedChat._id ? response.data : chat,
        );
        dispatch(setAllChats(updatedChats));
        dispatch(setSelectedChat(response.data));
      }
    } catch (error) {
      dispatch(hideLoader());
      toast.error(error.message);
    }
  };

  const formatTime = (dateString) => {
    const messageDate = moment(dateString);
    const today = moment().startOf("day");
    const yesterday = moment().subtract(1, "days").startOf("day");
    if (messageDate.isSame(today, "day")) return messageDate.format("h:mm A");
    if (messageDate.isSame(yesterday, "day"))
      return `Yesterday ${messageDate.format("h:mm A")}`;
    return messageDate.format("MMM D, h:mm A");
  };

  useEffect(() => {
    const onReceiveMessage = (data) => {
      if (data.chatId === selectedChatIdRef.current) {
        setAllMessages((prev) => [...prev, data]);
        setIsTyping(false);
      }
    };
    const onTyping = (data) => {
      if (data.chatId === selectedChatIdRef.current) setIsTyping(true);
    };
    const onStopTyping = (data) => {
      if (data.chatId === selectedChatIdRef.current) setIsTyping(false);
    };

    socket.on("receive-message", onReceiveMessage);
    socket.on("typing", onTyping);
    socket.on("stop-typing", onStopTyping);

    return () => {
      socket.off("receive-message", onReceiveMessage);
      socket.off("typing", onTyping);
      socket.off("stop-typing", onStopTyping);
    };
  }, []);

  useEffect(() => {
    if (!selectedChat?._id) return;
    setIsTyping(false);
    getMessages();
    if (selectedChat?.lastMessage?.sender !== user._id) {
      clearUnreadMessages();
    }
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [selectedChat?._id]);

  return (
    <>
      {selectedChat && (
        <div className="flex-1 flex flex-col">
          {/* ✅ Chat header — shows other person's name + online status */}
          <div className="bg-slate-900 border-b border-orange-500/20 px-6 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-orange-500/20">
                {otherMember?.firstName?.[0]?.toUpperCase()}
                {otherMember?.lastName?.[0]?.toUpperCase()}
              </div>
              {/* Online dot on avatar */}
              {isOtherOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full" />
              )}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                {otherMember?.firstName} {otherMember?.lastName}
              </p>
              {/* ✅ "Online" / "Offline" status text */}
              <p
                className={`text-xs font-medium ${isOtherOnline ? "text-green-400" : "text-gray-500"}`}
              >
                {isOtherOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-800">
            {allMessages.map((msg, index) => {
              const isCurrentUser = msg.sender === user._id;
              const msgKey = msg._id || `msg-index-${index}`;
              return (
                <div
                  key={msgKey}
                  className={`mb-4 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-lg ${
                      isCurrentUser
                        ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white"
                        : "bg-slate-700 text-white"
                    }`}
                  >
                    <p className="text-sm break-words">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <p className="text-xs opacity-70">
                        {formatTime(msg.createdAt)}
                      </p>
                      {isCurrentUser && msg.read && (
                        <img
                          src="/images/rr.png"
                          alt="seen"
                          className="w-4 h-4 object-contain"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="mb-4 flex justify-start">
                <div className="bg-slate-700 px-4 py-3 rounded-lg flex items-center gap-1.5">
                  <style>{`
                    @keyframes typingBounce {
                      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                      30% { transform: translateY(-6px); opacity: 1; }
                    }
                    .typing-dot {
                      width: 7px; height: 7px;
                      border-radius: 50%;
                      background: #f97316;
                      animation: typingBounce 1.2s infinite ease-in-out;
                    }
                    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
                    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
                  `}</style>
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-slate-900 border-t border-orange-500/20 px-6 py-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={handleTyping}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && message.trim()) sendMessage();
                }}
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-gray-400 focus:border-orange-500 focus:outline-none transition-all"
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-xl hover:from-orange-500 hover:to-amber-500 hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatArea;
