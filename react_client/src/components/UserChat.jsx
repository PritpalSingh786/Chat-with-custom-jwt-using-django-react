import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessages, addMessage } from "../features/messagesSlice";
import { setCurrentChatUser } from "../features/usersSlice";
import "./UserChat.css";

/* ---------------- API to fetch single user (fallback) ---------------- */
const fetchSingleUser = async (id, token) => {
  const res = await fetch(`http://localhost:8000/users/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
};

const WS_BASE_URL = "ws://localhost:8000/ws/commonsocket";

function UserChat() {
  const { userId } = useParams(); // receiverId
  const dispatch = useDispatch();

  /* ---------------- Redux State ---------------- */
  const loggedInUserId = useSelector((state) => state.auth.user?.id);
  const token = useSelector((state) => state.auth.token);

  const userList = useSelector((state) => state.users.list);
  const currentChatUser = useSelector(
    (state) => state.users.currentChatUser
  );

  const messages = useSelector((state) => state.messages.list);
  const loading = useSelector((state) => state.messages.loading);

  /* ---------------- Local State ---------------- */
  const [message, setMessage] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  /* ---------------- Find chat user ---------------- */
  let chatUser =
    currentChatUser ||
    userList.find((u) => String(u.id) === String(userId));

  /* ---------------- Fetch chat user if missing ---------------- */
  useEffect(() => {
    if (!chatUser && userId && token) {
      fetchSingleUser(userId, token)
        .then((data) => dispatch(setCurrentChatUser(data)))
        .catch(console.error);
    }
  }, [chatUser, userId, token, dispatch]);

  /* ---------------- Fetch chat history ---------------- */
  useEffect(() => {
    if (loggedInUserId && userId && token) {
      dispatch(
        fetchMessages({
          senderId: loggedInUserId,
          receiverId: userId,
          token,
        })
      );
    }
  }, [dispatch, loggedInUserId, userId, token]);

  /* ---------------- WebSocket Connection ---------------- */
  useEffect(() => {
    if (!loggedInUserId) return;

    const socket = new WebSocket(
      `${WS_BASE_URL}/${loggedInUserId}/`
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // accept only current chat messages
      const isCurrentChat =
        (String(data.senderId) === String(loggedInUserId) &&
          String(data.receiverId) === String(userId)) ||
        (String(data.senderId) === String(userId) &&
          String(data.receiverId) === String(loggedInUserId));

      if (!isCurrentChat) return;

      dispatch(
        addMessage({
          text: data.message,
          from:
            String(data.senderId) === String(loggedInUserId)
              ? "me"
              : "other",
          time: data.timestamp,
          senderId: data.senderId,
        })
      );
    };

    socket.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => socket.close();
  }, [loggedInUserId, userId, dispatch]);

  /* ---------------- Auto Scroll ---------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- Send Message ---------------- */
  const handleSend = () => {
    if (!message.trim() || !socketRef.current) return;

    socketRef.current.send(
      JSON.stringify({
        senderId: loggedInUserId,
        receiverId: userId,
        message,
      })
    );

    setMessage("");
  };

  /* ---------------- Helpers ---------------- */
  const formatDateTime = (date) =>
    new Date(date).toLocaleString();

  const getSenderName = (senderId) => {
    if (String(senderId) === String(loggedInUserId)) return "You";
    return chatUser?.userId || "User";
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="userchat-container">
      <h2>Chat with {chatUser?.userId || userId}</h2>

      <div className="messages-section">
        {loading ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="no-messages">No messages yet</p>
        ) : (
          messages.map((msg) => (
            <div
              key={`${msg.senderId}-${msg.time}`}
              className={`message-group ${
                msg.from === "me" ? "sent" : "received"
              }`}
            >
              <div className="message-sender">
                {getSenderName(msg.senderId)}
                <span className="message-time">
                  {formatDateTime(msg.time)}
                </span>
              </div>

              <div
                className={`message-bubble ${
                  msg.from === "me" ? "sent" : "received"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}

        {/* scroll anchor */}
        <div ref={messagesEndRef} />
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
