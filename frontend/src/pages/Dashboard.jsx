// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "../styles/main.css";
import "../styles/dashboard.css";

const Dashboard = () => {
  const { user, logout } = useAuth();

  // Example state for stats; in real app, fetch from backend
  const [stats] = useState({
    pdfsCount: 0,
    summariesCount: 0,
    trialsLeft: 3,
  });

  useEffect(() => {
    // Fetch user stats from backend if needed
    // setStats({ pdfsCount: ..., summariesCount: ..., trialsLeft: ... });
  }, []);

  return (
    <div className="dashboard-page">
      {/* Header */}
       <Navbar openAuthModal={() => {}} />
      {/* <header className="dashboard-header">
        <div className="container">
          <nav className="navbar">
            <div className="logo">
              <i className="fas fa-book-open"></i>
              <span>Book Buddy</span>
            </div>
            <div className="nav-links">
              <a href="#dashboard" className="nav-link active">Dashboard</a>
              <a href="#summarizer" className="nav-link">Summarizer</a>
              <a href="#flashcards" className="nav-link">Flashcards</a>
            </div>
            <div className="user-menu">
              <div className="user-info">
                <div className="user-role">{user?.role || "Student"}</div>
                <span>{user?.name || "Loading..."}</span>
                <div className="user-dropdown">
                  <i className="fas fa-caret-down"></i>
                  <div className="dropdown-content">
                    <a href="#user"><i className="fas fa-user"></i> Profile</a>
                    <a href="#settings"><i className="fas fa-cog"></i> Settings</a>
                    <button className="btn btn-small btn-outline" onClick={logout}>
  Logout
</button>

                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header> */}

      {/* Welcome Section */}
      <main className="dashboard-main">
        <div className="container">
          <section className="welcome-section">
            <div className="welcome-content">
              <h1>Hi, {user?.name || "Student"}! 👋</h1>
              <p>Ready to continue your learning journey? Here's what's happening today.</p>
            </div>
            <div className="quick-stats">
              <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-file-pdf"></i></div>
                <div className="stat-info">
                  <h3>{stats.pdfsCount}</h3>
                  <p>PDFs Processed</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-chart-line"></i></div>
                <div className="stat-info">
                  <h3>{stats.summariesCount}</h3>
                  <p>Summaries Generated</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-bolt"></i></div>
                <div className="stat-info">
                  <h3>{stats.trialsLeft}</h3>
                  <p>Trials Remaining</p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <div className="action-card" onClick={() => alert("Go to PDF Summarizer")}>
                <div className="action-icon"><i className="fas fa-file-upload"></i></div>
                <h3>Upload PDF</h3>
                <p>Upload and analyze new documents</p>
                <button className="btn btn-primary">Get Started</button>
              </div>
              <div className="action-card" onClick={() => alert("Generate Summary")}>
                <div className="action-icon"><i className="fas fa-magic"></i></div>
                <h3>Generate Summary</h3>
                <p>Create AI-powered summaries</p>
                <button className="btn btn-primary">Create Now</button>
              </div>
              <div className="action-card" onClick={() => alert("Generate Flashcards")}>
                <div className="action-icon"><i className="fas fa-bolt"></i></div>
                <h3>Make Flashcards</h3>
                <p>Generate study flashcards</p>
                <button className="btn btn-primary">Generate</button>
              </div>
              <div className="action-card" onClick={() => alert("Take Quiz")}>
                <div className="action-icon"><i className="fas fa-question-circle"></i></div>
                <h3>Take Quiz</h3>
                <p>Test your knowledge</p>
                <button className="btn btn-primary">Start Quiz</button>
              </div>
            </div>
          </section>

          {/* Role-Based Features */}
          {user?.role === "student" && (
            <section className="role-features student-feature">
              <h2>Student Learning Tools</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <i className="fas fa-graduation-cap"></i>
                  <h3>Study Mode</h3>
                  <p>Optimized summaries for exam preparation</p>
                </div>
                <div className="feature-card">
                  <i className="fas fa-brain"></i>
                  <h3>Beginner Explanations</h3>
                  <p>Step-by-step concept breakdowns</p>
                </div>
                <div className="feature-card">
                  <i className="fas fa-clock"></i>
                  <h3>Study Planner</h3>
                  <p>Schedule and track your study sessions</p>
                </div>
              </div>
            </section>
          )}

          {user?.role === "teacher" && (
            <section className="role-features teacher-feature">
              <h2>Teaching Resources</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <i className="fas fa-file-alt"></i>
                  <h3>Exam Paper Maker</h3>
                  <p>Generate customized tests and quizzes</p>
                </div>
                <div className="feature-card">
                  <i className="fas fa-users"></i>
                  <h3>Class Management</h3>
                  <p>Organize materials for multiple classes</p>
                </div>
                <div className="feature-card">
                  <i className="fas fa-chart-bar"></i>
                  <h3>Progress Analytics</h3>
                  <p>Track student performance and engagement</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-info">
              <p>&copy; 2024 Book Buddy. AI-Powered Learning Platform</p>
            </div>
            <div className="footer-links">
              <a href="#help">Help</a>
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
