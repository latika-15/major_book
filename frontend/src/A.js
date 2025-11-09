
// import React,{useState} from "react";
// import axios from 'axios'; // http request to backend api

// import './App.css';

// function App() {
//   const [text,setText]=useState("");
//   const [summary,setSummary]=useState("");
//   const [file,setFile]=useState(null);
//   const [mode,setMode]=useState("text");
//   const [loading,setLoading]=useState(false);

//   const handleSummarize=async()=>{

//     setLoading(true);
//     setSummary("")
//     try{
//       let response;
//       if(mode==="text"){
//         if(!text.trim()) return alert("Please enter some text to summarize.");
//         response=await axios.post('http://localhost:5000/summarize/text',{text});
//       }
//       else if (mode==="file"){
//         if(!file) return alert("Please upload a PDF file to summarize.");
//         const formData=new FormData();
//         formData.append("file",file)
//         response=await axios.post("http://localhost:5000/summarize/pdf",formData,{headers:{"Content-Type":"multipart/form-data"}})
//       }

//       setSummary(response.data.summary);
//     }
//     catch(err){
//       console.error(err);
//       alert("Something went wrong.Please try again.");
//     }
//     setLoading(false);
//   }

//   return (
//     <div className="App">
//       <h1>AI summarizer(Text and PDF)</h1>
//       <div className="mode-buttons">
//         <button className={mode==="text"?"active":""} onClick={()=>setMode("text")}>Text</button>
//         <button className={mode==="file"?"active":""} onClick={()=>setMode("file")}>PDF</button>


//       </div>

//       {mode==="text" && (
//         <textarea placeholder="Paste your text here..." 
//         rows="10"
//         value={text}
//         onChange={(e)=>setText(e.target.value)}></textarea>
//       )}

//       {mode==="file" && (
//         <input type="file"
//         accept="/application/pdf"
//         onChange={(e)=>setFile(e.target.files[0])}></input>
//       )}

//       <button onClick={handleSummarize} disabled={loading}> 
//         {loading?"Summarizing...":"Summarize"}

//       </button>

//       {summary && (
//         <div className="summary">
//         <h2>Summary</h2>
//         <p>{summary}</p>
//         </div>
//       )}

//     </div>
//   );
// }

// export default App;




// import React, { useState } from "react";
// import axios from "axios";
// import "./App.css"; // your main styles (can combine main.css + auth.css)

// function App() {
//   const [text, setText] = useState("");
//   const [summary, setSummary] = useState("");
//   const [file, setFile] = useState(null);
//   const [mode, setMode] = useState("text");
//   const [loading, setLoading] = useState(false);
//   const [authModal, setAuthModal] = useState(false);
//   const [authMode, setAuthMode] = useState("login");

//   // --- Summarization Logic ---
//   const handleSummarize = async () => {
//     setLoading(true);
//     setSummary("");
//     try {
//       let response;
//       if (mode === "text") {
//         if (!text.trim()) return alert("Please enter some text to summarize.");
//         response = await axios.post("http://localhost:5000/summarize/text", { text });
//       } else if (mode === "file") {
//         if (!file) return alert("Please upload a PDF file to summarize.");
//         const formData = new FormData();
//         formData.append("file", file);
//         response = await axios.post("http://localhost:5000/summarize/pdf", formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//       }
//       setSummary(response.data.summary);
//     } catch (err) {
//       console.error(err);
//       alert("Something went wrong. Please try again.");
//     }
//     setLoading(false);
//   };

//   // --- Auth Modal Handlers ---
//   const openAuthModal = (mode) => {
//     setAuthMode(mode);
//     setAuthModal(true);
//   };
//   const closeAuthModal = () => setAuthModal(false);

