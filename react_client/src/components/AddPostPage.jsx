import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers } from "../features/usersSlice";
import { createPost, resetState } from "../features/postsSlice";
import { io } from "socket.io-client";
import { addNotification } from "../features/notificationsSlice";
import "./AddPostPage.css";

function AddPostPage() {
  const dispatch = useDispatch();
  const { list: users, page, total, hasNext, hasPrev, loading, error } = useSelector(
    (state) => state.users
  );
  const { loading: postLoading, error: postError, success: postSuccess } = useSelector(
    (state) => state.posts
  );
  const loggedInUserId = useSelector((state) => state.auth.user?.id);
  const notifications = useSelector((state) => state.notifications.notifications || []);

  const [title, setTitle] = useState("");
  const [invitedUsers, setInvitedUsers] = useState([]);

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, perPage: 5 }));
  }, [dispatch]);

  useEffect(() => {
    if (postSuccess || postError) {
      const timer = setTimeout(() => {
        dispatch(resetState());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [postSuccess, postError, dispatch]);

  useEffect(() => {
    if (!loggedInUserId) return;

    const socket = io("http://localhost:8000", {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      socket.emit("register_user", loggedInUserId);
    });

    socket.on("send_notification_to_invitedUsers", (data) => {
      dispatch(addNotification({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        notifyTextMessage: data.message,
        invited_user_ids: data.invited_user_ids || [],
        createdAt: new Date().toISOString(),
        read: false
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [loggedInUserId, dispatch]);

  const handleCheckboxChange = (userId) => {
    setInvitedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Post title is required");
    if (invitedUsers.length === 0) return alert("Please select at least one user");
    if (invitedUsers.length > 5) return alert("Maximum 5 users allowed");

    dispatch(createPost({ postTitle: title, invited_ids: invitedUsers }));
    setTitle("");
    setInvitedUsers([]);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1) dispatch(fetchUsers({ page: newPage, perPage: 5 }));
  };

  return (
    <div className="add-post-container">
      <h2 className="add-post-title">Create New Post</h2>

      <form className="post-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="title">Post Title:</label>
          <input
            type="text"
            id="title"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter post title"
          />
        </div>

        <div className="form-group">
          <p className="form-label">Invite Users {total > 0 && `(Page ${page} of ${Math.ceil(total/5)})`}</p>
          
          {loading && <p>Loading users...</p>}
          {error && <p style={{ color: "#dc3545" }}>{error}</p>}
          {!loading && users.length === 0 && <p>No users found.</p>}

          <div className="users-list">
            {users.map((user) => (
              <div 
                key={user.id}
                className={`user-item ${invitedUsers.includes(user.id) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  id={`user-${user.id}`}
                  className="user-checkbox"
                  checked={invitedUsers.includes(user.id)}
                  onChange={() => handleCheckboxChange(user.id)}
                />
                <label htmlFor={`user-${user.id}`} className="user-label">
                  {user.userId}
                </label>
              </div>
            ))}
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-btn"
              onClick={() => handlePageChange(page - 1)}
              disabled={!hasPrev || loading}
              style={{ background: !hasPrev || loading ? '#e9ecef' : '#007bff', color: !hasPrev || loading ? '#6c757d' : '#fff' }}
            >
              Previous
            </button>
            <button
              type="button"
              className="pagination-btn"
              onClick={() => handlePageChange(page + 1)}
              disabled={!hasNext || loading}
              style={{ background: !hasNext || loading ? '#e9ecef' : '#007bff', color: !hasNext || loading ? '#6c757d' : '#fff' }}
            >
              Next
            </button>
          </div>
          <p className="pagination-info">Showing {users.length} of {total} users</p>
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={postLoading}
          style={{ background: postLoading ? '#6c757d' : '#28a745' }}
        >
          {postLoading ? 'Creating Post...' : 'Create Post'}
        </button>

        {postSuccess && <p style={{ color: "#28a745", textAlign: "center", marginTop: "1rem" }}>Post created successfully!</p>}
        {postError && <p style={{ color: "#dc3545", textAlign: "center", marginTop: "1rem" }}>{postError}</p>}
      </form>

      <div className="notifications-section">
        <h3 style={{ marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid #dee2e6" }}>
          Recent Notifications
        </h3>
        
        {notifications.length === 0 ? (
          <p style={{ textAlign: "center", padding: "1rem" }}>No notifications yet</p>
        ) : (
          <div>
            {notifications.slice(0, 5).map((notification) => (
              <div 
                key={notification.id}
                className={`notification-card ${notification.read ? '' : 'unread'}`}
              >
                <div className={`notification-message ${notification.read ? '' : 'unread'}`}>
                  {notification.notifyTextMessage}
                </div>
                <div className="notification-time">
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
                {notification.invited_user_ids && notification.invited_user_ids.length > 0 && (
                  <div className="notification-actions">
                    <button className="action-btn accept-btn">Accept</button>
                    <button className="action-btn decline-btn">Decline</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddPostPage;