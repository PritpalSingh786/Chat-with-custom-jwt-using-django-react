// src/components/UserChat.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import "./UserChat.css";
import { useSelector, useDispatch } from "react-redux";
import { fetchMessages, addMessage } from "../features/messagesSlice";
import { setCurrentChatUser } from "../features/usersSlice";

// Example: create an API fetch for single user
const fetchSingleUser = async (id, token) => {
  const res = await fetch(`http://localhost:8000/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
};

const SOCKET_SERVER_URL = "http://localhost:8000";

function UserChat() {
  const { userId } = useParams();
  const dispatch = useDispatch();

  const loggedInUserId = useSelector((state) => state.auth.user?.id);
  const token = useSelector((state) => state.auth.token);
  const userList = useSelector((state) => state.users.list);
  const currentChatUser = useSelector((state) => state.users.currentChatUser);
  const messages = useSelector((state) => state.messages.list);
  const loading = useSelector((state) => state.messages.loading);

  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);

  // If currentChatUser is not in Redux, try to find from list
  let chatUser = currentChatUser || userList.find(u => String(u.id) === String(userId));

  // If still not found, fetch from API
  useEffect(() => {
    if (!chatUser && userId && token) {
      fetchSingleUser(userId, token)
        .then(data => {
          dispatch(setCurrentChatUser(data));
        })
        .catch(err => console.error(err));
    }
  }, [chatUser, userId, token, dispatch]);

  // Fetch chat history when opening chat
  useEffect(() => {
    if (loggedInUserId && userId && token) {
      dispatch(fetchMessages({
        senderId: loggedInUserId,
        receiverId: userId,
        token
      }));
    }
  }, [dispatch, loggedInUserId, userId, token]);

  // Socket connection
  useEffect(() => {
    if (!token || !loggedInUserId) return;

    const newSocket = io(SOCKET_SERVER_URL, {
      query: { userId: loggedInUserId },
      extraHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    setSocket(newSocket);

    newSocket.emit("register_user", loggedInUserId);

    return () => {
      newSocket.disconnect();
    };
  }, [loggedInUserId, token]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (data) => {
      if (String(data.sender_id) === String(loggedInUserId)) return;
      if (
        (String(data.sender_id) === String(userId) || String(data.receiver_id) === String(userId)) &&
        (String(data.sender_id) === String(loggedInUserId) || String(data.receiver_id) === String(loggedInUserId))
      ) {
        dispatch(addMessage({
          text: data.message,
          from: "other",
          time: new Date(data.timestamp),
          senderId: data.sender_id
        }));
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket, loggedInUserId, userId, dispatch]);

  // Auto-scroll to latest message
  useEffect(() => {
    const container = document.querySelector(".messages-section");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // Send message
  const handleSend = () => {
    if (!message.trim() || !socket) return;

    const timestamp = new Date();

    dispatch(addMessage({
      text: message,
      from: "me",
      time: timestamp,
      senderId: loggedInUserId
    }));

    socket.emit("send_message", {
      sender_id: loggedInUserId,
      receiver_id: userId,
      message,
      timestamp: timestamp.toISOString()
    });

    setMessage("");
  };

  const getDisplayName = (senderId) => {
    if (String(senderId) === String(loggedInUserId)) return "You";
    const sender = userList.find(u => String(u.id) === String(senderId)) || currentChatUser;
    return sender?.userId || "User";
  };

  const formatDateTime = (date) => {
    if (!(date instanceof Date)) date = new Date(date);
    return `${date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="userchat-container">
      <h2>Chat with {chatUser?.userId || "User"}</h2>

      <div className="messages-section">
        {loading ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="no-messages">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`message-group ${msg.from === "me" ? "sent" : "received"}`}>
              <div className="message-sender">
                {getDisplayName(msg.senderId)}
                <span className="message-heading-time">{formatDateTime(msg.time)}</span>
              </div>
              <div className={`message-bubble ${msg.from === "me" ? "sent" : "received"}`}>
                <span className="message-text">{msg.text}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="send-message-section">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default UserChat;
