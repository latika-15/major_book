// import React, { useState } from "react";
// import "../styles/main.css";
// import "../styles/pdf-summarizer.css";
// import axios from "axios";

// const Summarizer = ({ user }) => {
//   const [activeTab, setActiveTab] = useState("summarizer");
//   const [pdfFile, setPdfFile] = useState(null);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [summary, setSummary] = useState("");
//   const [summaryGenerated, setSummaryGenerated] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleFileSelect = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Check if file is PDF
//       if (file.type !== "application/pdf") {
//         setError("Please select a PDF file");
//         return;
//       }
      
//       // Check file size (25MB limit)
//       if (file.size > 25 * 1024 * 1024) {
//         setError("File size must be less than 25MB");
//         return;
//       }
      
//       setPdfFile(file);
//       setSummary("");
//       setSummaryGenerated(false);
//       setError("");
//     }
//   };

//   const handleUpload = async () => {
//     if (!pdfFile) {
//       setError("Please select a PDF file first");
//       return;
//     }

//     setIsLoading(true);
//     setError("");
//     setUploadProgress(0);
//     setSummary("");

//     // Simulate upload progress
//     let progress = 0;
//     const interval = setInterval(() => {
//       progress += 10;
//       setUploadProgress(progress);
//       if (progress >= 90) {
//         clearInterval(interval);
//       }
//     }, 200);

//     try {
//       const formData = new FormData();
//       formData.append("file", pdfFile);

//       const response = await axios.post(
//         "http://localhost:5000/summarize/pdf",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//           timeout: 30000, // 30 seconds timeout
//         }
//       );

//       clearInterval(interval);
//       setUploadProgress(100);
      
//       if (response.data.summary) {
//         setSummary(response.data.summary);
//         setSummaryGenerated(true);
//       } else if (response.data.error) {
//         setError(response.data.error);
//       } else {
//         setError("Unexpected response from server");
//       }
//     } catch (err) {
//       clearInterval(interval);
//       console.error("Upload error:", err);
      
//       if (err.response) {
//         // Server responded with error status
//         setError(err.response.data.error || "Server error occurred");
//       } else if (err.request) {
//         // Request was made but no response received
//         setError("Cannot connect to server. Make sure the backend is running on port 5000.");
//       } else {
//         // Other errors
//         setError("An unexpected error occurred");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const switchTool = (tool) => {
//     setActiveTab(tool);
//     setSummary("");
//     setSummaryGenerated(false);
//     setError("");
//   };

//   const downloadSummary = () => {
//     const blob = new Blob([summary], { type: "text/plain" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = "summary.txt";
//     link.click();
//   };

//   const printSummary = () => {
//     const printWindow = window.open("", "_blank");
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>PDF Summary</title>
//           <style>
//             body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
//             pre { white-space: pre-wrap; word-wrap: break-word; }
//           </style>
//         </head>
//         <body>
//           <h1>PDF Summary</h1>
//           <pre>${summary}</pre>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.print();
//   };

//   return (
//     <div className="pdf-tools-page">
//       {/* Header */}
//       <header className="dashboard-header">
//         <div className="container">
//           <nav className="navbar">
//             <div className="logo">
//               <i className="fas fa-book-open"></i>
//               <span>Book Buddy</span>
//             </div>
//             <div className="nav-links">
//               <a href="/" className="nav-link"><i className="fas fa-home"></i> Home</a>
//               <a href="/dashboard" className="nav-link"><i className="fas fa-tachometer-alt"></i> Dashboard</a>
//               <a href="/summarizer" className="nav-link active"><i className="fas fa-file-pdf"></i> PDF Tools</a>
//               <a href="/projects" className="nav-link"><i className="fas fa-project-diagram"></i> Projects</a>
//             </div>
//             <div className="user-menu">
//               <div className="user-info">
//                 <div className="user-role">Student</div>
//                 <span>{user?.name || "Loading..."}</span>
//                 <div className="user-dropdown">
//                   <i className="fas fa-caret-down"></i>
//                   <div className="dropdown-content">
//                     <a href="#user"><i className="fas fa-user"></i> Profile</a>
//                     <a href="#cog"><i className="fas fa-cog"></i> Settings</a>
//                     <a href="#signout"><i className="fas fa-sign-out-alt"></i> Logout</a>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </nav>
//         </div>
//       </header>

