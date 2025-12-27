// SidebarPage.jsx
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "./SidebarPage.css";

function SidebarPage() {
  const navigate = useNavigate();

  return (
    <div className="sidebar-container">
      {/* Sidebar Menu */}
      <div className="sidebar">
        <h2>Menu</h2>
        <ul>
          <li onClick={() => navigate("/sidebar/chat")}>Chat</li>
          <li onClick={() => navigate("/sidebar/post")}>Add Post</li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <Outlet /> {/* Where nested pages will be displayed */}
      </div>
    </div>
  );
}

export default SidebarPage;