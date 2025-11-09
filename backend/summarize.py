import os
import logging
from flask import Blueprint, request, jsonify, current_app, g
from werkzeug.utils import secure_filename
from datetime import datetime
from bson import ObjectId

from auth import require_auth
from models import create_summary

import fitz  # PyMuPDF for PDF text extraction

# Try importing OpenAI
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

logger = logging.getLogger("summarize")
summarize_bp = Blueprint("summarize", __name__)


# --------------------------
# Helper Functions
# --------------------------

def naive_summarize(text, max_chars=800):
    """Fallback summarizer if OpenAI fails."""
    short = text.strip()
    if len(short) <= max_chars:
        return short
    return short[:max_chars].rsplit(" ", 1)[0] + " ..."


def call_openai_summary(text):
    """Generate summary using OpenAI if available."""
    openai_key = current_app.config.get("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not openai_key or not OPENAI_AVAILABLE:
        logger.warning("OpenAI key or SDK not available, using fallback summary.")
        return None

    try:
        client = OpenAI(api_key=openai_key)
        prompt = f"Summarize the following content clearly and concisely:\n\n{text[:15000]}"
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful summarizer."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=800,
            temperature=0.7,
        )
        return response.choices[0].message.content if response and response.choices else None
    except Exception as e:
        logger.exception("OpenAI API call failed")
        return None


# --------------------------
# Summarize TEXT
# --------------------------

@summarize_bp.route("/text", methods=["POST"])
@require_auth
def summarize_text():
    """Summarize plain text input."""
    try:
        data = request.get_json()
        text = data.get("text", "")

        if not text.strip():
            return jsonify({"success": False, "message": "No text provided"}), 400

        summary = call_openai_summary(text) or naive_summarize(text)

        # Save to MongoDB
        db = current_app.config["DB"]
        user_email = g.user["email"]
        user = db.users.find_one({"email": user_email})
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404

        summary_doc = create_summary(
            user_id=user["_id"],
            source_type="text",
            source_name="Custom Text Input",
            summary_text=summary,
            original_text=text
        )

        db.summaries.insert_one(summary_doc)

        return jsonify({
            "success": True,
            "summary": summary,
            "saved_id": str(summary_doc["_id"])
        }), 200

    except Exception as e:
        logger.exception("summarize_text error")
        return jsonify({"success": False, "message": "Server error"}), 500


# --------------------------
# Summarize PDF
# --------------------------

@summarize_bp.route("/pdf", methods=["POST"])
@require_auth
def summarize_pdf():
    """Summarize uploaded PDF file."""
    try:
        if "file" not in request.files:
            return jsonify({"success": False, "message": "No file provided"}), 400

        file = request.files["file"]
        if not file.filename.lower().endswith(".pdf"):
            return jsonify({"success": False, "message": "Only PDF files are allowed"}), 400

        filename = secure_filename(file.filename)
        doc = fitz.open(stream=file.read(), filetype="pdf")

        text = "".join(page.get_text() for page in doc)
        doc.close()

        if not text.strip():
            return jsonify({"success": False, "message": "No readable text in PDF"}), 400

        summary = call_openai_summary(text) or naive_summarize(text, max_chars=1500)

        db = current_app.config["DB"]
        user_email = g.user["email"]
        user = db.users.find_one({"email": user_email})
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404

        summary_doc = create_summary(
            user_id=user["_id"],
            source_type="pdf",
            source_name=filename,
            summary_text=summary,
            original_text=text[:1000]  # Store preview
        )

        db.summaries.insert_one(summary_doc)

        return jsonify({
            "success": True,
            "summary": summary,
            "fileName": filename,
            "saved_id": str(summary_doc["_id"])
        }), 200

    except Exception as e:
        logger.exception("summarize_pdf error")
        return jsonify({"success": False, "message": "Server error"}), 500
