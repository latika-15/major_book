import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/main.css";
import "../styles/auth.css";

const Landing = () => {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (tab) => {
    setActiveTab(tab);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleLogin = () => {
    login("testuser@example.com");
    navigate("/dashboard");
  };

  const handleRegister = () => {
    register("Priyal", "priyal@example.com");
    navigate("/dashboard");
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <nav className="navbar">
            <div className="logo">
              <i className="fas fa-book-open"></i>
              <span>Book Buddy</span>
            </div>
            <div className="nav-links">
              <a href="#features">Features</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="auth-buttons">
              {!user ? (
                <>
                  <button className="btn btn-outline" onClick={() => openModal("login")}>Login</button>
                  <button className="btn btn-primary" onClick={() => openModal("register")}>Get Started</button>
                </>
              ) : (
                <span className="welcome-user">Hi, {user.name}! 👋</span>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            {!user ? (
              <>
                <h1>Transform Learning with AI-Powered Book Analysis</h1>
                <p>
                  Book Buddy helps students, teachers, and professionals extract key insights
                  from books and documents through advanced AI summarization, interactive
                  flashcards, and intelligent Q&A.
                </p>
                <div className="hero-buttons">
                  <button className="btn btn-accent" onClick={() => openModal("register")}>
                    <i className="fas fa-rocket"></i> Start Free Trial
                  </button>
                  <button className="btn btn-outline">
                    <i className="fas fa-play-circle"></i> Watch Demo
                  </button>
                </div>
              </>
            ) : (
              <h2>Welcome back, {user.name}! Ready to continue your learning journey?</h2>
            )}

            <div className="hero-stats">
              <div className="stat"><h3>10,000+</h3><p>Books Analyzed</p></div>
              <div className="stat"><h3>50,000+</h3><p>Active Users</p></div>
              <div className="stat"><h3>98%</h3><p>User Satisfaction</p></div>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1"><i className="fas fa-file-pdf"></i><h4>Smart Summaries</h4><p>AI-powered book analysis</p></div>
            <div className="floating-card card-2"><i className="fas fa-robot"></i><h4>Chat with Books</h4><p>Interactive Q&A</p></div>
            <div className="floating-card card-3"><i className="fas fa-bolt"></i><h4>Flashcards</h4><p>Automatic study aids</p></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-title">
            <h2>Powerful Features for Every Learner</h2>
            <p>Discover how Book Buddy revolutionizes learning and document analysis</p>
          </div>
          <div className="features-grid">
            {[{ icon: "fa-file-pdf", title: "AI PDF Summarization", desc: "Upload any book PDF..." },
              { icon: "fa-robot", title: "Chat with Your Books", desc: "Ask questions about..." },
              { icon: "fa-bolt", title: "Smart Flashcards", desc: "Automatically generate..." },
              { icon: "fa-question-circle", title: "Quiz Generator", desc: "Create customized quizzes..." },
              { icon: "fa-project-diagram", title: "Project Management", desc: "Organize your study..." },
              { icon: "fa-chart-line", title: "Progress Analytics", desc: "Track your learning..." }].map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon"><i className={`fas ${f.icon}`}></i></div>
                <h3>{f.title}</h3><p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Transform Your Learning Experience?</h2>
              <p>Join thousands already using Book Buddy to enhance their learning.</p>
              <button className="btn btn-accent btn-large" onClick={() => openModal("register")}>
                <i className="fas fa-rocket"></i> Start Your Free Trial
              </button>
              <p className="cta-note">3 free PDF analyses • No credit card required</p>
            </div>
          </div>
        </section>
      )}

      {/* Auth Modal */}
      {modalOpen && (
        <div id="authModal" className="modal" style={{ display: "flex" }}>
          <div className="modal-content">
            <span className="close-modal" onClick={closeModal}>&times;</span>
            <div className="modal-tabs">
              <div className={`modal-tab ${activeTab === "login" ? "active" : ""}`} onClick={() => setActiveTab("login")}>Login</div>
              <div className={`modal-tab ${activeTab === "register" ? "active" : ""}`} onClick={() => setActiveTab("register")}>Register</div>
            </div>

            {activeTab === "login" ? (
              <div className="auth-form">
                <input type="email" placeholder="Email" />
                <input type="password" placeholder="Password" />
                <button className="btn btn-primary btn-auth" onClick={handleLogin}>
                  <i className="fas fa-sign-in-alt"></i> Login to Book Buddy
                </button>
              </div>
            ) : (
              <div className="auth-form">
                <input type="text" placeholder="Full Name" />
                <input type="email" placeholder="Email" />
                <input type="password" placeholder="Password" />
                <input type="password" placeholder="Confirm Password" />
                <button className="btn btn-primary btn-auth" onClick={handleRegister}>
                  <i className="fas fa-user-plus"></i> Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <h3>Book Buddy</h3>
              <p>Transforming learning through AI-powered tools for students and educators.</p>
              <div className="social-links">
                <a href="#twitter"><i className="fab fa-twitter"></i></a>
                <a href="#linkedin"><i className="fab fa-linkedin"></i></a>
              </div>
            </div>
            <div className="copyright">
              &copy; 2024 Book Buddy. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
