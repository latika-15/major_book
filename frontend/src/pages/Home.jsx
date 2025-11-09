// // src/pages/Home.jsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import Navbar from "../components/Navbar";
// import "../styles/main.css";
// import "../styles/auth.css";

// const Home = () => {
//   const { user, login, register } = useAuth();
//   const navigate = useNavigate();

//   const [activeTab, setActiveTab] = useState("login");
//   const [modalOpen, setModalOpen] = useState(false);

//   const openAuthModal = (tab) => {
//     setActiveTab(tab);
//     setModalOpen(true);
//   };
//   const closeModal = () => setModalOpen(false);

//   const [loginData, setLoginData] = useState({ email: "", password: "" });
//   const [registerData, setRegisterData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirm: "",
//   });

//   const handleLogin = async () => {
//     const success = await login(loginData.email, loginData.password);
//     if (success) {
//       setModalOpen(false);
//       navigate("/dashboard");
//     }
//   };

// const handleRegister = async () => {
//   console.log("🟢 Create Account clicked!");
//   if (registerData.password !== registerData.confirm) {
//     alert("Passwords do not match");
//     return;
//   }
//   const success = await register(
//     registerData.name,
//     registerData.email,
//     registerData.password
//   );
//   console.log("Register result:", success);
//   if (success) {
//     setModalOpen(false);
//     navigate("/dashboard");
//   }
// };


//   const features = [
//     {
//       icon: "fa-file-pdf",
//       title: "AI PDF Summarization",
//       desc: "Upload any book or document and get a smart summary powered by AI.",
//       route: "/summarizer",
//     },
//     {
//       icon: "fa-robot",
//       title: "Chat with Your Books",
//       desc: "Ask questions and interact with your reading materials in real time.",
//       route: "/dashboard",
//     },
//     {
//       icon: "fa-bolt",
//       title: "Smart Flashcards",
//       desc: "Generate instant flashcards for quick revision and active recall.",
//       route: "/dashboard",
//     },
//     {
//       icon: "fa-question-circle",
//       title: "Quiz Generator",
//       desc: "Create quizzes automatically based on book content.",
//       route: "/dashboard",
//     },
//     {
//       icon: "fa-project-diagram",
//       title: "Project Management",
//       desc: "Organize study materials, notes, and projects efficiently.",
//       route: "/dashboard",
//     },
//     {
//       icon: "fa-chart-line",
//       title: "Progress Analytics",
//       desc: "Track your learning journey and monitor improvement trends.",
//       route: "/dashboard",
//     },
//   ];

//   const handleFeatureClick = (route) => {
//     if (user) navigate(route);
//     else openAuthModal("login");
//   };

//   return (
//     <div className="landing-page">
//       {/* ✅ Shared Navbar */}
//       <Navbar openAuthModal={openAuthModal} />

//       {/* Hero Section */}
//       <section className="hero">
//         <div className="container">
//           <div className="hero-content">
//             <h1>Transform Learning with AI-Powered Book Analysis</h1>
//             <p>
//               Book Buddy helps students, teachers, and professionals extract key
//               insights from books and documents through advanced AI summarization,
//               interactive flashcards, and intelligent Q&A.
//             </p>
//             {!user && (
//               <div className="hero-buttons">
//                 <button
//                   className="btn btn-accent"
//                   onClick={() => openAuthModal("register")}
//                 >
//                   <i className="fas fa-rocket"></i> Start Free Trial
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* === Features Section === */}
//       <section id="features" className="features">
//         <div className="container">
//           <div className="section-title">
//             <h2>Powerful Features for Every Learner</h2>
//             <p>Click on a feature to explore it.</p>
//           </div>
//           <div className="features-grid">
//             {features.map((f, i) => (
//               <div
//                 className="feature-card clickable"
//                 key={i}
//                 onClick={() => handleFeatureClick(f.route)}
//               >
//                 <div className="feature-icon">
//                   <i className={`fas ${f.icon}`}></i>
//                 </div>
//                 <h3>{f.title}</h3>
//                 <p>{f.desc}</p>
//                 <button className="btn btn-accent btn-small">
//                   Go to {f.title.split(" ")[0]} →
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Auth Modal */}
//       {modalOpen && (
//         <div id="authModal" className="modal" style={{ display: "flex" }}>
//           <div className="modal-content">
//             <span className="close-modal" onClick={closeModal}>
//               &times;
//             </span>

