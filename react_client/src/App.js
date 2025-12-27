// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import SidebarPage from "./components/SidebarPage";
import ChatPage from "./components/ChatPage";
import UserChat from "./components/UserChat";
import AddPostPage from "./components/AddPostPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Navbar notificationCount={3} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Sidebar */}
        <Route
          path="/sidebar"
          element={
            <ProtectedRoute>
              <SidebarPage />
            </ProtectedRoute>
          }
        >
          {/* Chat */}
          <Route path="chat" element={<ChatPage />}>
            <Route path=":userId" element={<UserChat />} />
          </Route>

          {/* Post */}
          <Route path="post" element={<AddPostPage />} />
        </Route>

        {/* Redirect root to sidebar */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <SidebarPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
