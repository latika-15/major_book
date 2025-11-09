// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/main.css";
import "../styles/auth.css";

const Navbar = ({ openAuthModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar-wrapper">
      <div className="container">
        <nav className="navbar">
          <div
            className="logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            <i className="fas fa-book-open"></i>
            <span>Book Buddy</span>
          </div>

          <div className="nav-links">
            <Link to="/">Home</Link>
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>

            {user && (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/summarizer">Summarizer</Link>
              </>
            )}
          </div>

          <div className="auth-buttons">
            {!user ? (
              <>
                <button
                  className="btn btn-outline"
                  onClick={() => openAuthModal("login")}
                >
                  Login
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => openAuthModal("register")}
                >
                  Get Started
                </button>
              </>
            ) : (
              <div className="auth-loggedin">
                <span className="welcome-user">Hi, {user.name}! 👋</span>
                <button
                  className="btn btn-small btn-outline"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
