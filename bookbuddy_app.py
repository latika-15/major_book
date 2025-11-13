"""
BookBuddy - Professional Streamlit App with Enhanced UI
"""

import streamlit as st
from dotenv import load_dotenv
import os
import tempfile
from datetime import datetime
from pymongo import MongoClient
import bcrypt
import pandas as pd
from langchain_community.document_loaders import PyPDFLoader
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq
import json
import re

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")
APP_TITLE = "📚 BookBuddy"

if not GROQ_API_KEY:
    st.warning("GROQ_API_KEY not found in environment. Chains will fail without it.")

if not MONGO_URI:
    st.warning("MONGO_URI not found in environment. User auth and analytics will not work.")

def get_db():
    if not MONGO_URI:
        return None
    client = MongoClient(MONGO_URI)
    return client.bookbuddy

def hash_password(plain_password: str) -> bytes:
    return bcrypt.hashpw(plain_password.encode(), bcrypt.gensalt())

def check_password(plain_password: str, hashed: bytes) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode(), hashed)
    except Exception:
        return False

# Initialize session state
if "user" not in st.session_state:
    st.session_state.user = None
if "nav" not in st.session_state:
    st.session_state.nav = "home"
if "message_history" not in st.session_state:
    st.session_state.message_history = []
if "flashcards" not in st.session_state:
    st.session_state.flashcards = []
if "current_flashcard" not in st.session_state:
    st.session_state.current_flashcard = 0
if "show_flashcard_answer" not in st.session_state:
    st.session_state.show_flashcard_answer = False
if "show_flashcard_viewer" not in st.session_state:
    st.session_state.show_flashcard_viewer = False

st.set_page_config(
    page_title="BookBuddy - AI Study Companion", 
    layout="wide", 
    initial_sidebar_state="collapsed",
    page_icon="📚"
)

# Hide Streamlit default elements
hide_streamlit_style = """
<style>
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}
.stDeployButton {display:none;}
</style>
"""
st.markdown(hide_streamlit_style, unsafe_allow_html=True)

