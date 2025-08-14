// Protectorroute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom"; // ✅ use react-router-dom for consistency

const Protectorroute = () => {
  const sessionId = localStorage.getItem("SessionID"); // ✅ from localStorage

  // If no SessionID, redirect to home ("/")
  if (!sessionId) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default Protectorroute;
