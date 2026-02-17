import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { createNewChat } from "../../../apiCalls/chats";
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import {
  setAllChats,
  setSelectedChat,
  clearUnreadCount,
} from "../../../redux/usersSlice";

function UserList({ searchKey, onSelectChat }) {
  const {
    allUsers,
    allChats,
    user: currentUser,
    selectedChat,
    onlineUsers,
  } = useSelector((state) => state.userReducer);

  const dispatch = useDispatch();

  const startNewChat = async (searchedUserId) => {
    let response = null;
    try {
      dispatch(showLoader());
      response = await createNewChat([currentUser._id, searchedUserId]);
      dispatch(hideLoader());
      if (response.success) {
        toast.success(response.message);
        const newChat = response.data;
        dispatch(setAllChats([...allChats, newChat]));
        dispatch(setSelectedChat(newChat));
        if (onSelectChat) onSelectChat();
      }
    } catch (err) {
      dispatch(hideLoader());
      toast.error(response.message);
    }
  };

  const openChat = (searchedUserId) => {
    const chat = allChats.find(
      (chat) =>
        chat.members.map((m) => m._id).includes(currentUser._id) &&
        chat.members.map((m) => m._id).includes(searchedUserId),
    );
    if (chat) {
      dispatch(clearUnreadCount(chat._id));
      dispatch(setSelectedChat(chat));
      if (onSelectChat) onSelectChat();
    }
  };

  const isUserSelected = (userId) => {
    if (!selectedChat) return false;
    return selectedChat.members.map((m) => m._id).includes(userId);
  };

  // ✅ Check if a user is online
  const isOnline = (userId) => onlineUsers?.includes(userId);

  const getSortTime = (userId) => {
    const chat = allChats.find((chat) =>
      chat.members.map((m) => m._id).includes(userId),
    );
    if (!chat?.lastMessage?.createdAt) return 0;
    return new Date(chat.lastMessage.createdAt).getTime();
  };

  const filteredUsers = allUsers
    .filter((user) => {
      return (
        ((user.firstName.toLowerCase().includes(searchKey.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchKey.toLowerCase())) &&
          searchKey) ||
        allChats.some((chat) =>
          chat.members.map((m) => m._id).includes(user._id),
        )
      );
    })
    .sort((a, b) => getSortTime(b._id) - getSortTime(a._id));

  const getLastMessage = (userId) => {
    const chat = allChats.find((chat) =>
      chat.members.map((m) => m._id).includes(userId),
    );
    if (!chat || !chat.lastMessage) return "";
    const msgPrefix =
      chat?.lastMessage?.sender === currentUser._id ? "You: " : "";
    return msgPrefix + chat?.lastMessage?.text?.substring(0, 25);
  };

  const getUnreadMessageCount = (userId) => {
    const chat = allChats.find((chat) =>
      chat.members.map((m) => m._id).includes(userId),
    );
    if (
      chat &&
      chat.unreadMessageCount &&
      chat.lastMessage?.sender !== currentUser._id
    ) {
      return chat.unreadMessageCount;
    }
    return 0;
  };

  const getLastMessageTime = (userId) => {
    const chat = allChats.find((chat) =>
      chat.members.map((m) => m._id).includes(userId),
    );
    if (!chat || !chat.lastMessage || !chat.lastMessage.createdAt) return "";

    const messageDate = new Date(chat.lastMessage.createdAt);
    const now = new Date();
    const diffInMs = now - messageDate;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    return messageDate.toLocaleDateString();
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {filteredUsers.map((user) => {
        const isSelected = isUserSelected(user._id);
        const unreadCount = getUnreadMessageCount(user._id);
        const online = isOnline(user._id);

        return (
          <div
            key={user?._id || user?.id}
            className={`px-4 py-3 cursor-pointer transition-colors border-l-2 ${
              isSelected
                ? "bg-slate-800 border-orange-500"
                : "border-transparent hover:bg-slate-800 hover:border-orange-500"
            }`}
          >
            <div
              className="flex items-center gap-3"
              onClick={() => openChat(user._id)}
            >
              {/* Avatar with online dot */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg shadow-orange-500/20">
                  {user.firstName[0].toUpperCase()}
                  {user.lastName[0].toUpperCase()}
                </div>
                {/* ✅ Green online dot — only shown when user is online */}
                {online && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full" />
                )}
              </div>

              {/* User Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <div className="flex items-center gap-2">
                    <div className="text-white font-medium text-sm truncate">
                      {user.firstName} {user.lastName}
                    </div>
                    {/* ✅ "Online" text label next to name */}
                    {online && (
                      <span className="text-green-400 text-xs font-medium">
                        Online
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400 text-xs whitespace-nowrap flex-shrink-0">
                    {getLastMessageTime(user._id)}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`text-xs truncate flex-1 ${
                      unreadCount > 0
                        ? "text-white font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {getLastMessage(user._id) || user.email}
                  </div>
                  {unreadCount > 0 && (
                    <div className="bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </div>
                  )}
                </div>
              </div>

              {/* Start Chat Button */}
              {!allChats.find((chat) =>
                chat.members.map((m) => m._id).includes(user._id),
              ) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startNewChat(user._id);
                  }}
                  className="px-4 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-semibold rounded-lg hover:from-orange-500 hover:to-amber-500 hover:shadow-lg hover:shadow-orange-500/30 transform hover:scale-105 active:scale-95 transition-all"
                >
                  Start Chat
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default UserList;