# Enhanced CSS styling with blueish-greenish theme
st.markdown(
    """
    <style>
    :root {
        --primary: #2A9D8F;
        --primary-dark: #21867A;
        --primary-light: #E8F6F3;
        --secondary: #264653;
        --accent: #E9C46A;
        --success: #2A9D8F;
        --warning: #F4A261;
        --danger: #E76F51;
        --light: #F8F9FA;
        --dark: #264653;
        --gray: #6C757D;
        --gray-light: #E9ECEF;
        --gray-dark: #495057;
        --border-radius: 16px;
        --border-radius-sm: 10px;
        --box-shadow: 0 8px 30px rgba(42, 157, 143, 0.12);
        --box-shadow-lg: 0 15px 50px rgba(42, 157, 143, 0.18);
        --transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    /* Global Styles */
    .stApp {
        background: linear-gradient(135deg, #F8FDFC 0%, #E3F2FD 50%, #E0F2F1 100%);
        font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    }

    .main-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 20px;
    }

    /* Header Styles */
    .dashboard-header {
        background: linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%);
        box-shadow: var(--box-shadow);
        position: sticky;
        top: 0;
        z-index: 1000;
        backdrop-filter: blur(10px);
    }
    
    .navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 2rem;
        max-width: 1400px;
        margin: 0 auto;
    }

    .logo {
        display: flex;
        align-items: center;
        font-size: 1.8rem;
        gap: 12px;
        font-weight: 800;
        color: white;
        letter-spacing: -0.5px;
    }

    .logo-icon {
        font-size: 2.2rem;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }

    .nav-links {
        display: flex;
        gap: 2rem;
        align-items: center;
    }
    
    .nav-link {
        color: rgba(255,255,255,0.9);
        font-weight: 600;
        padding: 0.75rem 1.5rem;
        border-radius: var(--border-radius-sm);
        transition: var(--transition);
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }
    
    .nav-link::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 2px;
        background: var(--accent);
        transition: var(--transition);
        transform: translateX(-50%);
    }
    
    .nav-link:hover, .nav-link.active {
        color: white;
        background: rgba(255,255,255,0.1);
        transform: translateY(-2px);
    }
    
    .nav-link:hover::before, .nav-link.active::before {
        width: 80%;
    }

    .user-menu {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .user-info {
        background: rgba(255,255,255,0.15);
        color: white;
        padding: 0.75rem 1.25rem;
        border-radius: var(--border-radius-sm);
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
        transition: var(--transition);
    }
    
    .user-info:hover {
        background: rgba(255,255,255,0.25);
        transform: translateY(-2px);
    }

    /* Button Styles */
    .stButton button {
        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        color: white;
        font-weight: 600;
        font-size: 1rem;
        border: none;
        border-radius: var(--border-radius-sm);
        padding: 12px 24px;
        cursor: pointer;
        box-shadow: var(--box-shadow);
        outline: none;
        transition: var(--transition);
        display: inline-flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        justify-content: center;
    }
    
    .stButton button:hover {
        transform: translateY(-3px);
        box-shadow: var(--box-shadow-lg);
        background: linear-gradient(135deg, var(--primary-dark) 0%, var(--secondary) 100%);
    }
    
    .btn-primary {
        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%) !important;
    }
    
    .btn-accent {
        background: linear-gradient(135deg, var(--accent) 0%, var(--warning) 100%) !important;
    }
    
    .btn-success {
        background: var(--success) !important;
    }
    
    .btn-outline {
        background: transparent !important;
        color: var(--primary) !important;
        border: 2px solid var(--primary) !important;
        box-shadow: none !important;
    }
    
    .btn-outline:hover {
        background: var(--primary) !important;
        color: white !important;
    }

    /* Card Styles */
    .content-card {
        background: rgba(255, 255, 255, 0.95);
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        padding: 2.5rem;
        margin-bottom: 2rem;
        border: 1px solid rgba(42, 157, 143, 0.1);
        backdrop-filter: blur(10px);
        transition: var(--transition);
        position: relative;
        overflow: hidden;
    }
    
    .content-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--primary), var(--accent));
    }
    
    .content-card:hover {
        transform: translateY(-5px);
        box-shadow: var(--box-shadow-lg);
    }

    /* Form Styles */
    .stTextInput>div>div>input, .stTextInput>div>div>input:focus {
        background: rgba(255,255,255,0.9);
        border: 2px solid var(--primary-light);
        border-radius: var(--border-radius-sm);
        padding: 12px 16px;
        font-size: 1rem;
        transition: var(--transition);
    }
    
    .stTextInput>div>div>input:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(42, 157, 143, 0.1);
    }

    /* Flashcard Styles */
    .flashcard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        margin: 2rem 0;
    }
    
    .flashcard-preview {
        background: linear-gradient(135deg, #ffffff 0%, var(--primary-light) 100%);
        border: 2px solid var(--primary-light);
        border-radius: var(--border-radius);
        padding: 1.5rem;
        cursor: pointer;
        transition: var(--transition);
        text-align: center;
        box-shadow: var(--box-shadow);
    }
    
    .flashcard-preview:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: var(--box-shadow-lg);
        border-color: var(--primary);
    }
    
    .flashcard-preview h4 {
        color: var(--secondary);
        margin-bottom: 1rem;
        font-size: 1.1rem;
    }
    
    .flashcard-preview .question-preview {
        color: var(--dark);
        font-size: 0.95rem;
        opacity: 0.8;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    /* Flashcard Viewer */
    .flashcard-container {
        background: white;
        border-radius: var(--border-radius);
        padding: 3rem;
        margin: 2rem auto;
        max-width: 800px;
        box-shadow: var(--box-shadow-lg);
        text-align: center;
    }
    
    .flashcard-view {
        min-height: 300px;
        background: linear-gradient(135deg, #ffffff 0%, var(--primary-light) 100%);
        border: 3px solid var(--primary);
        border-radius: var(--border-radius);
        padding: 2rem;
        margin: 2rem 0;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        transition: var(--transition);
    }
    
    .flashcard-view:hover {
        transform: translateY(-5px);
        box-shadow: var(--box-shadow);
    }
    
    .flashcard-content {
        font-size: 1.3rem;
        color: var(--dark);
        line-height: 1.6;
        width: 100%;
    }
    
    .flashcard-question {
        background: linear-gradient(135deg, #ffffff 0%, var(--primary-light) 100%);
    }
    
    .flashcard-answer {
        background: linear-gradient(135deg, var(--accent) 0%, #f8f9fa 100%);
    }
    
    .flashcard-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 2rem;
    }
    
    .nav-btn {
        background: var(--primary);
        color: white;
        border: none;
        border-radius: var(--border-radius-sm);
        padding: 12px 24px;
        cursor: pointer;
        transition: var(--transition);
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
    }
    
    .nav-btn:hover {
        background: var(--primary-dark);
        transform: translateY(-2px);
    }
    
    .nav-btn:disabled {
        background: var(--gray-light);
        cursor: not-allowed;
        transform: none;
    }
    
    .flashcard-counter {
        color: var(--dark);
        font-weight: 600;
        font-size: 1.1rem;
    }

    /* Page Header */
    .page-header {
        text-align: center;
        padding: 3rem 0;
        background: linear-gradient(135deg, rgba(42, 157, 143, 0.1) 0%, rgba(38, 70, 83, 0.05) 100%);
        border-radius: var(--border-radius);
        margin: 2rem 0;
    }
    
    .page-header h1 {
        font-size: 3.5rem;
        background: linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 1rem;
        font-weight: 800;
    }
    
    .page-header p {
        font-size: 1.3rem;
        color: var(--gray-dark);
        max-width: 600px;
        margin: 0 auto;
        line-height: 1.6;
    }

    /* Feature Grid */
    .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin: 3rem 0;
    }
    
    .feature-card {
        background: white;
        padding: 2.5rem;
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        text-align: center;
        transition: var(--transition);
        border: 1px solid rgba(42, 157, 143, 0.1);
    }
    
    .feature-card:hover {
        transform: translateY(-10px);
        box-shadow: var(--box-shadow-lg);
    }
    
    .feature-icon {
        font-size: 3rem;
        margin-bottom: 1.5rem;
        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .feature-card h3 {
        color: var(--secondary);
        margin-bottom: 1rem;
        font-size: 1.4rem;
    }
    
    .feature-card p {
        color: var(--gray);
        line-height: 1.6;
    }

    /* Tab Styles */
    .stTabs [data-baseweb="tab-list"] {
        gap: 2rem;
        background: transparent;
    }
    
    .stTabs [data-baseweb="tab"] {
        background: rgba(255,255,255,0.8);
        border-radius: var(--border-radius-sm) var(--border-radius-sm) 0 0;
        padding: 1rem 2rem;
        font-weight: 600;
        color: var(--dark);
        border: 1px solid rgba(42, 157, 143, 0.2);
        transition: var(--transition);
    }
    
    .stTabs [data-baseweb="tab"]:hover {
        background: white;
        color: var(--primary);
    }
    
    .stTabs [aria-selected="true"] {
        background: white !important;
        color: var(--primary) !important;
        border-bottom: 3px solid var(--primary) !important;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .navbar {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
        }
        
        .nav-links {
            gap: 1rem;
        }
        
        .page-header h1 {
            font-size: 2.5rem;
        }
        
        .content-card {
            padding: 1.5rem;
        }
        
        .feature-grid {
            grid-template-columns: 1fr;
        }
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# Header/Navigation
st.markdown("""
<div class="dashboard-header">
    <div class="navbar">
        <div class="logo">
            <span class="logo-icon">📚</span>
            <span>BookBuddy</span>
        </div>
        <div class="nav-links">
            <div class="nav-link active">🏠 Home</div>
            <div class="nav-link">✨ Features</div>
            <div class="nav-link">📊 Dashboard</div>
            <div class="nav-link">ℹ️ About</div>
        </div>
        <div class="user-menu">
            <div class="user-info" id="user-info">
                <span>👤</span>
                <span id="username-display">Guest</span>
            </div>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# Update username display
if st.session_state.user:
    st.markdown(
        f"""
        <script>
            document.getElementById('username-display').textContent = '{st.session_state.user["username"]}';
        </script>
        """,
        unsafe_allow_html=True
    )

# Main content container
with st.container():
    st.markdown('<div class="main-container">', unsafe_allow_html=True)
    
    # Home page content
    if not st.session_state.user:
        # Hero Section
        st.markdown("""
        <div class="page-header">
            <h1>AI-Powered Study Companion</h1>
            <p>Transform your learning experience with intelligent PDF analysis, interactive quizzes, and smart flashcards</p>
        </div>
        """, unsafe_allow_html=True)
        
        # Features Grid
        st.markdown("""
        <div class="feature-grid">
            <div class="feature-card">
                <div class="feature-icon">📖</div>
                <h3>Smart Summaries</h3>
                <p>Generate concise, AI-powered summaries of your PDF documents in seconds. Perfect for quick revision and understanding key concepts.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">🧠</div>
                <h3>Interactive Quizzes</h3>
                <p>Test your knowledge with automatically generated quizzes. Get immediate feedback and track your learning progress.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">📇</div>
                <h3>Smart Flashcards</h3>
                <p>Create interactive flashcards from your study materials. Flip, review, and master concepts with spaced repetition.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">💬</div>
                <h3>AI Chat Assistant</h3>
                <p>Ask questions about your documents and get instant, context-aware answers from our advanced AI assistant.</p>
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        # Authentication Section
        auth_col1, auth_col2 = st.columns(2)
        
        with auth_col1:
            with st.container():
                st.markdown('<div class="content-card">', unsafe_allow_html=True)
                st.subheader("🔐 Login to Your Account")
                with st.form("login_form"):
                    login_user = st.text_input("👤 Username", placeholder="Enter your username")
                    login_pass = st.text_input("🔒 Password", type="password", placeholder="Enter your password")
                    login_sub = st.form_submit_button("🚀 Login to BookBuddy")
                    if login_sub:
                        db = get_db()
                        if db is not None:
                            user = db.users.find_one({"username": login_user})
                            if user and check_password(login_pass, user["password"]):
                                st.session_state.user = {"username": user["username"], "_id": user["_id"]}
                                st.success("🎉 Logged in successfully!")
                                st.rerun()
                            else:
                                st.error("❌ Invalid username or password")
                        else:
                            st.error("⚠️ Database not configured. Set MONGO_URI in .env")
                st.markdown('</div>', unsafe_allow_html=True)
        
        with auth_col2:
            with st.container():
                st.markdown('<div class="content-card">', unsafe_allow_html=True)
                st.subheader("🌟 Create New Account")
                with st.form("register_form"):
                    reg_user = st.text_input("👤 Choose Username", placeholder="Pick a unique username")
                    reg_email = st.text_input("📧 Email Address", placeholder="your.email@example.com")
                    reg_pass = st.text_input("🔒 Create Password", type="password", placeholder="Strong password")
                    reg_pass2 = st.text_input("🔒 Confirm Password", type="password", placeholder="Repeat your password")
                    reg_sub = st.form_submit_button("🚀 Create Account")
                    if reg_sub:
                        if reg_pass != reg_pass2:
                            st.error("❌ Passwords do not match")
                        else:
                            db = get_db()
                            if db is not None:
                                exists = db.users.find_one({"username": reg_user})
                                if exists:
                                    st.error("❌ Username already taken")
                                else:
                                    hashed = hash_password(reg_pass)
                                    db.users.insert_one({
                                        "username": reg_user, 
                                        "email": reg_email, 
                                        "password": hashed, 
                                        "created_at": datetime.utcnow(),
                                        "plan": "free"
                                    })
                                    st.success("🎉 Account created successfully! Please login.")
                            else:
                                st.error("⚠️ Database not configured. Set MONGO_URI in .env")
                st.markdown('</div>', unsafe_allow_html=True)
    
    else:
        # User is logged in - show tools
        st.markdown(f"""
        <div class="content-card">
            <h1>Welcome back, {st.session_state.user["username"]}! 👋</h1>
            <p style="font-size: 1.2rem; color: var(--gray-dark);">Ready to continue your learning journey? Choose your tool below.</p>
        </div>
        """, unsafe_allow_html=True)
        
        # Tabs for different tools
        tab1, tab2, tab3, tab4 = st.tabs(["📄 PDF Tools", "💬 Chat Assistant", "📇 Flashcards", "📊 Dashboard"])
        
        with tab1:
            with st.container():
                st.markdown('<div class="content-card">', unsafe_allow_html=True)
                st.subheader("📤 Upload & Process PDF")
                st.write("Upload your study materials and let BookBuddy work its magic!")
                
                uploaded_file = st.file_uploader("Choose a PDF file", type=["pdf"], key="pdf_uploader")
                
                if uploaded_file:
                    st.success(f"✅ **{uploaded_file.name}** uploaded successfully!")
                    
                    col1, col2, col3 = st.columns(3)
                    
                    with col1:
                        if st.button("📝 Generate Summary", use_container_width=True):
                            with st.spinner("🔄 Generating intelligent summary..."):
                                tfile = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
                                tfile.write(uploaded_file.read())
                                tfile.flush()
                                loader = PyPDFLoader(tfile.name)
                                pages = loader.load_and_split()
                                db = get_db()
                                upload_meta = None
                                if db is not None:
                                    upload_meta = {
                                        "username": st.session_state.user["username"],
                                        "filename": uploaded_file.name,
                                        "uploaded_at": datetime.utcnow(),
                                        "actions": ["uploaded"]
                                    }
                                    db.uploads.insert_one(upload_meta)
                                prompt_1 = ChatPromptTemplate.from_messages([
                                    ("system", "You are a helpful academic assistant. Provide a comprehensive yet concise summary of the user's PDF. Focus on key concepts, main arguments, and important details."),
                                    ("user", "{data}")
                                ])
                                llm = ChatGroq(model="llama-3.3-70b-versatile")
                                output_parser = StrOutputParser()
                                chain_1 = prompt_1 | llm | output_parser
                                try:
                                    summary_text = chain_1.invoke({"data": pages})
                                    st.success("🎉 Summary generated successfully!")
                                    st.markdown(f'<div class="content-card"><h4>📖 Document Summary</h4><div style="line-height: 1.8;">{summary_text}</div></div>', unsafe_allow_html=True)
                                    if db is not None and upload_meta:
                                        db.uploads.update_one({"_id": upload_meta.get("_id")}, {"$push": {"actions": {"type": "summary", "at": datetime.utcnow()}}})
                                except Exception as e:
                                    st.error(f"❌ Failed to generate summary: {e}")
                    
                    with col2:
                        if st.button("🧠 Generate Quiz", use_container_width=True):
                            with st.spinner("🔄 Creating challenging quiz..."):
                                tfile = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
                                tfile.write(uploaded_file.read())
                                tfile.flush()
                                loader = PyPDFLoader(tfile.name)
                                pages = loader.load_and_split()
                                db = get_db()
                                upload_meta = None
                                if db is not None:
                                    upload_meta = {
                                        "username": st.session_state.user["username"],
                                        "filename": uploaded_file.name,
                                        "uploaded_at": datetime.utcnow(),
                                        "actions": ["uploaded"]
                                    }
                                    db.uploads.insert_one(upload_meta)
                                prompt_2 = ChatPromptTemplate.from_messages([
                                    ("system", "You are an expert educator. Create 10 comprehensive quiz questions with detailed answers based on the PDF content. Format each question with a clear question and a well-explained answer."),
                                    ("user", "{data}")
                                ])
                                llm = ChatGroq(model="llama-3.3-70b-versatile")
                                output_parser = StrOutputParser()
                                chain_2 = prompt_2 | llm | output_parser
                                try:
                                    quiz_text = chain_2.invoke({"data": pages})
                                    st.success("🎉 Quiz generated successfully!")
                                    st.markdown(f'<div class="content-card"><h4>📝 Knowledge Quiz</h4><div style="line-height: 1.8;">{quiz_text}</div></div>', unsafe_allow_html=True)
                                    if db is not None and upload_meta:
                                        db.uploads.update_one({"_id": upload_meta.get("_id")}, {"$push": {"actions": {"type": "quiz", "at": datetime.utcnow()}}})
                                except Exception as e:
                                    st.error(f"❌ Failed to generate quiz: {e}")
                    
                    with col3:
                        if st.button("📇 Generate Flashcards", use_container_width=True):
                            with st.spinner("🔄 Creating study flashcards..."):
                                tfile = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
                                tfile.write(uploaded_file.read())
                                tfile.flush()
                                loader = PyPDFLoader(tfile.name)
                                pages = loader.load_and_split()
                                db = get_db()
                                upload_meta = None
                                if db is not None:
                                    upload_meta = {
                                        "username": st.session_state.user["username"],
                                        "filename": uploaded_file.name,
                                        "uploaded_at": datetime.utcnow(),
                                        "actions": ["uploaded"]
                                    }
                                    db.uploads.insert_one(upload_meta)
                                prompt_3 = ChatPromptTemplate.from_messages([
                                    ("system", "You are a study assistant. Generate 10 high-quality flashcards based on the PDF content. Format each as: 'Question: [clear question] Answer: [detailed answer]'. Separate flashcards with '---'."),
                                    ("user", "{data}")
                                ])
                                llm = ChatGroq(model="llama-3.3-70b-versatile")
                                output_parser = StrOutputParser()
                                chain_3 = prompt_3 | llm | output_parser
                                try:
                                    flashcard_text = chain_3.invoke({"data": pages})
                                    # Parse flashcards
                                    flashcards = []
                                    flashcard_blocks = flashcard_text.split('---')
                                    for block in flashcard_blocks:
                                        if 'Question:' in block and 'Answer:' in block:
                                            question = block.split('Question:')[1].split('Answer:')[0].strip()
                                            answer = block.split('Answer:')[1].strip()
                                            flashcards.append({"question": question, "answer": answer})
                                    
                                    if flashcards:
                                        st.session_state.flashcards = flashcards
                                        st.session_state.current_flashcard = 0
                                        st.session_state.show_flashcard_answer = False
                                        st.success(f"🎉 Generated {len(flashcards)} flashcards!")
                                        st.rerun()
                                    else:
                                        st.error("❌ Could not parse flashcards from the response.")
                                    
                                    if db is not None and upload_meta:
                                        db.uploads.update_one({"_id": upload_meta.get("_id")}, {"$push": {"actions": {"type": "flashcards", "at": datetime.utcnow()}}})
                                except Exception as e:
                                    st.error(f"❌ Failed to generate flashcards: {e}")
                
                else:
                    st.info("📁 Please upload a PDF file to get started with BookBuddy's AI tools.")
                
                st.markdown('</div>', unsafe_allow_html=True)
        
        with tab2:
            with st.container():
                st.markdown('<div class="content-card">', unsafe_allow_html=True)
                st.subheader("💬 AI Study Assistant")
                st.write("Ask questions about your uploaded documents and get instant AI-powered answers.")
                
                db = get_db()
                if db is not None:
                    uploads = list(db.uploads.find({"username": st.session_state.user['username']}))
                    filenames = [u["filename"] for u in uploads]
                else:
                    filenames = []
                
                if filenames:
                    chat_file = st.selectbox("📚 Select a document", options=filenames)
                    question = st.text_input("💭 Your question", placeholder="Ask anything about the document content...")
                    
                    col1, col2 = st.columns([4, 1])
                    with col1:
                        if st.button("🚀 Ask AI Assistant", use_container_width=True):
                            if not question:
                                st.error("❌ Please enter a question")
                            else:
                                with st.spinner("🤔 AI is thinking..."):
                                    prompt_chat = ChatPromptTemplate.from_messages([
                                        ("system", "You are a helpful academic assistant. Use the document content to provide accurate, detailed answers. If the information isn't in the document, clearly state that."),
                                        ("user", "Document: {book}\nQuestion: {question}")
                                    ])
                                    llm = ChatGroq(model="llama-3.3-70b-versatile")
                                    output_parser = StrOutputParser()
                                    chain_chat = prompt_chat | llm | output_parser
                                    try:
                                        chat_answer = chain_chat.invoke({"book": f"Contents of {chat_file}", "question": question})
                                        st.markdown(f"""
                                        <div class="content-card">
                                            <h4>🎯 AI Response</h4>
                                            <div style="background: var(--primary-light); padding: 1.5rem; border-radius: var(--border-radius-sm); border-left: 4px solid var(--primary);">
                                                {chat_answer}
                                            </div>
                                        </div>
                                        """, unsafe_allow_html=True)
                                        if db is not None:
                                            db.chats.insert_one({
                                                "username": st.session_state.user['username'], 
                                                "file": chat_file, 
                                                "question": question, 
                                                "answer": chat_answer, 
                                                "at": datetime.utcnow()
                                            })
                                    except Exception as e:
                                        st.error(f"❌ Chat failed: {e}")
                    
                    with col2:
                        if st.button("🔄 Clear Chat", use_container_width=True):
                            st.session_state.message_history = []
                            st.rerun()
                    
                    # Suggested questions
                    st.markdown("""
                    <div style="margin-top: 2rem;">
                        <h5>💡 Try asking:</h5>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <div style="background: #e3f1fd; color: #185adf; border: none; border-radius: 18px; padding: 6px 15px; font-size: 0.99rem; cursor: pointer; transition: background 0.13s;" 
                                 onclick="const input = this.closest('.content-card').querySelector('input'); if(input) input.value='What are the main key points?'">
                                Key points
                            </div>
                            <div style="background: #e3f1fd; color: #185adf; border: none; border-radius: 18px; padding: 6px 15px; font-size: 0.99rem; cursor: pointer; transition: background 0.13s;" 
                                 onclick="const input = this.closest('.content-card').querySelector('input'); if(input) input.value='Can you explain the central concept?'">
                                Explain concept
                            </div>
                            <div style="background: #e3f1fd; color: #185adf; border: none; border-radius: 18px; padding: 6px 15px; font-size: 0.99rem; cursor: pointer; transition: background 0.13s;" 
                                 onclick="const input = this.closest('.content-card').querySelector('input'); if(input) input.value='What are the important definitions?'">
                                Definitions
                            </div>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    st.info("📚 Upload a PDF first to chat with the AI assistant about your documents.")
                
                st.markdown('</div>', unsafe_allow_html=True)

        with tab3:
            with st.container():
                st.markdown('<div class="content-card">', unsafe_allow_html=True)
                st.subheader("📇 Study Flashcards")

                # 🧠 Safety Checks
                if "flashcards" not in st.session_state:
                    st.session_state.flashcards = []
                if "current_flashcard" not in st.session_state:
                    st.session_state.current_flashcard = 0
                if "show_flashcard_viewer" not in st.session_state:
                    st.session_state.show_flashcard_viewer = False
                if "show_flashcard_answer" not in st.session_state:
                    st.session_state.show_flashcard_answer = False

                # 🗂️ No flashcards yet
                if not st.session_state.flashcards:
                    st.info("""
                    **No flashcards available yet!** 
                    
                    To create flashcards:
                    1. Go to the **PDF Tools** tab
                    2. Upload a PDF document
                    3. Click **"Generate Flashcards"**
                    4. Your AI-powered flashcards will appear here!
                    """)
                else:
                    # Flashcard grid preview
                    st.write(f"### 📚 Your Flashcards ({len(st.session_state.flashcards)} cards)")

                    cols = st.columns(3)
                    for i, card in enumerate(st.session_state.flashcards):
                        with cols[i % 3]:
                            if st.button(f"📄 Card {i+1}", key=f"card_{i}", use_container_width=True):
                                st.session_state.show_flashcard_viewer = True
                                st.session_state.current_flashcard = i
                                st.session_state.show_flashcard_answer = False
                                st.rerun()

                    # 🃏 Flashcard viewer
                    if st.session_state.show_flashcard_viewer:
                        # 🧩 Safety fix to avoid index errors
                        if not st.session_state.flashcards:
                            st.warning("⚠️ No flashcards to display.")
                            st.stop()

                        if st.session_state.current_flashcard >= len(st.session_state.flashcards):
                            st.session_state.current_flashcard = 0

                        current_card = st.session_state.flashcards[st.session_state.current_flashcard]

                        # 💬 Flashcard container
                        st.markdown(f"""
                        <div class="flashcard-container">
                            <h3>🎴 Study Flashcard</h3>
                            <div class="flashcard-view {'flashcard-answer' if st.session_state.show_flashcard_answer else 'flashcard-question'}">
                                <div class="flashcard-content">
                                    <h4>{"✅ Answer" if st.session_state.show_flashcard_answer else "❓ Question"}</h4>
                                    <p>{current_card['answer'] if st.session_state.show_flashcard_answer else current_card['question']}</p>
                                    <small>{"Click 'Show Question' to flip back" if st.session_state.show_flashcard_answer else "Click 'Show Answer' to reveal"}</small>
                                </div>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                        # 🧭 Navigation Buttons
                        nav_col1, nav_col2, nav_col3 = st.columns([1, 2, 1])

                        with nav_col1:
                            if st.button("◀ Previous Card", use_container_width=True):
                                if st.session_state.current_flashcard > 0:
                                    st.session_state.current_flashcard -= 1
                                    st.session_state.show_flashcard_answer = False
                                    st.rerun()

                        with nav_col2:
                            if st.session_state.show_flashcard_answer:
                                if st.button("🔄 Show Question", use_container_width=True):
                                    st.session_state.show_flashcard_answer = False
                                    st.rerun()
                            else:
                                if st.button("👁️ Show Answer", use_container_width=True):
                                    st.session_state.show_flashcard_answer = True
                                    st.rerun()

                        with nav_col3:
                            if st.button("Next Card ▶", use_container_width=True):
                                if st.session_state.current_flashcard < len(st.session_state.flashcards) - 1:
                                    st.session_state.current_flashcard += 1
                                    st.session_state.show_flashcard_answer = False
                                    st.rerun()

                        # 🎛️ Extra Controls
                        ctrl_col1, ctrl_col2, ctrl_col3 = st.columns(3)

                        with ctrl_col1:
                            if st.button("🎯 Mark as Learned", use_container_width=True):
                                st.success("Card marked as learned! 🎉")

                        with ctrl_col2:
                            if st.button("📚 Back to Grid", use_container_width=True):
                                st.session_state.show_flashcard_viewer = False
                                st.rerun()

                        with ctrl_col3:
                            if st.button("🔄 Reset Session", use_container_width=True):
                                st.session_state.current_flashcard = 0
                                st.session_state.show_flashcard_answer = False
                                st.rerun()

                st.markdown('</div>', unsafe_allow_html=True)


            # with st.container():
            #     st.markdown('<div class="content-card">', unsafe_allow_html=True)
            #     st.subheader("📇 Study Flashcards")
                
            #     if not st.session_state.flashcards:
            #         st.info("""
            #         **No flashcards available yet!** 
                    
            #         To create flashcards:
            #         1. Go to the **PDF Tools** tab
            #         2. Upload a PDF document
            #         3. Click **"Generate Flashcards"**
            #         4. Your AI-powered flashcards will appear here!
            #         """)
            #     else:
            #         # Flashcard grid preview
            #         st.write(f"### 📚 Your Flashcards ({len(st.session_state.flashcards)} cards)")
                    
            #         # Display flashcards in a grid
            #         cols = st.columns(3)
            #         for i, card in enumerate(st.session_state.flashcards):
            #             with cols[i % 3]:
            #                 if st.button(f"📄 Card {i+1}", key=f"card_{i}", use_container_width=True):
            #                     st.session_state.show_flashcard_viewer = True
            #                     st.session_state.current_flashcard = i
            #                     st.session_state.show_flashcard_answer = False
            #                     st.rerun()
                    
            #         # Flashcard viewer
            #         if st.session_state.show_flashcard_viewer:
            #             current_card = st.session_state.flashcards[st.session_state.current_flashcard]
                        
            #             st.markdown(f"""
            #             <div class="flashcard-container">
            #                 <h3>🎴 Study Flashcard</h3>
            #                 <div class="flashcard-view {'flashcard-answer' if st.session_state.show_flashcard_answer else 'flashcard-question'}">
            #                     <div class="flashcard-content">
            #                         <h4>{"✅ Answer" if st.session_state.show_flashcard_answer else "❓ Question"}</h4>
            #                         <p>{current_card['answer'] if st.session_state.show_flashcard_answer else current_card['question']}</p>
            #                         <small>{"Click 'Show Question' to flip back" if st.session_state.show_flashcard_answer else "Click 'Show Answer' to reveal"}</small>
            #                     </div>
            #                 </div>
                            
            #                 <div class="flashcard-nav">
            #                     <button class="nav-btn" {"disabled" if st.session_state.current_flashcard == 0 else ""} 
            #                             onclick="window.location.href='?prev=true'">
            #                         ◀ Previous
            #                     </button>
                                
            #                     <div class="flashcard-counter">
            #                         Card {st.session_state.current_flashcard + 1} of {len(st.session_state.flashcards)}
            #                     </div>
                                
            #                     <button class="nav-btn" {"disabled" if st.session_state.current_flashcard == len(st.session_state.flashcards) - 1 else ""} 
            #                             onclick="window.location.href='?next=true'">
            #                         Next ▶
            #                     </button>
            #                 </div>
            #             </div>
            #             """, unsafe_allow_html=True)
                        
            #             # Flashcard controls
            #             col1, col2, col3 = st.columns([1, 2, 1])
                        
            #             with col1:
            #                 if st.button("◀ Previous Card", use_container_width=True):
            #                     if st.session_state.current_flashcard > 0:
            #                         st.session_state.current_flashcard -= 1
            #                         st.session_state.show_flashcard_answer = False
            #                         st.rerun()
                        
            #             with col2:
            #                 if st.session_state.show_flashcard_answer:
            #                     if st.button("🔄 Show Question", use_container_width=True):
            #                         st.session_state.show_flashcard_answer = False
            #                         st.rerun()
            #                 else:
            #                     if st.button("👁️ Show Answer", use_container_width=True):
            #                         st.session_state.show_flashcard_answer = True
            #                         st.rerun()
                        
            #             with col3:
            #                 if st.button("Next Card ▶", use_container_width=True):
            #                     if st.session_state.current_flashcard < len(st.session_state.flashcards) - 1:
            #                         st.session_state.current_flashcard += 1
            #                         st.session_state.show_flashcard_answer = False
            #                         st.rerun()
                        
            #             # Additional controls
            #             col4, col5, col6 = st.columns(3)
            #             with col4:
            #                 if st.button("🎯 Mark as Learned", use_container_width=True):
            #                     st.success("Card marked as learned! 🎉")
            #             with col5:
            #                 if st.button("📚 Back to Grid", use_container_width=True):
            #                     st.session_state.show_flashcard_viewer = False
            #                     st.rerun()
            #             with col6:
            #                 if st.button("🔄 Reset Session", use_container_width=True):
            #                     st.session_state.current_flashcard = 0
            #                     st.session_state.show_flashcard_answer = False
            #                     st.rerun()
                
            #     st.markdown('</div>', unsafe_allow_html=True)
        
        with tab4:
            with st.container():
                st.markdown('<div class="content-card">', unsafe_allow_html=True)
                st.subheader("📊 Learning Dashboard")
                
                db = get_db()
                if db is not None:
                    uploads = list(db.uploads.find({"username": st.session_state.user['username']}))
                    if uploads:
                        # Stats overview
                        st.write("### 📈 Your Learning Statistics")
                        
                        col1, col2, col3, col4 = st.columns(4)
                        
                        with col1:
                            st.metric("Total Documents", len(uploads), "Your library")
                        
                        with col2:
                            summary_count = sum(1 for u in uploads if any('summary' in str(action) for action in u.get('actions', [])))
                            st.metric("Summaries Created", summary_count, "AI generated")
                        
                        with col3:
                            quiz_count = sum(1 for u in uploads if any('quiz' in str(action) for action in u.get('actions', [])))
                            st.metric("Quizzes Taken", quiz_count, "Knowledge tests")
                        
                        with col4:
                            flashcard_count = sum(1 for u in uploads if any('flashcards' in str(action) for action in u.get('actions', [])))
                            st.metric("Flashcard Sets", flashcard_count, "Study tools")
                        
                        # Recent activity
                        st.write("### 📚 Recent Activity")
                        for upload in uploads[-5:][::-1]:  # Show last 5 uploads, most recent first
                            with st.container():
                                st.markdown(f"""
                                <div style="background: var(--primary-light); padding: 1.5rem; border-radius: var(--border-radius-sm); margin: 1rem 0; border-left: 4px solid var(--primary);">
                                    <h5>📄 {upload['filename']}</h5>
                                    <p><strong>Uploaded:</strong> {upload['uploaded_at'].strftime('%B %d, %Y at %H:%M')}</p>
                                    <p><strong>Actions:</strong> {', '.join([str(action) for action in upload.get('actions', [])])}</p>
                                </div>
                                """, unsafe_allow_html=True)
                    else:
                        st.info("""
                        **Your dashboard is empty!** 
                        
                        Start your learning journey:
                        1. Upload your first PDF document
                        2. Generate summaries and quizzes
                        3. Create flashcards for study sessions
                        4. Track your progress here!
                        """)
                else:
                    st.warning("⚠️ Enable MONGO_URI in .env to track your learning progress.")
                
                st.markdown('</div>', unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)

# Footer
st.markdown("""
<div style="text-align: center; padding: 3rem 0; margin-top: 4rem; border-top: 1px solid rgba(42, 157, 143, 0.2);">
    <div style="max-width: 600px; margin: 0 auto;">
        <h3 style="color: var(--secondary); margin-bottom: 1rem;">🎓 BookBuddy</h3>
        <p style="color: var(--gray); line-height: 1.6; margin-bottom: 2rem;">
            Your intelligent study companion powered by AI. Transform your learning experience with smart tools, 
            interactive content, and personalized assistance.
        </p>
        <div style="display: flex; justify-content: center; gap: 2rem; margin-bottom: 2rem;">
            <a href="#" style="color: var(--primary); text-decoration: none; font-weight: 600;">Privacy Policy</a>
            <a href="#" style="color: var(--primary); text-decoration: none; font-weight: 600;">Terms of Service</a>
            <a href="#" style="color: var(--primary); text-decoration: none; font-weight: 600;">Contact Support</a>
        </div>
        <p style="color: var(--gray-dark); font-size: 0.9rem;">
            Made with ❤️ for learners worldwide • © 2024 BookBuddy
        </p>
    </div>
</div>
""", unsafe_allow_html=True)

# Logout button in sidebar
if st.session_state.user:
    with st.sidebar:
        if st.button("🚪 Logout", use_container_width=True):
            st.session_state.user = None
            st.session_state.flashcards = []
            st.session_state.current_flashcard = 0
            st.session_state.show_flashcard_answer = False
            st.session_state.show_flashcard_viewer = False
            st.rerun()
