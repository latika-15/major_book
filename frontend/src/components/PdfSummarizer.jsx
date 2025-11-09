// import React, { useState } from "react";
// import api from "../api/axiosInstance";

// function PdfSummarizer() {
//   const [file, setFile] = useState(null);
//   const [summary, setSummary] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append("file", file);
//     const res = await api.post("/summarize/pdf", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     setSummary(res.data.summary);
//   };

//   return (
//     <div className="container">
//       <h2>PDF Summarizer</h2>
//       <input type="file" onChange={(e) => setFile(e.target.files[0])} />
//       <button onClick={handleSubmit}>Upload & Summarize</button>
//       {summary && (
//         <div className="summary-box">
//           <h3>Summary:</h3>
//           <p>{summary}</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default PdfSummarizer;
