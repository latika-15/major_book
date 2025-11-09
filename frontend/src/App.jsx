// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
// import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Summarizer from "./pages/Summarizer";
import "./styles/main.css";
import "./styles/auth.css";


const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/summarizer" element={<Summarizer />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;

// const Landing = () => {
//   const { login, register } = useAuth();
//   const navigate = useNavigate();

//   const handleLogin = () => {
//     login("testuser@example.com");
//     navigate("/dashboard");
//   };

//   const handleRegister = () => {
//     register("Priyal", "priyal@example.com");
//     navigate("/dashboard");
//   };

//   // keep all your existing landing page UI the same
//   return (
//     <div className="landing-page">
//       {/* ... your entire landing page JSX (same as before) ... */}
//       {/* Just replace login/register button actions: */}
//       <button className="btn btn-outline" onClick={handleLogin}>
//         Login
//       </button>
//       <button className="btn btn-primary" onClick={handleRegister}>
//         Get Started
//       </button>
//       {/* rest of your page same */}
//     </div>
//   );
// };





// import React from "react";

// import "./styles/main.css";
// import "./styles/auth.css";

// const App = () => {
//   // These functions mimic your original onclick handlers
//   const openAuthModal = (tab) => {
//     const modal = document.getElementById("authModal");
//     modal.style.display = "flex";
//     switchAuthForm(tab);
//   };

//   const closeAuthModal = () => {
//     const modal = document.getElementById("authModal");
//     modal.style.display = "none";
//   };

//   const switchAuthForm = (tab) => {
//     const loginForm = document.getElementById("loginForm");
//     const registerForm = document.getElementById("registerForm");
//     const tabs = document.querySelectorAll(".modal-tab");

//     tabs.forEach((t) =>
//       t.classList.toggle("active", t.dataset.tab === tab)
//     );
//     if (tab === "login") {
//       loginForm.style.display = "block";
//       registerForm.style.display = "none";
//     } else {
//       loginForm.style.display = "none";
//       registerForm.style.display = "block";
//     }
//   };

