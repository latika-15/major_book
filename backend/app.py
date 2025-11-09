import os
import bcrypt
import logging
from datetime import datetime
from urllib.parse import quote_plus
from dotenv import load_dotenv
from flask import Flask, request, jsonify, g
from flask_pymongo import PyMongo
from flask_cors import CORS

# Internal imports
from auth import (
    generate_token,
    decode_token,
    require_auth,
    generate_refresh_token,
    verify_refresh_token,
)
from summarize import summarize_bp
from models import create_user

# ========================
# ENV + LOGGING
# ========================
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("bookbuddy")

# ========================
# FLASK SETUP
# ========================
app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "supersecretkey123")
app.config["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY", "")

# ========================
# MONGO CONNECTION
# ========================
def get_mongo_uri():
    """Safely build MongoDB URI"""
    try:
        username = quote_plus(os.getenv("MONGO_USERNAME", ""))
        password = quote_plus(os.getenv("MONGO_PASSWORD", ""))
        host = os.getenv("MONGO_HOST", "localhost")
        port = os.getenv("MONGO_PORT", "27017")
        db_name = os.getenv("MONGO_DB_NAME", "bookbuddy")

        if username and password:
            if "mongodb.net" in host:
                return f"mongodb+srv://{username}:{password}@{host}/{db_name}?retryWrites=true&w=majority"
            else:
                return f"mongodb://{username}:{password}@{host}:{port}/{db_name}?authSource=admin"
        else:
            return f"mongodb://{host}:{port}/{db_name}"
    except Exception as e:
        logger.exception("Error building MongoDB URI")
        return "mongodb://localhost:27017/bookbuddy"


app.config["MONGO_URI"] = get_mongo_uri()

# Initialize Mongo AFTER URI is set
try:
    mongo = PyMongo(app)
    db = mongo.db
    app.config["DB"] = db
    logger.info("✅ MongoDB connected successfully!")
except Exception as e:
    logger.exception("❌ MongoDB connection failed")
    db = None


# ========================
# BLUEPRINTS
# ========================
app.register_blueprint(summarize_bp, url_prefix="/api/summarize")

# ========================
# HEALTH CHECK
# ========================
@app.route("/api/health", methods=["GET"])
def health_check():
    mongo_status = "connected" if db is not None else "disconnected"
    return jsonify({
        "status": "healthy",
        "mongo": mongo_status,
        "message": "Server is running",
        "time": datetime.utcnow().isoformat()
    }), 200


# ========================
# AUTH ROUTES
# ========================
@app.route("/api/auth/register", methods=["POST"])
def register():
    try:
        data = request.get_json() or {}
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "student")

        if not all([name, email, password]):
            return jsonify({"success": False, "message": "All fields required"}), 400

        # Check existing user
        if db.users.find_one({"email": email}):
            return jsonify({"success": False, "message": "Email already registered"}), 400

        hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        user = create_user(name, email, hashed_pw, role)
        result = db.users.insert_one(user)

        token = generate_token(user, app.config["SECRET_KEY"])
        refresh_token = generate_refresh_token(user, app.config["SECRET_KEY"])
        db.users.update_one({"_id": result.inserted_id}, {"$set": {"refresh_token": refresh_token}})

        return jsonify({
            "success": True,
            "message": "User registered successfully",
            "token": token,
            "refreshToken": refresh_token,
            "user": {"name": name, "email": email, "role": role}
        }), 201

    except Exception as e:
        logger.exception("Register Error")
        return jsonify({"success": False, "message": "Server error"}), 500


@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json() or {}
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"success": False, "message": "Missing credentials"}), 400

        user = db.users.find_one({"email": email})
        if not user:
            return jsonify({"success": False, "message": "Invalid email or password"}), 401

        if not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
            return jsonify({"success": False, "message": "Invalid email or password"}), 401

        token = generate_token(user, app.config["SECRET_KEY"])
        refresh_token = generate_refresh_token(user, app.config["SECRET_KEY"])
        db.users.update_one({"email": email}, {"$set": {"refresh_token": refresh_token}})

        return jsonify({
            "success": True,
            "token": token,
            "refreshToken": refresh_token,
            "user": {"name": user["name"], "email": user["email"], "role": user.get("role", "student")}
        }), 200

    except Exception as e:
        logger.exception("Login Error")
        return jsonify({"success": False, "message": "Server error"}), 500


@app.route("/api/auth/validate", methods=["GET"])
def validate():
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"success": False, "message": "Missing token"}), 401

        token = auth_header.split(" ")[1]
        decoded = decode_token(token, app.config["SECRET_KEY"])
        if not decoded:
            return jsonify({"success": False, "message": "Invalid or expired token"}), 401

        user = db.users.find_one({"email": decoded["email"]})
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404

        return jsonify({
            "success": True,
            "user": {"name": user["name"], "email": user["email"], "role": user["role"]}
        }), 200

    except Exception as e:
        logger.exception("Validation Error")
        return jsonify({"success": False, "message": "Server error"}), 500


@app.route("/api/auth/refresh", methods=["POST"])
def refresh_token_route():
    try:
        data = request.get_json() or {}
        refresh = data.get("refreshToken")

        if not refresh:
            return jsonify({"success": False, "message": "Missing refresh token"}), 400

        payload = verify_refresh_token(refresh, app.config["SECRET_KEY"])
        if not payload:
            return jsonify({"success": False, "message": "Invalid or expired refresh token"}), 401

        user = db.users.find_one({"email": payload.get("email")})
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404

        if user.get("refresh_token") != refresh:
            return jsonify({"success": False, "message": "Refresh token mismatch"}), 401

        new_access = generate_token(user, app.config["SECRET_KEY"])
        return jsonify({"success": True, "token": new_access}), 200

    except Exception as e:
        logger.exception("Refresh Error")
        return jsonify({"success": False, "message": "Server error"}), 500


# ========================
# USER PROFILE (protected)
# ========================
@app.route("/api/user/profile", methods=["GET"])
@require_auth
def user_profile():
    user_email = g.user.get("email")
    user = db.users.find_one({"email": user_email}, {"password": 0, "refresh_token": 0})
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    user["_id"] = str(user["_id"])
    return jsonify({
        "success": True,
        "user": {"name": user["name"], "email": user["email"], "role": user.get("role", "student")}
    }), 200


# ========================
# RUN SERVER
# ========================
if __name__ == "__main__":
    debug_mode = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    port = int(os.getenv("PORT", 5000))
    logger.info(f"🚀 Starting BookBuddy Backend on port {port}")
    app.run(debug=debug_mode, port=port)
