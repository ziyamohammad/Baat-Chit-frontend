import axios from "axios";
import { ArrowLeft, CircleUser, LogOut, MessageCircleMore, Send, UserPlus } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import io from "socket.io-client";
import useWindowWidth from "./useWindowWidth";

const SOCKET_URL = "https://baat-chit-backend1.onrender.com";

function Main({ loginuser }) {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const [menu, setMenu] = useState("messages");
  const [users, setUsers] = useState([]);
  const [online, setOnline] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [receiverId, setReceiverId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const socketRef = useRef(null);
  // jis reciever se baat ho rhi usko activerecieverref mein rakhenge kyuki agar state me rkhenge to hr render pe state update ho jayega
  const activeReceiverRef = useRef(null);

  // users fetch krwa rhe 
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.post(`https://baat-chit-backend1.onrender.com/api/v1/user/fetchuser`, { withCredentials: true });
        setUsers(res.data?.data || []);
      } catch (e) {
        console.error("fetch users error:", e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loginuser?._id) return;

    const socket = io(SOCKET_URL, {
      auth: { id: loginuser._id },
      transports: ["websocket"], 
    });

    socketRef.current = socket;

   
    socket.off("message-user").on("message-user", (data) => {
    });

    socket.off("onlineuser").on("onlineuser", (onlineUsers) => {
      setOnline(onlineUsers || []);
    });

    //reciever pe click krke message history aati hai jo woh state me save kr rhe taaki visible ho
    socket.off("messagehistory").on("messagehistory", (data) => {
      setMessages(Array.isArray(data) ? data : []);
    });

    // sbse naya message jo user kr rha hai reciever se
    socket.off("new-message").on("new-message", (msg) => {
      // agar active hai chat mtlb un do logo me hi chl rhi hai toh jo msg enter kr rhe usko bhi add krlo messages array me
      const me = loginuser._id;
      const active = activeReceiverRef.current;

      const isForActiveChat =
        (msg.id === me && msg.receiverId === active) || (msg.receiverId === me && msg.id === active);

      if (isForActiveChat) {
        setMessages((prev) => [...prev, msg]);
      }
      
    });

    return () => {
      
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [loginuser?._id]);


  const handleReceiverSelect = (id) => {
    setReceiverId(id);
    activeReceiverRef.current = id;
    const found = users.find((u) => u._id === id) || null;
    setReceiver(found);
    setMessages([]);

    // reciever aur user ki conversation nikaalne ke liye
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
      await axios.post(`https://baat-chit-backend1.onrender.com/api/v1/user/logout`, { withCredentials: true });
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

      
      <div className={(width<=670) && receiver?"nomessagebar":"messagebar"}>
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
            <span className="username">{(loginuser.fullname || "").toUpperCase()}</span>
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

     
      <div className={(width<=670) && (!receiver) ?"nomessage":"message"}>
        {receiver ? (
          <>
            <div className="messagehead1">
              {width<=670 && (<ArrowLeft onClick={()=>{setReceiver(null)}}/>)}
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