//   return (
//     <div className="landing-page">
//       {/* Header */}
//       <header className="landing-header">
//         <div className="container">
//           <nav className="navbar">
//             <div className="logo">
//               <i className="fas fa-book-open"></i>
//               <span>Book Buddy</span>
//             </div>
//             <div className="nav-links">
//               <a href="#features">Features</a>
//               <a href="#about">About</a>
//               <a href="#contact">Contact</a>
//             </div>
//             <div className="auth-buttons">
//               <button
//                 className="btn btn-outline"
//                 onClick={() => openAuthModal("login")}
//               >
//                 Login
//               </button>
//               <button
//                 className="btn btn-primary"
//                 onClick={() => openAuthModal("register")}
//               >
//                 Get Started
//               </button>
//             </div>
//           </nav>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="hero">
//         <div className="container">
//           <div className="hero-content">
//             <h1>Transform Learning with AI-Powered Book Analysis</h1>
//             <p>
//               Book Buddy helps students, teachers, and professionals extract key
//               insights from books and documents through advanced AI
//               summarization, interactive flashcards, and intelligent Q&A.
//             </p>
//             <div className="hero-buttons">
//               <button
//                 className="btn btn-accent"
//                 onClick={() => openAuthModal("register")}
//               >
//                 <i className="fas fa-rocket"></i> Start Free Trial
//               </button>
//               <button className="btn btn-outline">
//                 <i className="fas fa-play-circle"></i> Watch Demo
//               </button>
//             </div>
//             <div className="hero-stats">
//               <div className="stat">
//                 <h3>10,000+</h3>
//                 <p>Books Analyzed</p>
//               </div>
//               <div className="stat">
//                 <h3>50,000+</h3>
//                 <p>Active Users</p>
//               </div>
//               <div className="stat">
//                 <h3>98%</h3>
//                 <p>User Satisfaction</p>
//               </div>
//             </div>
//           </div>
//           <div className="hero-image">
//             <div className="floating-card card-1">
//               <i className="fas fa-file-pdf"></i>
//               <h4>Smart Summaries</h4>
//               <p>AI-powered book analysis</p>
//             </div>
//             <div className="floating-card card-2">
//               <i className="fas fa-robot"></i>
//               <h4>Chat with Books</h4>
//               <p>Interactive Q&A</p>
//             </div>
//             <div className="floating-card card-3">
//               <i className="fas fa-bolt"></i>
//               <h4>Flashcards</h4>
//               <p>Automatic study aids</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="features">
//         <div className="container">
//           <div className="section-title">
//             <h2>Powerful Features for Every Learner</h2>
//             <p>
//               Discover how Book Buddy revolutionizes learning and document
//               analysis
//             </p>
//           </div>
//           <div className="features-grid">
//             {[
//               {
//                 icon: "fa-file-pdf",
//                 title: "AI PDF Summarization",
//                 desc: "Upload any book PDF and get intelligent summaries by chapter, page range, or key concepts with highlighted important points.",
//               },
//               {
//                 icon: "fa-robot",
//                 title: "Chat with Your Books",
//                 desc: "Ask questions about your book content and get instant, accurate answers powered by advanced AI understanding.",
//               },
//               {
//                 icon: "fa-bolt",
//                 title: "Smart Flashcards",
//                 desc: "Automatically generate interactive flashcards from your book content to enhance learning and retention.",
//               },
//               {
//                 icon: "fa-question-circle",
//                 title: "Quiz Generator",
//                 desc: "Create customized quizzes to test your understanding and track your learning progress.",
//               },
//               {
//                 icon: "fa-project-diagram",
//                 title: "Project Management",
//                 desc: "Organize your study projects and assignments with our intuitive Kanban-style task management.",
//               },
//               {
//                 icon: "fa-chart-line",
//                 title: "Progress Analytics",
//                 desc: "Track your learning journey with detailed analytics and personalized insights.",
//               },
//             ].map((f, i) => (
//               <div className="feature-card" key={i}>
//                 <div className="feature-icon">
//                   <i className={`fas ${f.icon}`}></i>
//                 </div>
//                 <h3>{f.title}</h3>
//                 <p>{f.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="cta-section">
//         <div className="container">
//           <div className="cta-content">
//             <h2>Ready to Transform Your Learning Experience?</h2>
//             <p>
//               Join thousands of students, teachers, and professionals who are
//               already using Book Buddy to enhance their learning and teaching.
//             </p>
//             <button
//               className="btn btn-accent btn-large"
//               onClick={() => openAuthModal("register")}
//             >
//               <i className="fas fa-rocket"></i> Start Your Free Trial
//             </button>
//             <p className="cta-note">
//               3 free PDF analyses • No credit card required
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Auth Modal */}
//       <div id="authModal" className="modal">
//         <div className="modal-content">
//           <span className="close-modal" onClick={closeAuthModal}>
//             &times;
//           </span>
//           <div className="modal-tabs">
//             <div
//               className="modal-tab active"
//               data-tab="login"
//               onClick={() => switchAuthForm("login")}
//             >
//               Login
//             </div>
//             <div
//               className="modal-tab"
//               data-tab="register"
//               onClick={() => switchAuthForm("register")}
//             >
//               Register
//             </div>
//           </div>

//           {/* Login Form */}
//           <div id="loginForm" className="auth-form">
//             <div className="form-group">
//               <label htmlFor="loginEmail">Email</label>
//               <input
//                 type="email"
//                 id="loginEmail"
//                 className="form-control"
//                 placeholder="Enter your email"
//               />
//             </div>
//             <div className="form-group">
//               <label htmlFor="loginPassword">Password</label>
//               <input
//                 type="password"
//                 id="loginPassword"
//                 className="form-control"
//                 placeholder="Enter your password"
//               />
//             </div>
//             <div className="form-group form-options">
//               <label className="checkbox-label">
//                 <input type="checkbox" id="rememberMe" />
//                 <span className="checkmark"></span>Remember me
//               </label>
//               <a href="#pass" className="forgot-password">
//                 Forgot password?
//               </a>
//             </div>
//             <button className="btn btn-primary btn-auth">
//               <i className="fas fa-sign-in-alt"></i> Login to Book Buddy
//             </button>
//             <div className="auth-divider">
//               <span>or continue with</span>
//             </div>
//             <div className="social-auth">
//               <button className="btn btn-google">
//                 <i className="fab fa-google"></i> Google
//               </button>
//               <button className="btn btn-microsoft">
//                 <i className="fab fa-microsoft"></i> Microsoft
//               </button>
//             </div>
//             <p className="auth-switch">
//               Don't have an account?{" "}
//               <a href="#register" onClick={() => switchAuthForm("register")}>
//                 Sign up here
//               </a>
//             </p>
//           </div>

