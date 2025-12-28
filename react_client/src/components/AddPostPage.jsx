import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../features/usersSlice";
import { createPost, resetState } from "../features/postsSlice";
import { addNotification } from "../features/notificationsSlice";
import "./AddPostPage.css";

function AddPostPage() {
  const dispatch = useDispatch();

  /* ================= REDUX STATE ================= */
  const {
    list: users,
    page,
    total,
    hasNext,
    hasPrev,
    loading: usersLoading,
    error: usersError,
  } = useSelector((state) => state.users);

  const {
    loading: postLoading,
    error: postError,
    success: postSuccess,
  } = useSelector((state) => state.posts);

  const notifications =
    useSelector((state) => state.notifications.notifications) || [];

  const loggedInUserId = useSelector((state) => state.auth.user?.id);

  /* ================= LOCAL STATE ================= */
  const [title, setTitle] = useState("");
  const [invitedUsers, setInvitedUsers] = useState([]);

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    dispatch(fetchUsers({ page: 1, perPage: 5 }));
  }, [dispatch]);

  /* ================= RESET POST STATE ================= */
  useEffect(() => {
    if (postSuccess || postError) {
      const timer = setTimeout(() => {
        dispatch(resetState());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [postSuccess, postError, dispatch]);

  /* ================= WEBSOCKET ================= */
  useEffect(() => {
    if (!loggedInUserId) return;

    const socket = new WebSocket(
      `ws://localhost:8000/ws/commonsocket/${loggedInUserId}/`
    );

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      dispatch(
        addNotification({
          id: `${Date.now()}-${Math.random()}`,
          notifyTextMessage: data.message,
          createdAt: new Date().toISOString(),
          read: false,
        })
      );
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => socket.close();
  }, [loggedInUserId, dispatch]);

  /* ================= HANDLERS ================= */
  const handleCheckboxChange = (userId) => {
    setInvitedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Post title is required");
      return;
    }

    if (invitedUsers.length === 0) {
      alert("Please select at least one user");
      return;
    }

    if (invitedUsers.length > 5) {
      alert("Maximum 5 users allowed");
      return;
    }

    dispatch(
      createPost({
        postTitle: title,
        invitedPostUsers: invitedUsers, // ✅ BACKEND MATCH
      })
    );

    setTitle("");
    setInvitedUsers([]);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1) {
      dispatch(fetchUsers({ page: newPage, perPage: 5 }));
    }
  };

  /* ================= UI ================= */
  return (
    <div className="add-post-container">
      <h2 className="add-post-title">Create New Post</h2>

      {/* ================= FORM ================= */}
      <form className="post-form" onSubmit={handleSubmit}>
        {/* ---- TITLE ---- */}
        <div className="form-group">
          <label className="form-label">Post Title</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
          />
        </div>

        {/* ---- USERS LIST ---- */}
        <div className="form-group">
          <p className="form-label">
            Invite Users{" "}
            {total > 0 && `(Page ${page} of ${Math.ceil(total / 5)})`}
          </p>

          {usersLoading && <p>Loading users...</p>}
          {usersError && <p style={{ color: "red" }}>{usersError}</p>}
          {!usersLoading && users.length === 0 && <p>No users found</p>}

          <div className="users-list">
            {users.map((user) => (
              <div
                key={user.id}
                className={`user-item ${
                  invitedUsers.includes(user.id) ? "selected" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={invitedUsers.includes(user.id)}
                  onChange={() => handleCheckboxChange(user.id)}
                />
                <span>{user.userId}</span>
              </div>
            ))}
          </div>

          {/* ---- PAGINATION ---- */}
          <div className="pagination-controls">
            <button
              type="button"
              disabled={!hasPrev || usersLoading}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </button>

            <button
              type="button"
              disabled={!hasNext || usersLoading}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </button>
          </div>

          <p className="pagination-info">
            Showing {users.length} of {total}
          </p>
        </div>

        {/* ---- CREATE POST BUTTON ---- */}
        <div className="form-group">
          <button
            type="submit"
            className="submit-btn"
            disabled={postLoading}
            style={{
              backgroundColor: postLoading ? "#6c757d" : "#28a745",
              color: "#fff",
              padding: "10px",
              width: "100%",
              border: "none",
              cursor: postLoading ? "not-allowed" : "pointer",
            }}
          >
            {postLoading ? "Creating Post..." : "Create Post"}
          </button>

          {postSuccess && (
            <p style={{ color: "green", marginTop: "10px", textAlign: "center" }}>
              Post created successfully!
            </p>
          )}

          {postError && (
            <p style={{ color: "red", marginTop: "10px", textAlign: "center" }}>
              {postError}
            </p>
          )}
        </div>
      </form>

      {/* ================= NOTIFICATIONS ================= */}
      <div className="notifications-section">
        <h3>Recent Notifications</h3>

        {notifications.length === 0 ? (
          <p>No notifications yet</p>
        ) : (
          notifications.slice(0, 5).map((n) => (
            <div
              key={n.id}
              className={`notification-card ${n.read ? "" : "unread"}`}
            >
              <p>{n.notifyTextMessage}</p>
              <small>{new Date(n.createdAt).toLocaleString()}</small>

              <div className="notification-actions">
                <button className="accept-btn">Accept</button>
                <button className="decline-btn">Decline</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AddPostPage;
