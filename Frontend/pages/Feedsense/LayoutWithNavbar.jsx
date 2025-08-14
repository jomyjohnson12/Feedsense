import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";

const LayoutWithNavbar = () => {
  return (
    <>
      <Navbar />
      <div style={{ padding: "1rem" }}>
        <Outlet />
      </div>
    </>
  );
};

export default LayoutWithNavbar;
