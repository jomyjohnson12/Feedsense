import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaLock,
  FaEnvelope,
  FaPhone,
  FaArrowRight
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "./apiService";
import "./Login.css";
import backgroundImage from "../../src/assets/feedsense.png";

// SHA-256 hash
async function hashValue(value) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Get IP
async function getUserIP() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip || "Unknown";
  } catch {
    return "Unknown";
  }
}

// Reverse geocode
async function getPlaceNameFromCoordinates(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
    );
    const data = await response.json();
    return data.display_name || `${latitude},${longitude}`;
  } catch {
    return `${latitude},${longitude}`;
  }
}

const LoginSignup = () => {
  const [activeTab, setActiveTab] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [bgImage1, setBgImage1] = useState(backgroundImage); // ✅ restored
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Load stored images
  useEffect(() => {
    const storedBgImage = localStorage.getItem("bgImage1");
    if (storedBgImage) {
      setBgImage1(storedBgImage);
    }
  }, []);

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!username || !password) {
      toast.warn("Username and Password are required.");
      return;
    }

    try {
      const response = await api.post("/api/login", {
        Username: username,
        Password: password
      });
      const data = response.data;

      if (!data.success) {
        toast.error(data.error || "Invalid username or password.");
        return;
      }

      const hashedUserId = await hashValue(String(data.UserId));
      localStorage.setItem("SessionID", hashedUserId);
      localStorage.setItem("Session", data.UserId);
      toast.success("Login successful!");

      navigate(data.UserId === 1 ? "/Admindashboard" : "/Userdashboard");

      // Background logging
      (async () => {
        try {
          const ip = await getUserIP();
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const geo = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
              };
              const placeName = await getPlaceNameFromCoordinates(
                geo.latitude,
                geo.longitude
              );
              api
                .post("/api/insertLoginLog", {
                  EmployeeCode: data.UserId,
                  EmployeeName: data.Name || "Unknown",
                  LoginUserName: username,
                  IPAddress: ip,
                  LoginStatus: true,
                  UserAgent: navigator.userAgent,
                  LoginMethod: "Password",
                  SessionID: hashedUserId,
                  GeoLocation: geo,
                  GeoPlace: placeName
                })
                .catch(() => {});
            },
            () => {
              api
                .post("/api/insertLoginLog", {
                  EmployeeCode: data.UserId,
                  EmployeeName: data.Name || "Unknown",
                  LoginUserName: username,
                  IPAddress: ip,
                  LoginStatus: true,
                  UserAgent: navigator.userAgent,
                  LoginMethod: "Password",
                  SessionID: hashedUserId
                })
                .catch(() => {});
            }
          );
        } catch {
          // Ignore background logging errors
        }
      })();
    } catch (err) {
      toast.error(
        err.response?.data?.error || "An error occurred during login."
      );
    }
  };

  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value.trim();
    const mobile = document.getElementById("signupMobile").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const confirmPassword = document
      .getElementById("signupConfirmPassword")
      .value.trim();

    if (!name || !mobile || !email || !username || !password || !confirmPassword) {
      toast.warn("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const response = await api.post("/api/signup", {
        Name: name,
        Mobile: mobile,
        Email: email,
        Username: username,
        Password: password
      });

      if (response.data.success) {
        toast.success("Signup successful! Please login.");
        setActiveTab("signin");
      } else {
        toast.error(response.data.error || "Signup failed.");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error || "An error occurred during signup."
      );
    }
  };

  return (
    <section
      className="vh-100 w-100"
      style={{
        backgroundImage: `url(${bgImage1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div className="login-container">
        <div className="background-overlay"></div>
        <div className="login-background"></div>

        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h2>{activeTab === "signin" ? "FeedSense" : "FeedSense "}</h2>
              <p>{activeTab === "signin" ? "Sign in to continue" : "Join us today"}</p>

              <div className="tab-switcher">
                <button
                  className={`tab-btn ${activeTab === "signin" ? "active" : ""}`}
                  onClick={() => setActiveTab("signin")}
                >
                  Sign In
                </button>
                <button
                  className={`tab-btn ${activeTab === "signup" ? "active" : ""}`}
                  onClick={() => setActiveTab("signup")}
                >
                  Sign Up
                </button>
              </div>
            </div>

            <div className="auth-body">
              {activeTab === "signin" ? (
                <form onSubmit={handleLogin} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="loginUsername">Username</label>
                    <div className="input-wrapper">
                      <FaUser className="input-icon" />
                      <input
                        type="text"
                        id="loginUsername"
                        placeholder="Enter your username"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="loginPassword">Password</label>
                    <div className="input-wrapper">
                      <FaLock className="input-icon" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="loginPassword"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={toggleShowPassword}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="submit-btn" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In"} <FaArrowRight />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="signupName">Full Name</label>
                    <div className="input-wrapper">
                      <FaUser className="input-icon" />
                      <input
                        type="text"
                        id="signupName"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="signupMobile">Mobile</label>
                      <div className="input-wrapper">
                        <FaPhone className="input-icon" />
                        <input
                          type="text"
                          id="signupMobile"
                          placeholder="Phone number"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="signupEmail">Email</label>
                      <div className="input-wrapper">
                        <FaEnvelope className="input-icon" />
                        <input
                          type="email"
                          id="signupEmail"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="signupUsername">Username</label>
                    <div className="input-wrapper">
                      <FaUser className="input-icon" />
                      <input
                        type="text"
                        id="signupUsername"
                        placeholder="Choose a username"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="signupPassword">Password</label>
                      <div className="input-wrapper">
                        <FaLock className="input-icon" />
                        <input
                          type={showPassword ? "text" : "password"}
                          id="signupPassword"
                          placeholder="Create password"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="signupConfirmPassword">Confirm Password</label>
                      <div className="input-wrapper">
                        <FaLock className="input-icon" />
                        <input
                          type={showPassword ? "text" : "password"}
                          id="signupConfirmPassword"
                          placeholder="Confirm password"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={toggleShowPassword}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="submit-btn" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Sign Up"} <FaArrowRight />
                  </button>
                </form>
              )}

              <div className="auth-footer">
                {activeTab === "signin" ? (
                  <>
                    Don't have an account?{" "}
                    <button onClick={() => setActiveTab("signup")}>Sign up</button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button onClick={() => setActiveTab("signin")}>Sign in</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </section>
  );
};

export default LoginSignup;
