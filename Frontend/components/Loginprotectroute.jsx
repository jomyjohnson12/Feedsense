// Loginprotectroute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const Loginprotectroute = () => {
  const sessionId = localStorage.getItem("SessionID"); // ✅ from localStorage
  const userId = localStorage.getItem("UserId"); // ✅ also from localStorage
  const location = useLocation();

  if (sessionId && (location.pathname === "/" || location.pathname === "/login" || location.pathname === "/signup")) {
    // Redirect based on UserId
    return <Navigate to={userId === "1" ? "/Admindashboard" : "/Userdashboard"} replace />;
  }

  return <Outlet />;
};

export default Loginprotectroute;
