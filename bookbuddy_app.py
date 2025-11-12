"""
BookBuddy - Streamlit app (fixed PyMongo truth value checks and updated rerun API)
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

if "user" not in st.session_state:
    st.session_state.user = None
if "nav" not in st.session_state:
    st.session_state.nav = "home"
if "message_history" not in st.session_state:
    st.session_state.message_history = []

st.set_page_config(page_title="BookBuddy", layout="wide")

st.markdown(
    """
    <style>
    .top-bar{display:flex;justify-content:space-between;align-items:center;padding:10px 20px;background:linear-gradient(90deg,#7b2ff7,#f107a3);color:white;border-radius:8px}
    .nav-links{display:flex;gap:18px;font-weight:600}
    .logo{font-size:22px}
    .center-box{max-width:720px;margin:auto;padding:20px;border-radius:10px;background:white;box-shadow:0 8px 30px rgba(0,0,0,0.08)}
    .right-btn{background:white;color:#222;padding:8px 14px;border-radius:8px}
    </style>
    """,
    unsafe_allow_html=True,
)

cols = st.columns([1, 2, 1])
with cols[0]:
    st.markdown(f"<div class='logo'><strong>{APP_TITLE}</strong></div>", unsafe_allow_html=True)
with cols[1]:
    st.markdown(
        "<div class='nav-links'>"
        f"<div>Home</div>"
        f"<div>Features</div>"
        f"<div>Dashboard</div>"
        f"<div>About</div>"
        "</div>",
        unsafe_allow_html=True,
    )
with cols[2]:
    if st.session_state.user:
        st.markdown(f"<button class='right-btn'>Welcome, {st.session_state.user['username']}</button>", unsafe_allow_html=True)
        if st.button("Logout"):
            st.session_state.user = None
            st.rerun()
    else:
        if st.button("Login / Register"):
            st.session_state.show_auth = True

if st.session_state.get("show_auth"):
    with st.container():
        st.markdown("<div class='center-box'>", unsafe_allow_html=True)
        auth_col1, auth_col2 = st.columns([1, 1])
        with auth_col1:
            st.subheader("Login")
            with st.form("login_form"):
                login_user = st.text_input("Username", key="login_user")
                login_pass = st.text_input("Password", key="login_pass", type="password")
                login_sub = st.form_submit_button("Login")
                if login_sub:
                    db = get_db()
                    if db is not None:
                        user = db.users.find_one({"username": login_user})
                        if user and check_password(login_pass, user["password"]):
                            st.session_state.user = {"username": user["username"], "_id": user["_id"]}
                            st.session_state.show_auth = False
                            st.success("Logged in")
                            st.rerun()
                        else:
                            st.error("Invalid username or password")
                    else:
                        st.error("Database not configured. Set MONGO_URI in .env")
        with auth_col2:
            st.subheader("Register")
            with st.form("register_form"):
                reg_user = st.text_input("Choose username", key="reg_user")
                reg_email = st.text_input("Email (optional)", key="reg_email")
                reg_pass = st.text_input("Choose password", key="reg_pass", type="password")
                reg_pass2 = st.text_input("Repeat password", key="reg_pass2", type="password")
                reg_sub = st.form_submit_button("Create account")
                if reg_sub:
                    if reg_pass != reg_pass2:
                        st.error("Passwords do not match")
                    else:
                        db = get_db()
                        if db is not None:
                            exists = db.users.find_one({"username": reg_user})
                            if exists:
                                st.error("Username taken")
                            else:
                                hashed = hash_password(reg_pass)
                                db.users.insert_one({"username": reg_user, "email": reg_email, "password": hashed, "created_at": datetime.utcnow()})
                                st.success("Account created. Please login.")
                        else:
                            st.error("Database not configured. Set MONGO_URI in .env")
        st.markdown("</div>", unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

if not st.session_state.user:
    st.markdown("<div class='center-box'>", unsafe_allow_html=True)
    st.title("Welcome to BookBuddy")
    st.write("BookBuddy helps students and readers quickly get summaries, quizzes, and chat with books.")
    st.write("**Features:**")
    st.write("- PDF summary generation using an LLM.")
    st.write("- Auto-generated quizzes (10 questions + answers).")
    st.write("- Dashboard to track your uploads & actions.")
    st.write("- Chat with your uploaded book for Q&A and study help.")
    st.markdown("</div>", unsafe_allow_html=True)
else:
    st.markdown("<div class='center-box'>", unsafe_allow_html=True)
    st.header(f"Welcome back, {st.session_state.user['username']}!")
    st.write("Use the tools below to upload PDFs, generate summaries/quizzes, and chat with your book.")

    with st.expander("Upload a PDF / Generate summary or quiz"):
        uploaded_file = st.file_uploader("Choose a PDF file", type=["pdf"], key="pdf_uploader")
        col1, col2 = st.columns(2)
        with col1:
            if st.button("Generate Summary"):
                if not uploaded_file:
                    st.error("Please upload a PDF first.")
                else:
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
                        ("system", "You are a helpful assistant. Provide a concise summary of the user's PDF. Be polite."),
                        ("user", "{data}")
                    ])
                    llm = ChatGroq(model="llama-3.3-70b-versatile")
                    output_parser = StrOutputParser()
                    chain_1 = prompt_1 | llm | output_parser
                    try:
                        summary_text = chain_1.invoke({"data": pages})
                        st.success("Summary generated")
                        st.write(summary_text)
                        if db is not None and upload_meta:
                            db.uploads.update_one({"_id": upload_meta.get("_id")}, {"$push": {"actions": {"type": "summary", "at": datetime.utcnow()}}})
                    except Exception as e:
                        st.error(f"Failed to generate summary: {e}")
        with col2:
            if st.button("Generate Quiz"):
                if not uploaded_file:
                    st.error("Please upload a PDF first.")
                else:
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
                        ("system", "You are a helpful assistant. Provide 10 quiz questions with answers based on the user's PDF. Be polite."),
                        ("user", "{data}")
                    ])
                    llm = ChatGroq(model="llama-3.3-70b-versatile")
                    output_parser = StrOutputParser()
                    chain_2 = prompt_2 | llm | output_parser
                    try:
                        quiz_text = chain_2.invoke({"data": pages})
                        st.success("Quiz generated")
                        st.write(quiz_text)
                        if db is not None and upload_meta:
                            db.uploads.update_one({"_id": upload_meta.get("_id")}, {"$push": {"actions": {"type": "quiz", "at": datetime.utcnow()}}})
                    except Exception as e:
                        st.error(f"Failed to generate quiz: {e}")

    with st.expander("Chat with your book (Q&A)"):
        st.write("Ask questions about an uploaded PDF.")
        db = get_db()
        if db is not None:
            uploads = list(db.uploads.find({"username": st.session_state.user['username']}))
            filenames = [u["filename"] for u in uploads]
        else:
            filenames = []
        chat_file = st.selectbox("Select a file to chat about", options=filenames)
        question = st.text_input("Your question")
        if st.button("Ask"):
            if not chat_file:
                st.error("Select a file first")
            elif not question:
                st.error("Type a question")
            else:
                prompt_chat = ChatPromptTemplate.from_messages([
                    ("system", "You are a helpful assistant. Use the user's book to answer. If you don't know, say so."),
                    ("user", "Book: {book}\nQuestion: {question}")
                ])
                llm = ChatGroq(model="llama-3.3-70b-versatile")
                output_parser = StrOutputParser()
                chain_chat = prompt_chat | llm | output_parser
                try:
                    chat_answer = chain_chat.invoke({"book": f"Contents of {chat_file} (user uploaded)", "question": question})
                    st.write(chat_answer)
                    if db is not None:
                        db.chats.insert_one({"username": st.session_state.user['username'], "file": chat_file, "question": question, "answer": chat_answer, "at": datetime.utcnow()})
                except Exception as e:
                    st.error(f"Chat failed: {e}")

    st.markdown("</div>", unsafe_allow_html=True)
    st.markdown("<br>", unsafe_allow_html=True)
    st.subheader("Dashboard")
    db = get_db()
    if db is not None:
        uploads = list(db.uploads.find({"username": st.session_state.user['username']}))
        if uploads:
           import pandas as pd
           df = pd.DataFrame(list(db.uploads.find({"username": st.session_state.user["username"]})))
           # Convert lists/dicts to readable strings for display
           def stringify_actions(val):
               if isinstance(val, list):
                   return ", ".join([str(v) for v in val])  # safely convert each element
               elif isinstance(val, dict):
                   return str(val)
               else:
                   return str(val)
               df["actions"] = df["actions"].apply(stringify_actions)
                # st.dataframe(df)

        else:
            st.info("No uploads yet. Upload a PDF to get started.")
    else:
        st.warning("Enable MONGO_URI in .env to use dashboard features.")

st.markdown("<hr>", unsafe_allow_html=True)
st.markdown("Made with ❤️ BookBuddy — upload, summarize, quiz, and learn faster.")

