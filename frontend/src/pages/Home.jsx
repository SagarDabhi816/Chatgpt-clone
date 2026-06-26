import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import ChatMobileBar from "../components/chat/ChatMobileBar.jsx";
import ChatSidebar from "../components/chat/ChatSidebar.jsx";
import ChatMessages from "../components/chat/ChatMessages.jsx";
import ChatComposer from "../components/chat/ChatComposer.jsx";
import "../components/chat/ChatLayout.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  startNewChat,
  selectChat,
  setInput,
  sendingStarted,
  sendingFinished,
  setChats,
} from "../store/chatSlice.js";

const Home = () => {
  const dispatch = useDispatch();
  const chats = useSelector((state) => state.chat.chats);
  const activeChatId = useSelector((state) => state.chat.activeChatId);
  const input = useSelector((state) => state.chat.input);
  const isSending = useSelector((state) => state.chat.isSending);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  const activeChatIdRef = useRef(activeChatId);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const [messages, setMessages] = useState([]);

  const handleNewChat = async () => {
    // Prompt user for title of new chat, fallback to 'New Chat'
    let title = window.prompt("Enter a title for the new chat:", "");
    if (title) title = title.trim();
    if (!title) return;

    try {
      const response = await api.post("/chat/", { title });
      getMessages(response.data.chat._id);
      dispatch(startNewChat(response.data.chat));
      setSidebarOpen(false);
    } catch (err) {
      console.error("Failed to create new chat:", err);
    }
  };

  // Ensure at least one chat exists initially
  useEffect(() => {
    api
      .get("/chat/")
      .then((response) => {
        dispatch(setChats(response?.data?.chats?.reverse()));
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          navigate("/login", { replace: true });
        } else {
          console.error(err);
        }
      });

    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const tempSocket = io(socketUrl, {
      withCredentials: true,
    });
    tempSocket.on("ai-response", (messagePayload) => {
      if (messagePayload.chat !== activeChatIdRef.current) {
        dispatch(sendingFinished());
        return;
      }
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          type: "ai",
          content: messagePayload.content,
        },
      ]);

      dispatch(sendingFinished());
    });

    socketRef.current = tempSocket;

    return () => {
      tempSocket.disconnect();
    };
  }, [navigate, dispatch]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || !activeChatId || isSending) return;
    dispatch(sendingStarted());

    const newMessages = [
      ...messages,
      {
        type: "user",
        content: trimmed,
      },
    ];

    setMessages(newMessages);
    dispatch(setInput(""));

    socketRef.current?.emit("ai-message", {
      chat: activeChatId,
      content: trimmed,
    });
  };

  const getMessages = async (chatId) => {
    try {
      const response = await api.get(`/chat/messages/${chatId}`);
      setMessages(
        response.data?.messages?.map((m) => ({
          type: m.role === "user" ? "user" : "ai",
          content: m.content,
        })),
      );
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  return (
    <div className="chat-layout minimal">
      <ChatMobileBar
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        onNewChat={handleNewChat}
      />
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          dispatch(selectChat(id));
          setSidebarOpen(false);
          getMessages(id);
        }}
        onNewChat={handleNewChat}
        open={sidebarOpen}
      />
      <main className="chat-main " role="main">
        {messages.length === 0 && (
          <div className="chat-welcome" aria-hidden="true">
            <div className="chip">Early Preview</div>
            <h1>ChatGPT Clone </h1>
            <p>
              Ask anything. Paste text, brainstorm ideas, or get quick
              explanations. Your chats stay in the sidebar so you can pick up
              where you left off.
            </p>
          </div>
        )}
        <ChatMessages messages={messages} isSending={isSending} />
        {activeChatId && (
          <ChatComposer
            input={input}
            setInput={(v) => dispatch(setInput(v))}
            onSend={sendMessage}
            isSending={isSending}
          />
        )}
      </main>
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;
