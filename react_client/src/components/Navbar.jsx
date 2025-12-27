import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaBell, FaTimes, FaCheck, FaTimesCircle } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchNotifications,
  setPage,
  markNotificationAsRead
} from "../features/notificationsSlice";
import { logoutUser } from "../features/authSlice";
import "./Navbar.css";
import { debounce } from "lodash";

const Navbar = () => {
  const dispatch = useDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentLoadingPage, setCurrentLoadingPage] = useState(null);

  const { isLoggedIn } = useSelector((state) => state.auth);
  const {
    notifications,
    page,
    perPage,
    total,
    loading,
    error,
    unreadCount
  } = useSelector((state) => state.notifications);

  const totalPages = Math.ceil(total / perPage);

  useEffect(() => {
    if (showDropdown && isLoggedIn) {
      dispatch(fetchNotifications({ page: 1, perPage: 5 }));
    }
  }, [showDropdown, isLoggedIn, dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const toggleNotifications = () => {
    setShowDropdown(prev => !prev);
  };

  const closeNotifications = useCallback(() => {
    setShowDropdown(false);
  }, []);

  // Debounced page change function memoized with useMemo
  const handlePageChange = useMemo(() => 
    debounce((newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentLoadingPage(newPage);
        dispatch(fetchNotifications({ page: newPage, perPage }));
        dispatch(setPage(newPage));
      }
    }, 300),
    [totalPages, perPage, dispatch]
  );

  // Cleanup debounce on unmount or deps change
  useEffect(() => {
    return () => {
      handlePageChange.cancel();
    };
  }, [handlePageChange]);

  const handleMarkAsRead = useCallback((notificationId, e) => {
    e?.stopPropagation();
    dispatch(markNotificationAsRead(notificationId));
  }, [dispatch]);

  const handleAcceptInvite = (notificationId, e) => {
    e.stopPropagation();
    // Implement accept invite logic
    console.log("Accept invite:", notificationId);
  };

  const handleDeclineInvite = (notificationId, e) => {
    e.stopPropagation();
    // Implement decline invite logic
    console.log("Decline invite:", notificationId);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDropdown) {
        const dropdown = document.querySelector('.notification-dropdown');
        const bellIcon = document.querySelector('.notification');
        
        if (dropdown && bellIcon && 
            !dropdown.contains(e.target) && 
            !bellIcon.contains(e.target)) {
          closeNotifications();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown, closeNotifications]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2 className="logo">MyApp</h2>
      </div>

      <div className="navbar-right">
        {!isLoggedIn ? (
          <>
            <a href="/login" className="nav-link">Login</a>
            <a href="/register" className="nav-link">Register</a>
          </>
        ) : (
          <>
            <button className="nav-link logout-btn" onClick={handleLogout}>
              Logout
            </button>

            <div className="notification" onClick={toggleNotifications}>
              <FaBell size={20} />
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}

              {showDropdown && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h4>Notifications ({total})</h4>
                    <button 
                      className="close-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeNotifications();
                      }}
                    >
                      <FaTimes />
                    </button>
                  </div>

                  <div className="notification-content">
                    {loading && currentLoadingPage === page ? (
                      <div className="notification-loading">Loading...</div>
                    ) : error ? (
                      <div className="notification-error">{error}</div>
                    ) : notifications.length === 0 ? (
                      <div className="notification-empty">No notifications found</div>
                    ) : (
                      <div className="notification-list">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <div className="notification-message">
                              {notification.notifyTextMessage}
                            </div>
                            <div className="notification-meta">
                              <span className="notification-time">
                                {new Date(notification.createdAt).toLocaleString()}
                              </span>
                              {!notification.read && (
                                <button 
                                  className="mark-read-btn"
                                  onClick={(e) => handleMarkAsRead(notification.id, e)}
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                            {notification.invited_user_ids && (
                              <div className="notification-actions">
                                <button 
                                  className="accept-btn"
                                  onClick={(e) => handleAcceptInvite(notification.id, e)}
                                >
                                  <FaCheck /> Accept
                                </button>
                                <button 
                                  className="decline-btn"
                                  onClick={(e) => handleDeclineInvite(notification.id, e)}
                                >
                                  <FaTimesCircle /> Decline
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="notification-pagination">
                      <button
                        className="pagination-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePageChange(page - 1);
                        }}
                        disabled={page <= 1 || loading}
                      >
                        {loading && currentLoadingPage === page - 1 ? '...' : 'Previous'}
                      </button>
                      <span className="pagination-info">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        className="pagination-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePageChange(page + 1);
                        }}
                        disabled={page >= totalPages || loading}
                      >
                        {loading && currentLoadingPage === page + 1 ? '...' : 'Next'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
