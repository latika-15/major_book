from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
import bcrypt

# Import helpers
from modules.auth import generate_token, decode_token
from app import db  # ✅ only if app.py defines `db = mongo.db` before registering blueprints

auth_bp = Blueprint("auth", __name__)

# ---------------------------
# REGISTER
# ---------------------------
@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "student")

        if not all([name, email, password]):
            return jsonify({"success": False, "message": "All fields are required"}), 400

        existing_user = db.users.find_one({"email": email})
        if existing_user:
            return jsonify({"success": False, "message": "Email already registered"}), 400

        hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

        user = {
            "name": name,
            "email": email,
            "password": hashed_pw.decode("utf-8"),
            "role": role,
            "created_at": datetime.utcnow()
        }

        result = db.users.insert_one(user)
        user["_id"] = str(result.inserted_id)

        token = generate_token(user, current_app.config["SECRET_KEY"])

        return jsonify({
            "success": True,
            "message": "User registered successfully",
            "token": token,
            "user": {
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            }
        }), 201

    except Exception as e:
        print("❌ Register Error:", e)
        return jsonify({"success": False, "message": "Server error"}), 500


# ---------------------------
# LOGIN
# ---------------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not all([email, password]):
            return jsonify({"success": False, "message": "Email and password are required"}), 400

        user = db.users.find_one({"email": email})
        if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
            return jsonify({"success": False, "message": "Invalid email or password"}), 401

        token = generate_token(user, current_app.config["SECRET_KEY"])

        return jsonify({
            "success": True,
            "message": "Login successful",
            "token": token,
            "user": {
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            }
        }), 200

    except Exception as e:
        print("❌ Login Error:", e)
        return jsonify({"success": False, "message": "Server error"}), 500


# ---------------------------
# VALIDATE TOKEN
# ---------------------------
@auth_bp.route("/validate", methods=["GET"])
def validate_token():
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"success": False, "message": "Token missing"}), 401

        token = auth_header.split(" ")[1]
        decoded = decode_token(token, current_app.config["SECRET_KEY"])
        if not decoded:
            return jsonify({"success": False, "message": "Invalid or expired token"}), 401

        user = db.users.find_one({"email": decoded["email"]})
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404

        return jsonify({
            "success": True,
            "user": {
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            }
        }), 200

    except Exception as e:
        print("❌ Validation Error:", e)
        return jsonify({"success": False, "message": "Server error"}), 500
