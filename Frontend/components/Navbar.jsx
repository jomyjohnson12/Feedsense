import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../pages/Feedsense/apiService";
import { FaUserCircle, FaBars } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("Session");
    setUserId(storedUserId);

    if (!storedUserId) {
      setError("No UserId found in local storage");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await api.get(`/api/getUserbyid?UserId=${storedUserId}`);
        let freshUser = res.data[0];
        freshUser.RoleName =
          parseInt(storedUserId) === 1 ? "Administrator" : "Customer";
        setUser(freshUser);
      } catch (err) {
        setError("Failed to fetch user details.");
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("Session");
    localStorage.removeItem("SessionID");
    navigate("/");
  };

  if (error) return <p>{error}</p>;

  return (
    <nav
      className="navbar navbar-dark"
      style={{
        backgroundColor: "#064420", // Dark green
        padding: "0.5rem 1rem",
      }}
    >
      <div className="container-fluid d-flex align-items-center justify-content-between flex-nowrap">
        {/* Left side - Mobile Hamburger */}
        <div className="d-flex align-items-center">
          {/* Mobile menu button */}
          <div className="dropdown d-lg-none me-2">
            <button
              className="btn btn-link text-white p-0"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <FaBars size={22} />
            </button>
            <ul className="dropdown-menu">
              {parseInt(userId) !== 1 ? (
                <>
                  <li>
                    <Link className="dropdown-item fw-bold" to="/Userdashboard">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item fw-bold" to="/feedback">
                      My Feedback
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link className="dropdown-item fw-bold" to="/Admindashboard">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item fw-bold" to="/Allfeedback">
                      All Feedback
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item fw-bold" to="/AllCustomer">
                      Customers
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Desktop menu */}
         <ul className="navbar-nav flex-row d-none d-lg-flex">
  {parseInt(userId) !== 1 ? (
    <>
      <li className="nav-item me-3">
        <Link className="nav-link fw-bold text-white" to="/Userdashboard">
          Home
        </Link>
      </li>

      <li className="nav-item me-3">
        <Link className="nav-link fw-bold text-white" to="/feedback">
          My Feedback
        </Link>
      </li>
    </>
  ) : (
    <>
      <li className="nav-item me-3">
        <Link className="nav-link fw-bold text-white" to="/Admindashboard">
          Home
        </Link>
      </li>

      <li className="nav-item me-3">
        <Link className="nav-link fw-bold text-white" to="/Allfeedback">
          All Feedback
        </Link>
      </li>

      <li className="nav-item me-3">
        <Link className="nav-link fw-bold text-white" to="/AllCustomer">
          Customer
        </Link>
      </li>
    </>
  )}
</ul>


        </div>

        {/* Center - App Name */}
        <Link
          to={userId === "1" ? "/Admindashboard" : "/Userdashboard"}
          className="fw-bold text-white text-center flex-grow-1 text-decoration-none"
          style={{ fontSize: "1.5rem", letterSpacing: "1px" }}
        >
          Feed Sense
        </Link>


        {/* Right - User Menu */}
        <div className="dropdown">
          <a
            href="#"
            className="nav-link dropdown-toggle d-flex align-items-center text-white p-0"
            id="userDropdown"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <FaUserCircle size={28} className="me-2" />
            <div className="d-none d-lg-block">
              <div>{user?.Name || "Unknown User"}</div>
              <div className="small text-light opacity-75">
                {user?.RoleName || "No Role"}
              </div>
            </div>
          </a>
          <ul
            className="dropdown-menu dropdown-menu-end"
            aria-labelledby="userDropdown"
          >
            <li>
              <Link className="dropdown-item" to="/profile">
                Profile
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to="/Resetpassword">
                Settings
              </Link>
            </li>

            {parseInt(userId) === 1 && (
              <li>
                <Link className="dropdown-item" to="/LogFile">
                  Login Log
                </Link>
              </li>
            )}

            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <a className="dropdown-item" href="#" onClick={handleLogout}>
                Logout
              </a>
            </li>
          </ul>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
