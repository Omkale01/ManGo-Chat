import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../redux/usersSlice";
import { socket } from "../../../socket";

function Header({ sidebarOpen, onToggleSidebar }) {
  const { user } = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fullName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

 
  const handleLogout = () => {
    localStorage.removeItem("token");
    socket.disconnect();
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <div className="bg-slate-900 border-b border-orange-500/20 px-6 py-4 sticky top-0 z-40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left — Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-gray-400 hover:text-orange-400 hover:bg-slate-800 transition-all"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-orange-500/10 rounded-lg p-1.5">
              <img
                src="/images/mango.png"
                alt="ManGo Chat Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold text-white">ManGo Chat</span>
          </div>
        </div>

        {/* Right — User name + avatar + logout button */}
        <div className="flex items-center gap-2">
          {/* Name + avatar */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="text-right hidden sm:block">
              <div className="text-white text-sm font-medium">
                {fullName || "USER"}
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg shadow-orange-500/30">
              {initials || "U"}
            </div>
          </div>

          {/* ✅ Logout button — sits right next to the avatar */}
          <button
            onClick={handleLogout}
            title="Logout"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="text-sm font-medium hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Header;
