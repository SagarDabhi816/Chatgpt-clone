import React, { useEffect } from "react";
import "./ChatSidebar.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ChatSidebar = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  open,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    axios
      .get("https://chatgpt-clone-6ihx.onrender.com/api/chat/", {
        withCredentials: true,
      })
      .catch((err) => {
        if (mounted) {
          // Redirect on any error (401 or network/CORS issues) to ensure unauthenticated users are sent to login
          navigate("/login", { replace: true });
        }
      });

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://chatgpt-clone-6ihx.onrender.com/api/auth/logout",
        {},
        { withCredentials: true },
      );
    } catch (err) {
      // ignore errors, still redirect
      console.error("Logout error", err);
    }
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={"chat-sidebar " + (open ? "open" : "")}
      aria-label="Previous chats"
    >
      <div className="sidebar-header">
        <img src="src/assets/chatgpt.png" width={40} alt="" />
        <button
          className="logout-btn"
          onClick={handleLogout}
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
      <nav className="chat-list" aria-live="polite">
        <button className="newchatbtn" onClick={onNewChat}>
          New Chat
        </button>
        <h4>Recents</h4>
        {chats?.map((c) => (
          <button
            key={c._id}
            className={
              "chat-list-item " + (c._id === activeChatId ? "active" : "")
            }
            onClick={() => onSelectChat(c._id)}
          >
            <span className="title-line">{c.title}</span>
          </button>
        ))}
        {chats?.length === 0 && <p className="empty-hint">No chats yet.</p>}
      </nav>
    </aside>
  );
};

export default ChatSidebar;