//             <div className="modal-tabs">
//               <div
//                 className={`modal-tab ${
//                   activeTab === "login" ? "active" : ""
//                 }`}
//                 onClick={() => setActiveTab("login")}
//               >
//                 Login
//               </div>
//               <div
//                 className={`modal-tab ${
//                   activeTab === "register" ? "active" : ""
//                 }`}
//                 onClick={() => setActiveTab("register")}
//               >
//                 Register
//               </div>
//             </div>

//             {activeTab === "login" ? (
//               <div className="auth-form">
//                 <input
//                   type="email"
//                   placeholder="Email"
//                   value={loginData.email}
//                   onChange={(e) =>
//                     setLoginData({ ...loginData, email: e.target.value })
//                   }
//                 />
//                 <input
//                   type="password"
//                   placeholder="Password"
//                   value={loginData.password}
//                   onChange={(e) =>
//                     setLoginData({ ...loginData, password: e.target.value })
//                   }
//                 />
//                 <button className="btn btn-primary btn-auth" onClick={handleLogin}>
//                   <i className="fas fa-sign-in-alt"></i> Login
//                 </button>
//               </div>
//             ) : (
//               <div className="auth-form">
//                 <input
//                   type="text"
//                   placeholder="Full Name"
//                   value={registerData.name}
//                   onChange={(e) =>
//                     setRegisterData({ ...registerData, name: e.target.value })
//                   }
//                 />
//                 <input
//                   type="email"
//                   placeholder="Email"
//                   value={registerData.email}
//                   onChange={(e) =>
//                     setRegisterData({ ...registerData, email: e.target.value })
//                   }
//                 />
//                 <input
//                   type="password"
//                   placeholder="Password"
//                   value={registerData.password}
//                   onChange={(e) =>
//                     setRegisterData({ ...registerData, password: e.target.value })
//                   }
//                 />
//                 <input
//                   type="password"
//                   placeholder="Confirm Password"
//                   value={registerData.confirm}
//                   onChange={(e) =>
//                     setRegisterData({ ...registerData, confirm: e.target.value })
//                   }
//                 />
//                 <button
//                   className="btn btn-primary btn-auth"
//                   onClick={handleRegister}
//                 >
//                   <i className="fas fa-user-plus"></i> Create Account
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Footer */}
//       <footer>
//         <div className="container">
//           <div className="footer-content">
//             <div className="footer-column">
//               <h3>Book Buddy</h3>
//               <p>
//                 Transforming learning through AI-powered tools for students and
//                 educators.
//               </p>
//               <div className="social-links">
//                 <a href="#twitter">
//                   <i className="fab fa-twitter"></i>
//                 </a>
//                 <a href="#linkedin">
//                   <i className="fab fa-linkedin"></i>
//                 </a>
//               </div>
//             </div>
//             <div className="copyright">
//               &copy; 2025 Book Buddy. All rights reserved.
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default Home;



// src/pages/Home.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "../styles/main.css";
import "../styles/auth.css";