//   return (
//     <div className="landing-page">
//       {/* --- HEADER --- */}
//       <header className="landing-header">
//         <div className="container">
//           <nav className="navbar">
//             <div className="logo">
//               <i className="fas fa-book-open"></i>
//               <span>Book Buddy</span>
//             </div>
//             <div className="nav-links">
//               <a href="#features">Features</a>
//               <a href="#summarizer">Summarizer</a>
//               <a href="#contact">Contact</a>
//             </div>
//             <div className="auth-buttons">
//               <button className="btn btn-outline" onClick={() => openAuthModal("login")}>
//                 Login
//               </button>
//               <button className="btn btn-primary" onClick={() => openAuthModal("register")}>
//                 Get Started
//               </button>
//             </div>
//           </nav>
//         </div>
//       </header>

//       {/* --- HERO --- */}
//       <section className="hero">
//         <div className="container hero-container">
//           <div className="hero-content">
//             <h1>Transform Learning with AI-Powered Book Analysis</h1>
//             <p>
//               Extract key insights from books and documents through AI summarization, interactive flashcards,
//               and intelligent Q&A.
//             </p>
//             <div className="hero-buttons">
//               <button className="btn btn-accent" onClick={() => openAuthModal("register")}>
//                 <i className="fas fa-rocket"></i> Start Free Trial
//               </button>
//               <button className="btn btn-outline">
//                 <i className="fas fa-play-circle"></i> Watch Demo
//               </button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* --- SUMMARIZER SECTION --- */}
//       <section id="summarizer" className="summarizer-section">
//         <div className="container">
//           <h2>AI Book Summarizer</h2>
//           <div className="mode-buttons">
//             <button
//               className={mode === "text" ? "active" : ""}
//               onClick={() => setMode("text")}
//             >
//               Text
//             </button>
//             <button
//               className={mode === "file" ? "active" : ""}
//               onClick={() => setMode("file")}
//             >
//               PDF
//             </button>
//           </div>

//           {mode === "text" && (
//             <textarea
//               placeholder="Paste your text here..."
//               rows="8"
//               value={text}
//               onChange={(e) => setText(e.target.value)}
//             ></textarea>
//           )}

//           {mode === "file" && (
//             <input
//               type="file"
//               accept="application/pdf"
//               onChange={(e) => setFile(e.target.files[0])}
//             />
//           )}

//           <button onClick={handleSummarize} disabled={loading}>
//             {loading ? "Summarizing..." : "Summarize"}
//           </button>

//           {summary && (
//             <div className="summary-box">
//               <h3>Summary</h3>
//               <p>{summary}</p>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* --- FOOTER --- */}
//       <footer>
//         <div className="container">
//           <div className="footer-content">
//             <div className="footer-column">
//               <h3>Book Buddy</h3>
//               <p>Transforming learning through AI-powered tools for students and educators.</p>
//             </div>
//             <div className="footer-column">
//               <h3>Company</h3>
//               <ul>
//                 {/* <li><a href="#">About</a></li>
//                 <li><a href="#">Privacy Policy</a></li>
//                 <li><a href="#">Terms</a></li> */}
//               </ul>
//             </div>
//           </div>
//           <div className="copyright">
//             © 2025 Book Buddy. All rights reserved.
//           </div>
//         </div>
//       </footer>

//       {/* --- AUTH MODAL --- */}
//       {authModal && (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <span className="close-modal" onClick={closeAuthModal}>
//               &times;
//             </span>
//             <h2>{authMode === "login" ? "Login to Book Buddy" : "Create an Account"}</h2>

//             {authMode === "login" ? (
//               <>
//                 <input type="email" placeholder="Email" className="form-control" />
//                 <input type="password" placeholder="Password" className="form-control" />
//                 <button className="btn btn-primary">Login</button>
//                 <p>
//                   Don’t have an account?{" "}
//                   {/* <a href="#" onClick={() => setAuthMode("register")}>
//                     Register here
//                   </a> */}
//                 </p>
//               </>
//             ) : (
//               <>
//                 <input type="text" placeholder="Full Name" className="form-control" />
//                 <input type="email" placeholder="Email" className="form-control" />
//                 <input type="password" placeholder="Password" className="form-control" />
//                 <button className="btn btn-primary">Register</button>
//                 {/* <p>
//                   Already have an account?{" "}
//                   <a href="#" onClick={() => setAuthMode("login")}>
//                     Login here
//                   </a>
//                 </p> */}
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;

