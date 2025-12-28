import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers, setCurrentChatUser } from "../features/usersSlice";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./ChatPage.css";

function ChatPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const {
    list,
    loading,
    error,
    page,
    perPage,
    hasNext,
    hasPrev,
    currentChatUser,
  } = useSelector((state) => state.users);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    dispatch(fetchUsers({ page: 1, perPage }));
  }, [dispatch, user, perPage, navigate]);

  const handleNext = () => {
    if (hasNext) {
      dispatch(fetchUsers({ page: page + 1, perPage }));
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      dispatch(fetchUsers({ page: page - 1, perPage }));
    }
  };

  if (!user) return null;

  return (
    <div
      className="chatpage-container"
      style={{ display: "flex", gap: "1rem" }}
    >
      {/* USERS LIST */}
      <div style={{ flex: "1 1 300px" }}>
        <h3>Welcome, {user.userId}</h3>

        {loading && <p>Loading users...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <ul className="users-list">
          {list.map((u) => (
            <li key={u.id}>
              <Link
                to={`${u.id}`}
                onClick={() => dispatch(setCurrentChatUser(u))}
              >
                {u.userId}
              </Link>
            </li>
          ))}
        </ul>

        {/* PAGINATION (HIDDEN IF NOT NEEDED) */}
        {(hasNext || hasPrev) && (
          <div className="pagination-controls">
            <button
              onClick={handlePrev}
              disabled={!hasPrev}
              style={{
                backgroundColor: "#8000ff",
                color: "white",
                padding: "6px 12px",
                border: "none",
                borderRadius: "4px",
              }}
            >
              ⬅ Previous
            </button>

            <span style={{ margin: "0 10px" }}>Page {page}</span>

            <button
              onClick={handleNext}
              disabled={!hasNext}
              style={{
                backgroundColor: "#8000ff",
                color: "white",
                padding: "6px 12px",
                border: "none",
                borderRadius: "4px",
              }}
            >
              Next ➡
            </button>
          </div>
        )}
      </div>

      {/* CHAT AREA */}
      <div
        style={{
          flex: "2 1 600px",
          borderLeft: "1px solid #ccc",
          paddingLeft: "1rem",
        }}
      >
        {currentChatUser ? <Outlet /> : <p>Select a user to start chat</p>}
      </div>
    </div>
  );
}

export default ChatPage;