//       {/* Main */}
//       <main className="pdf-tools-main">
//         <div className="container">
//           {/* Page Header */}
//           <section className="page-header">
//             <div className="header-content">
//               <h1><i className="fas fa-file-pdf"></i> PDF Analysis Tools</h1>
//               <p>Upload your books and documents to generate summaries, chat with content, create flashcards, and generate quizzes</p>
//             </div>
//             <div className="header-stats">
//               <div className="stat-badge">
//                 <i className="fas fa-sync-alt"></i>
//                 <span>3 trials left</span>
//               </div>
//             </div>
//           </section>

//           {/* Tools Navigation */}
//           <section className="tools-navigation">
//             <div className="nav-tabs">
//               {["summarizer", "chat", "flashcards", "quiz", "history"].map((tool) => (
//                 <button
//                   key={tool}
//                   className={`nav-tab ${activeTab === tool ? "active" : ""}`}
//                   onClick={() => switchTool(tool)}
//                 >
//                   <i className={`fas ${tool === "summarizer" ? "fa-file-alt" :
//                                  tool === "chat" ? "fa-robot" :
//                                  tool === "flashcards" ? "fa-bolt" :
//                                  tool === "quiz" ? "fa-question-circle" :
//                                  "fa-history"}`}></i> {tool.charAt(0).toUpperCase() + tool.slice(1)}
//                 </button>
//               ))}
//             </div>
//           </section>

//           {/* Error Display */}
//           {error && (
//             <div className="error-message" style={{
//               background: "#ffe6e6",
//               border: "1px solid #ffcccc",
//               color: "#d63031",
//               padding: "12px",
//               borderRadius: "8px",
//               marginBottom: "20px",
//               display: "flex",
//               alignItems: "center",
//               gap: "10px"
//             }}>
//               <i className="fas fa-exclamation-triangle"></i>
//               <span>{error}</span>
//             </div>
//           )}

//           {/* Upload Section */}
//           {activeTab === "summarizer" && (
//             <section className="upload-section">
//               <div className="upload-card">
//                 <div className="upload-header">
//                   <h3><i className="fas fa-cloud-upload-alt"></i> Upload Your PDF</h3>
//                   <p>Supported format: PDF • Max size: 25MB</p>
//                 </div>
//                 <div className="upload-area">
//                   <div className="upload-content">
//                     <i className="fas fa-file-pdf upload-icon"></i>
//                     <h4>Drag & Drop your PDF here</h4>
//                     <p>or click to browse files</p>
//                     <input 
//                       type="file" 
//                       accept=".pdf" 
//                       onChange={handleFileSelect} 
//                       hidden 
//                       id="pdfUpload" 
//                       disabled={isLoading}
//                     />
//                     <button 
//                       className="btn btn-primary" 
//                       onClick={() => document.getElementById("pdfUpload").click()}
//                       disabled={isLoading}
//                     >
//                       <i className="fas fa-file-upload"></i> Select PDF File
//                     </button>
//                   </div>
//                 </div>
                
//                 {pdfFile && (
//                   <div className="file-info" style={{
//                     background: "#f8f9fa",
//                     padding: "12px",
//                     borderRadius: "8px",
//                     margin: "15px 0",
//                     border: "1px solid #e9ecef"
//                   }}>
//                     <i className="fas fa-file-pdf" style={{color: "#e74c3c", marginRight: "8px"}}></i>
//                     <strong>Selected:</strong> {pdfFile.name} ({(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
//                   </div>
//                 )}

//                 {uploadProgress > 0 && (
//                   <div className="upload-progress">
//                     <div className="progress-bar">
//                       <div 
//                         className="progress-fill" 
//                         style={{ width: `${uploadProgress}%` }}
//                       ></div>
//                     </div>
//                     <div className="progress-info">
//                       <span>
//                         {isLoading ? "Processing..." : "Uploading..."} {uploadProgress}%
//                       </span>
//                     </div>
//                   </div>
//                 )}

//                 <button 
//                   className="btn btn-accent btn-large" 
//                   onClick={handleUpload} 
//                   disabled={!pdfFile || isLoading}
//                   style={{position: "relative"}}
//                 >
//                   {isLoading && (
//                     <i className="fas fa-spinner fa-spin" style={{marginRight: "8px"}}></i>
//                   )}
//                   <i className="fas fa-magic"></i> Generate Summary
//                 </button>
//               </div>
//             </section>
//           )}

