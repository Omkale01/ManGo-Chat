import { useDispatch, useSelector } from "react-redux";
import ChatArea from "./components/chat";
import Header from "./components/header";
import SideBar from "./components/sidebar";
import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import {
  updateChatOnNewMessage,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
} from "../../redux/usersSlice";

function Home() {
  const dispatch = useDispatch();
  const { selectedChat, user } = useSelector((state) => state.userReducer);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const selectedChatRef = useRef(selectedChat);
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    if (!socket.connected) socket.connect();
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    const joinUserRoom = () => socket.emit("join-room", user._id);
    if (socket.connected) joinUserRoom();
    socket.on("connect", joinUserRoom);
    return () => socket.off("connect", joinUserRoom);
  }, [user?._id]);

  useEffect(() => {
    const onReceiveMessage = (data) => dispatch(updateChatOnNewMessage(data));
    const onOnlineUsers = (userIds) => dispatch(setOnlineUsers(userIds));
    const onUserOnline = (userId) => dispatch(addOnlineUser(userId));
    const onUserOffline = (userId) => dispatch(removeOnlineUser(userId));

    socket.on("receive-message", onReceiveMessage);
    socket.on("online-users", onOnlineUsers);
    socket.on("user-online", onUserOnline);
    socket.on("user-offline", onUserOffline);

    return () => {
      socket.off("receive-message", onReceiveMessage);
      socket.off("online-users", onOnlineUsers);
      socket.off("user-online", onUserOnline);
      socket.off("user-offline", onUserOffline);
    };
  }, []);

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <div className="flex-1 flex overflow-hidden">
       
        <div
          className={`
            flex-shrink-0 h-full
            transition-all duration-300 ease-in-out overflow-hidden
            ${sidebarOpen ? "w-80" : "w-0"}
          `}
        >
          <SideBar onSelectChat={() => {}} />
        </div>

        {/* Chat area — always full height, always clickable */}
        <div className="flex-1 flex overflow-hidden min-w-0">
          {selectedChat ? (
            <ChatArea />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-800 gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">
                Select a chat to start messaging
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
