import React, { useState } from "react";
import api from "../api/axiosInstance";

function TextSummarizer() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post("/summarize/text", { text });
    setSummary(res.data.summary);
  };

  return (
    <div className="container">
      <h2>Text Summarizer</h2>
      <textarea
        rows="8"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your text here..."
      />
      <button onClick={handleSubmit}>Summarize</button>
      {summary && (
        <div className="summary-box">
          <h3>Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}

export default TextSummarizer;
