import Search from "./search";
import { useState } from "react";
import UserList from "./userList";

function SideBar({ onSelectChat }) {
  const [searchKey, setSearchKey] = useState("");

  return (
    <div className="w-80 h-full bg-slate-900 border-r border-orange-500/20 flex flex-col">
      <div className="p-4 border-b border-orange-500/20">
        <h2 className="text-white font-semibold text-lg mb-3">Messages</h2>
        <Search searchKey={searchKey} setSearchKey={setSearchKey} />
      </div>

      <UserList searchKey={searchKey} onSelectChat={onSelectChat} />
    </div>
  );
}

export default SideBar;