//           {/* Summary Result */}
//           {summaryGenerated && activeTab === "summarizer" && (
//             <section className="summary-result">
//               <h4><i className="fas fa-check-circle" style={{color: "#27ae60"}}></i> Summary Generated Successfully!</h4>
//               <div className="summary-card">
//                 <pre style={{
//                   background: "#f8f9fa",
//                   border: "1px solid #e9ecef",
//                   padding: "1.5em",
//                   borderRadius: "0.6em",
//                   fontSize: "1em",
//                   color: "#333",
//                   maxHeight: "50vh",
//                   overflow: "auto",
//                   lineHeight: "1.5",
//                   whiteSpace: "pre-wrap",
//                   wordWrap: "break-word"
//                 }}>
//                   {summary}
//                 </pre>
//               </div>
//               <div className="summary-actions" style={{marginTop: "1.5em", display: "flex", gap: "10px"}}>
//                 <button className="btn btn-outline" onClick={downloadSummary}>
//                   <i className="fas fa-download"></i> Download
//                 </button>
//                 <button className="btn btn-outline" onClick={printSummary}>
//                   <i className="fas fa-print"></i> Print
//                 </button>
//               </div>
//             </section>
//           )}
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="dashboard-footer">
//         <div className="container">
//           <div className="footer-content">
//             <div className="footer-info">
//               <p>&copy; 2024 Book Buddy. AI-Powered Learning Platform</p>
//             </div>
//             <div className="footer-links">
//               <a href="#help">Help</a>
//               <a href="#privacy">Privacy</a>
//               <a href="#terms">Terms</a>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default Summarizer;


// src/pages/Summarizer.jsx
import React, { useState } from "react";
import "../styles/main.css";
import "../styles/pdf-summarizer.css";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Navbar from "../components/Navbar";





