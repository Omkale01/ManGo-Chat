import { createSlice } from "@reduxjs/toolkit";

const usersSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    allUsers: [],
    allChats: [],
    selectedChat: null,
    onlineUsers: [],
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setAllUsers: (state, action) => {
      state.allUsers = action.payload;
    },
    setAllChats: (state, action) => {
      state.allChats = action.payload;
    },
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    addOnlineUser: (state, action) => {
      const userId = action.payload;
      if (!state.onlineUsers.includes(userId)) {
        state.onlineUsers.push(userId);
      }
    },
    removeOnlineUser: (state, action) => {
      state.onlineUsers = state.onlineUsers.filter(
        (id) => id !== action.payload,
      );
    },

    logoutUser: (state) => {
      state.user = null;
      state.allUsers = [];
      state.allChats = [];
      state.selectedChat = null;
      state.onlineUsers = [];
    },

    updateChatOnNewMessage: (state, action) => {
      const incomingMessage = action.payload;
      const chatIndex = state.allChats.findIndex(
        (c) => c._id === incomingMessage.chatId,
      );
      if (chatIndex === -1) return;
      const chat = { ...state.allChats[chatIndex] };
      chat.lastMessage = {
        text: incomingMessage.text,
        sender: incomingMessage.sender,
        createdAt: incomingMessage.createdAt,
      };
      const isActiveChatOpen =
        state.selectedChat && state.selectedChat._id === incomingMessage.chatId;
      if (!isActiveChatOpen) {
        chat.unreadMessageCount = (chat.unreadMessageCount || 0) + 1;
      }
      const updatedChats = [...state.allChats];
      updatedChats.splice(chatIndex, 1);
      updatedChats.unshift(chat);
      state.allChats = updatedChats;
    },

    clearUnreadCount: (state, action) => {
      const chatId = action.payload;
      state.allChats = state.allChats.map((c) =>
        c._id === chatId ? { ...c, unreadMessageCount: 0 } : c,
      );
    },
  },
});

export const {
  setUser,
  setAllUsers,
  setAllChats,
  setSelectedChat,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  logoutUser,
  updateChatOnNewMessage,
  clearUnreadCount,
} = usersSlice.actions;

export default usersSlice.reducer;