//           {/* Register Form */}
//           <div id="registerForm" className="auth-form" style={{ display: "none" }}>
//             <div className="form-group">
//               <label htmlFor="registerName">Full Name</label>
//               <input
//                 type="text"
//                 id="registerName"
//                 className="form-control"
//                 placeholder="Enter your full name"
//               />
//             </div>
//             <div className="form-group">
//               <label htmlFor="registerEmail">Email</label>
//               <input
//                 type="email"
//                 id="registerEmail"
//                 className="form-control"
//                 placeholder="Enter your email"
//               />
//             </div>
//             <div className="form-group">
//               <label htmlFor="registerPassword">Password</label>
//               <input
//                 type="password"
//                 id="registerPassword"
//                 className="form-control"
//                 placeholder="Create a password (min. 8 characters)"
//               />
//             </div>
//             <div className="form-group">
//               <label htmlFor="registerConfirmPassword">Confirm Password</label>
//               <input
//                 type="password"
//                 id="registerConfirmPassword"
//                 className="form-control"
//                 placeholder="Confirm your password"
//               />
//             </div>
//             <div className="form-group">
//               <label>I am a:</label>
//               <div className="role-select">
//                 <div className="role-option selected" data-role="student">
//                   <i className="fas fa-user-graduate"></i>
//                   <span>Student</span>
//                 </div>
//                 <div className="role-option" data-role="teacher">
//                   <i className="fas fa-chalkboard-teacher"></i>
//                   <span>Teacher</span>
//                 </div>
//                 <div className="role-option" data-role="admin">
//                   <i className="fas fa-user-shield"></i>
//                   <span>Administrator</span>
//                 </div>
//               </div>
//             </div>
//             <div className="form-group">
//               <label className="checkbox-label">
//                 <input type="checkbox" id="acceptTerms" />
//                 <span className="checkmark"></span>I agree to the{" "}
//                 <a href="#tos">Terms of Service</a> and{" "}
//                 <a href="#pri">Privacy Policy</a>
//               </label>
//             </div>
//             <button className="btn btn-primary btn-auth">
//               <i className="fas fa-user-plus"></i> Create Account
//             </button>
//             <p className="auth-switch">
//               Already have an account?{" "}
//               <a href="#login" onClick={() => switchAuthForm("login")}>
//                 Login here
//               </a>
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <footer>
//         <div className="container">
//           <div className="footer-content">
//             <div className="footer-column">
//               <h3>Book Buddy</h3>
//               <p>
//                 Transforming learning through AI-powered tools and project
//                 management for students and educators worldwide.
//               </p>
//               <div className="social-links">
//                 <a href="#linkedin"><i className="fab fa-linkedin"></i></a>
//                 <a href="#instagram"><i className="fab fa-instagram"></i></a>
//               </div>
//             </div>

//             <div className="footer-column">
//               <h3>Features</h3>
//               <ul className="footer-links">
//                 <li><a href="pdf-summarizer.html">PDF Summarization</a></li>
//                 <li><a href="pdf-summarizer.html">Chat with Books</a></li>
//                 <li><a href="pdf-summarizer.html">Flashcards</a></li>
//                 <li><a href="pdf-summarizer.html">Quiz Generator</a></li>
//                 <li><a href="project-management.html">Project Management</a></li>
//               </ul>
//             </div>

//             <div className="footer-column">
//               <h3>Resources</h3>
//               <ul className="footer-links">
//                 <li><a href="#doc">Documentation</a></li>
//                 <li><a href="#tut">Tutorials</a></li>
//                 <li><a href="#blog">Blog</a></li>
//                 <li><a href="#ref">API Reference</a></li>
//                 <li><a href="#help">Help Center</a></li>
//               </ul>
//             </div>

//             <div className="footer-column">
//               <h3>Company</h3>
//               <ul className="footer-links">
//                 <li><a href="#about">About Us</a></li>
//                 <li><a href="#car">Careers</a></li>
//                 <li><a href="#con">Contact</a></li>
//                 <li><a href="#pri">Privacy Policy</a></li>
//                 <li><a href="#tos">Terms of Service</a></li>
//               </ul>
//             </div>
//           </div>
//           <div className="copyright">
//             &copy; 2024 Book Buddy. All rights reserved. | AI-Powered Learning Platform
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default App;