const Summarizer = () => {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("summarizer");
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [summary, setSummary] = useState("");
  const [summaryGenerated, setSummaryGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Please select a PDF file");
        return;
      }
      
      if (file.size > 25 * 1024 * 1024) {
        setError("File size must be less than 25MB");
        return;
      }
      
      setPdfFile(file);
      setSummary("");
      setSummaryGenerated(false);
      setError("");
    }
  };
  console.log("Auth token:", token);

  const handleUpload = async () => {
    if (!pdfFile) {
      setError("Please select a PDF file first");
      return;
    }

    if (!token) {
      setError("Please log in to use this feature");
      return;
    }

    setIsLoading(true);
    setError("");
    setUploadProgress(0);
    setSummary("");

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 90) {
        clearInterval(interval);
      }
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);

      const response = await axios.post(
        "http://localhost:5000/api/summarize/pdf",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          },
          timeout: 30000,
        }
      );

      clearInterval(interval);
      setUploadProgress(100);
      
      if (response.data.summary) {
        setSummary(response.data.summary);
        setSummaryGenerated(true);
      } else if (response.data.error) {
        setError(response.data.error);
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      clearInterval(interval);
      console.error("Upload error:", err);
      
      if (err.response) {
        setError(err.response.data.error || "Server error occurred");
      } else if (err.request) {
        setError("Cannot connect to server. Make sure the backend is running on port 5000.");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchTool = (tool) => {
    setActiveTab(tool);
    setSummary("");
    setSummaryGenerated(false);
    setError("");
  };

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "summary.txt";
    link.click();
  };

  const printSummary = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>PDF Summary</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
          </style>
        </head>
        <body>
          <h1>PDF Summary</h1>
          <pre>${summary}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="pdf-tools-page">
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
              <a href="/" className="nav-link"><i className="fas fa-home"></i> Home</a>
              <a href="/dashboard" className="nav-link"><i className="fas fa-tachometer-alt"></i> Dashboard</a>
              <a href="/summarizer" className="nav-link active"><i className="fas fa-file-pdf"></i> PDF Tools</a>
              <a href="/projects" className="nav-link"><i className="fas fa-project-diagram"></i> Projects</a>
            </div>
            <div className="user-menu">
              <div className="user-info">
                <div className="user-role">Student</div>
                <span>{user?.name || "Loading..."}</span>
                <div className="user-dropdown">
                  <i className="fas fa-caret-down"></i>
                  <div className="dropdown-content">
                    <a href="#user"><i className="fas fa-user"></i> Profile</a>
                    <a href="#cog"><i className="fas fa-cog"></i> Settings</a>
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

      {/* Main */}
      <main className="pdf-tools-main">
        <div className="container">
          {/* Page Header */}
          <section className="page-header">
            <div className="header-content">
              <h1><i className="fas fa-file-pdf"></i> PDF Analysis Tools</h1>
              <p>Upload your books and documents to generate summaries, chat with content, create flashcards, and generate quizzes</p>
            </div>
            <div className="header-stats">
              <div className="stat-badge">
                <i className="fas fa-sync-alt"></i>
                <span>3 trials left</span>
              </div>
            </div>
          </section>

          {/* Tools Navigation */}
          <section className="tools-navigation">
            <div className="nav-tabs">
              {["summarizer", "chat", "flashcards", "quiz", "history"].map((tool) => (
                <button
                  key={tool}
                  className={`nav-tab ${activeTab === tool ? "active" : ""}`}
                  onClick={() => switchTool(tool)}
                >
                  <i className={`fas ${tool === "summarizer" ? "fa-file-alt" :
                                 tool === "chat" ? "fa-robot" :
                                 tool === "flashcards" ? "fa-bolt" :
                                 tool === "quiz" ? "fa-question-circle" :
                                 "fa-history"}`}></i> {tool.charAt(0).toUpperCase() + tool.slice(1)}
                </button>
              ))}
            </div>
          </section>

          {/* Error Display */}
          {error && (
            <div className="error-message" style={{
              background: "#ffe6e6",
              border: "1px solid #ffcccc",
              color: "#d63031",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Upload Section */}
          {activeTab === "summarizer" && (
            <section className="upload-section">
              <div className="upload-card">
                <div className="upload-header">
                  <h3><i className="fas fa-cloud-upload-alt"></i> Upload Your PDF</h3>
                  <p>Supported format: PDF • Max size: 25MB</p>
                </div>
                <div className="upload-area">
                  <div className="upload-content">
                    <i className="fas fa-file-pdf upload-icon"></i>
                    <h4>Drag & Drop your PDF here</h4>
                    <p>or click to browse files</p>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileSelect} 
                      hidden 
                      id="pdfUpload" 
                      disabled={isLoading}
                    />
                    <button 
                      className="btn btn-primary" 
                      onClick={() => document.getElementById("pdfUpload").click()}
                      disabled={isLoading}
                    >
                      <i className="fas fa-file-upload"></i> Select PDF File
                    </button>
                  </div>
                </div>
                
                {pdfFile && (
                  <div className="file-info" style={{
                    background: "#f8f9fa",
                    padding: "12px",
                    borderRadius: "8px",
                    margin: "15px 0",
                    border: "1px solid #e9ecef"
                  }}>
                    <i className="fas fa-file-pdf" style={{color: "#e74c3c", marginRight: "8px"}}></i>
                    <strong>Selected:</strong> {pdfFile.name} ({(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                )}

                {uploadProgress > 0 && (
                  <div className="upload-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <div className="progress-info">
                      <span>
                        {isLoading ? "Processing..." : "Uploading..."} {uploadProgress}%
                      </span>
                    </div>
                  </div>
                )}

                <button 
                  className="btn btn-accent btn-large" 
                  onClick={handleUpload} 
                  disabled={!pdfFile || isLoading}
                  style={{position: "relative"}}
                >
                  {isLoading && (
                    <i className="fas fa-spinner fa-spin" style={{marginRight: "8px"}}></i>
                  )}
                  <i className="fas fa-magic"></i> Generate Summary
                </button>
              </div>
            </section>
          )}

          {/* Summary Result */}
          {summaryGenerated && activeTab === "summarizer" && (
            <section className="summary-result">
              <h4><i className="fas fa-check-circle" style={{color: "#27ae60"}}></i> Summary Generated Successfully!</h4>
              <div className="summary-card">
                <pre style={{
                  background: "#f8f9fa",
                  border: "1px solid #e9ecef",
                  padding: "1.5em",
                  borderRadius: "0.6em",
                  fontSize: "1em",
                  color: "#333",
                  maxHeight: "50vh",
                  overflow: "auto",
                  lineHeight: "1.5",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word"
                }}>
                  {summary}
                </pre>
              </div>
              <div className="summary-actions" style={{marginTop: "1.5em", display: "flex", gap: "10px"}}>
                <button className="btn btn-outline" onClick={downloadSummary}>
                  <i className="fas fa-download"></i> Download
                </button>
                <button className="btn btn-outline" onClick={printSummary}>
                  <i className="fas fa-print"></i> Print
                </button>
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

export default Summarizer;