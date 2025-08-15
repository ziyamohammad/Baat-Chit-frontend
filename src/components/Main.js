import axios from "axios";
import { CircleUser, LogOut, MessageCircleMore, Send, UserPlus } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import io from "socket.io-client";

const SOCKET_URL = "https://baat-chit-backend1.onrender.com";
const API_URL = "https://baat-chit-backend1.onrender.com";

function Main({ loginuser }) {
  const navigate = useNavigate();

  // UI state
  const [menu, setMenu] = useState("messages");
  const [users, setUsers] = useState([]);
  const [online, setOnline] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [receiverId, setReceiverId] = useState(null);

  // Chat state (single source of truth)
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Socket
  const socketRef = useRef(null);
  // Keep latest receiver id in a ref to avoid stale closures in listeners
  const activeReceiverRef = useRef(null);

  // ---------- Fetch users once ----------
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.post(`${API_URL}/api/v1/user/fetchuser`, { withCredentials: true });
        setUsers(res.data?.data || []);
      } catch (e) {
        console.error("fetch users error:", e);
      }
    })();
  }, []);

  // ---------- Init socket only once ----------
  useEffect(() => {
    if (!loginuser?._id) return;

    const socket = io(SOCKET_URL, {
      auth: { id: loginuser._id },
      transports: ["websocket"], // helps reduce duplicate connects from polling upgrades
    });

    socketRef.current = socket;

    // Ensure clean listeners: off -> on
    socket.off("message-user").on("message-user", (data) => {
      // console.log("you are:", data);
    });

    socket.off("onlineuser").on("onlineuser", (onlineUsers) => {
      setOnline(onlineUsers || []);
    });

    // This will be emitted by server when you request history (selectReceiver)
    socket.off("messagehistory").on("messagehistory", (data) => {
      setMessages(Array.isArray(data) ? data : []);
    });

    // New incoming message (to sender & receiver)
    socket.off("new-message").on("new-message", (msg) => {
      // Show in chat window only if it's for the currently open conversation
      const me = loginuser._id;
      const active = activeReceiverRef.current;

      const isForActiveChat =
        (msg.id === me && msg.receiverId === active) || (msg.receiverId === me && msg.id === active);

      if (isForActiveChat) {
        setMessages((prev) => [...prev, msg]);
      }
      // else: you could update a conversation list badge here
    });

    return () => {
      // clean up on unmount
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [loginuser?._id]);

  // ---------- When user opens a chat ----------
  const handleReceiverSelect = (id) => {
    setReceiverId(id);
    activeReceiverRef.current = id;
    const found = users.find((u) => u._id === id) || null;
    setReceiver(found);

    // Reset current chat messages (optional UX)
    setMessages([]);

    // Ask server for this conversation history
    if (socketRef.current) {
      socketRef.current.emit("reciever-id", id);
      socketRef.current.emit("selectReceiver", { id: loginuser._id, receiverId: id });
    }
  };

  // Keep ref in sync
  useEffect(() => {
    activeReceiverRef.current = receiverId || null;
  }, [receiverId]);

  // ---------- Send message ----------
  const handleSendMessage = () => {
    if (!input.trim()) return;
    if (!receiverId) {
      toast.info("Select a user to chat with.");
      return;
    }
    // Don't optimistically push; rely on single server event to avoid duplicates
    socketRef.current?.emit("send-message", {
      text: input.trim(),
      receiverId,
    });
    setInput("");
  };

  // ---------- Logout ----------
  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/v1/user/logout`, { withCredentials: true });
      localStorage.removeItem("loginuser");
      toast.success("User Logged Out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  return (
    <div className="main">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="upper">
          <MessageCircleMore fill="#ACABAB" size="30px" onClick={() => setMenu("messages")} />
          <UserPlus fill="#ACABAB" size="30px" onClick={() => setMenu("allusers")} />
        </div>
        <div className="lower">
          <CircleUser fill="#ACABAB" size="30px" onClick={() => setMenu("profile")} />
          <LogOut fill="#ACABAB" size="30px" onClick={handleLogout} />
        </div>
      </div>

      {/* Middle list column */}
      <div className="messagebar">
        {menu === "messages" && <h2 className="messagehead">Messages</h2>}

        {menu === "allusers" && (
          <>
            <h2 className="messagehead">All Users</h2>
            {users.map((u) => {
              const isOnline = online.includes(u._id);
              return (
                <div key={u._id} className="allusers" onClick={() => handleReceiverSelect(u._id)}>
                  <div className="coverimage" style={{ position: "relative" }}>
                    <img src={u.image} alt="/" height="100%" width="100%" />
                    {isOnline && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: "11px",
                          left: "10px",
                          width: "14px",
                          height: "14px",
                          backgroundColor: "green",
                          borderRadius: "50%",
                          border: "2px solid white",
                        }}
                      />
                    )}
                  </div>
                  <div className="messagename">
                    <span className="username">{u.fullname}</span>
                    <span className="recentchats">hello how are you</span>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {menu === "profile" && (
          <div className="userprofile">
            <h2 className="messagehead">Profile</h2>
            <div className="userimage">
              <img src={loginuser.image} alt="/" height="100%" width="100%" />
            </div>
            <span className="username">{String(loginuser.fullname || "").toUpperCase()}</span>
            <div className="parentemail">
              <span className="useremailhead">E-mail</span>
              <span className="useremail">{loginuser.email}</span>
            </div>
            <div className="parentphone">
              <span className="useremailhead">Phone Number</span>
              <span className="userphone">{loginuser.phone}</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat pane */}
      <div className="message">
        {receiver ? (
          <>
            <div className="messagehead1">
              <div className="coverimage">
                <img src={receiver.image} alt="/" height="100%" width="100%" />
              </div>
              <div className="messagename">
                <span className="username">{String(receiver.fullname || "").toUpperCase()}</span>
              </div>
            </div>

            <div className="chatsdiv">
              {messages.map((m) => (
                <p
                  key={m._id || `${m.id}-${m.createdAt || Math.random()}`}
                  className={m.id === loginuser._id ? "sendersidechats" : "recieversidechats"}
                >
                  {m.text}
                </p>
              ))}
            </div>

            <div className="messages">
              <input
                type="text"
                value={input}
                placeholder="Enter your message here"
                className="chat"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
              />
              <Send onClick={handleSendMessage} style={{ cursor: "pointer" }} />
            </div>
          </>
        ) : (
          <div className="empty-chat" style={{ padding: 24, color: "#666" }}>
            Select a user to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}

export default Main;