const Home = () => {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");
  const [modalOpen, setModalOpen] = useState(false);

  const openAuthModal = (tab) => {
    setActiveTab(tab);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const handleLogin = async () => {
    try {
      const success = await login(loginData.email.trim(), loginData.password);
      if (success) {
        setModalOpen(false);
        navigate("/dashboard");
      } // login already alerts on failure
    } catch (err) {
      console.error("handleLogin error:", err);
      alert("Unexpected error during login");
    }
  };

  const handleRegister = async () => {
    console.log("🟢 Create Account clicked!");
    if (!registerData.name.trim() || !registerData.email.trim()) {
      alert("Please provide name and email");
      return;
    }
    if (registerData.password !== registerData.confirm) {
      alert("Passwords do not match");
      return;
    }
    try {
      const success = await register(
        registerData.name.trim(),
        registerData.email.trim(),
        registerData.password
      );
      console.log("Register result:", success);
      if (success) {
        setModalOpen(false);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("handleRegister error:", err);
      alert("Unexpected error during registration");
    }
  };

  const features = [
    {
      icon: "fa-file-pdf",
      title: "AI PDF Summarization",
      desc: "Upload any book or document and get a smart summary powered by AI.",
      route: "/summarizer",
    },
    {
      icon: "fa-robot",
      title: "Chat with Your Books",
      desc: "Ask questions and interact with your reading materials in real time.",
      route: "/dashboard",
    },
    {
      icon: "fa-bolt",
      title: "Smart Flashcards",
      desc: "Generate instant flashcards for quick revision and active recall.",
      route: "/dashboard",
    },
    {
      icon: "fa-question-circle",
      title: "Quiz Generator",
      desc: "Create quizzes automatically based on book content.",
      route: "/dashboard",
    },
    {
      icon: "fa-project-diagram",
      title: "Project Management",
      desc: "Organize study materials, notes, and projects efficiently.",
      route: "/dashboard",
    },
    {
      icon: "fa-chart-line",
      title: "Progress Analytics",
      desc: "Track your learning journey and monitor improvement trends.",
      route: "/dashboard",
    },
  ];

  const handleFeatureClick = (route) => {
    if (user) navigate(route);
    else openAuthModal("login");
  };

  return (
    <div className="landing-page">
      <Navbar openAuthModal={openAuthModal} />

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Transform Learning with AI-Powered Book Analysis</h1>
            <p>
              Book Buddy helps students, teachers, and professionals extract key
              insights from books and documents through advanced AI summarization,
              interactive flashcards, and intelligent Q&A.
            </p>
            {!user && (
              <div className="hero-buttons">
                <button
                  className="btn btn-accent"
                  onClick={() => openAuthModal("register")}
                >
                  <i className="fas fa-rocket"></i> Start Free Trial
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="container">
          <div className="section-title">
            <h2>Powerful Features for Every Learner</h2>
            <p>Click on a feature to explore it.</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div
                className="feature-card clickable"
                key={i}
                onClick={() => handleFeatureClick(f.route)}
              >
                <div className="feature-icon">
                  <i className={`fas ${f.icon}`}></i>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <button className="btn btn-accent btn-small" onClick={(e) => { e.stopPropagation(); handleFeatureClick(f.route); }}>
                  Go to {f.title.split(" ")[0]} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {modalOpen && (
        <div id="authModal" className="modal" style={{ display: "flex" }}>
          <div className="modal-content">
            <span className="close-modal" onClick={closeModal}>
              &times;
            </span>

            <div className="modal-tabs">
              <div
                className={`modal-tab ${activeTab === "login" ? "active" : ""}`}
                onClick={() => setActiveTab("login")}
              >
                Login
              </div>
              <div
                className={`modal-tab ${activeTab === "register" ? "active" : ""}`}
                onClick={() => setActiveTab("register")}
              >
                Register
              </div>
            </div>

            {activeTab === "login" ? (
              <div className="auth-form">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                />
                <button className="btn btn-primary btn-auth" onClick={handleLogin}>
                  <i className="fas fa-sign-in-alt"></i> Login
                </button>
              </div>
            ) : (
              <div className="auth-form">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={registerData.name}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, name: e.target.value })
                  }
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, email: e.target.value })
                  }
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, password: e.target.value })
                  }
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={registerData.confirm}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, confirm: e.target.value })
                  }
                />
                <button
                  className="btn btn-primary btn-auth"
                  onClick={handleRegister}
                >
                  <i className="fas fa-user-plus"></i> Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <h3>Book Buddy</h3>
              <p>
                Transforming learning through AI-powered tools for students and
                educators.
              </p>
              <div className="social-links">
                <a href="#twitter"><i className="fab fa-twitter"></i></a>
                <a href="#linkedin"><i className="fab fa-linkedin"></i></a>
              </div>
            </div>
            <div className="copyright">
              &copy; 2025 Book Buddy. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
