import "./ChatSidebar.css";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaRegPenToSquare } from "react-icons/fa6";
import { removeChat } from "../../store/chatSlice";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";

const ChatSidebar = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  open,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // ignore errors, still redirect
      console.error("Logout error", err);
    }
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={`chat-sidebar sm:mt-2 mt-12  ${open ? "open" : ""}`}
      aria-label="Previous chats"
    >
      <div className="sidebar-header">
        <img src="src/assets/chatgpt-icon.svg" width={32} alt="Logo" />

        <button
          className="logout-btn"
          onClick={handleLogout}
          aria-label="Logout"
        >
          Logout
        </button>
      </div>

      <div className="sidebar-top">
        <button className="mt-2 flex items-center gap-2" onClick={onNewChat}>
          <FaRegPenToSquare />
          New Chat
        </button>
      </div>

      <nav className="chat-list" aria-live="polite">
        <h4>Recents</h4>

        {chats?.map((c,i) => (
          <div
          key={i}
            className={`flex my-2 p-1 rounded-md  ${
              c._id === activeChatId
                ? "active bg-[#1A1A1A]"
                : "hover:bg-[#1A1A1A]"
            }`}
          >
            <button
              key={c._id}
              className={`flex gap-4 w-full text-left py-1 rounded-md 
        `}
              onClick={() => onSelectChat(c._id)}
            >
              <span className=" text-sm">{c.title}</span>
            </button>

            <button
              key={i}
              className="text-red-500 hover:text-red-700 px-3"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the parent button's onClick
                api
                  .delete(`/chat/${c._id}`)
                  .then(() => {
                      dispatch(removeChat(c._id));

                    Swal.fire({
                              icon: "success",
                              title: "Chat Deleted Successfully",
                              text: "The chat has been deleted.",
                              confirmButtonText: "OK",
                            });
                    // Optionally, you can refresh the chat list or remove the deleted chat from state
                  })
                  .catch((err) => {
                    console.error("Error deleting chat:", err);
                  });
              }}
            >
              <FaRegTrashAlt className="text-red-800" />
            </button>
          </div>
        ))}

        {chats?.length === 0 && <p className="empty-hint">No chats yet.</p>}
      </nav>
    </aside>
  );
};

export default ChatSidebar;
