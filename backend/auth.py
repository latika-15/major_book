# auth.py
import os
import jwt
import bcrypt
import logging
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app, g

logger = logging.getLogger("auth")

# =========================
# Token utilities
# =========================
def generate_token(user_obj, secret_key, minutes=15):
    """
    Generate short-lived access token (default 15 minutes).
    `user_obj` should include at least '_id' and 'email' keys.
    """
    try:
        payload = {
            "user_id": str(user_obj.get("_id") or user_obj.get("user_id")),
            "email": user_obj.get("email"),
            "role": user_obj.get("role", "student"),
            "exp": datetime.utcnow() + timedelta(minutes=minutes),
            "iat": datetime.utcnow()
        }
        token = jwt.encode(payload, secret_key, algorithm="HS256")
        if isinstance(token, bytes):
            token = token.decode("utf-8")
        return token
    except Exception as e:
        logger.exception("Error generating access token")
        return None


def generate_refresh_token(user_obj, secret_key, days=7):
    """
    Generate refresh token (longer expiry). Also return expiry for storing.
    """
    try:
        payload = {
            "user_id": str(user_obj.get("_id") or user_obj.get("user_id")),
            "email": user_obj.get("email"),
            "role": user_obj.get("role", "student"),
            "exp": datetime.utcnow() + timedelta(days=days),
            "iat": datetime.utcnow()
        }
        token = jwt.encode(payload, secret_key, algorithm="HS256")
        if isinstance(token, bytes):
            token = token.decode("utf-8")
        return token
    except Exception as e:
        logger.exception("Error generating refresh token")
        return None


def decode_token(token, secret_key):
    try:
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        return None
    except jwt.InvalidTokenError:
        logger.warning("Invalid token")
        return None


# =========================
# Decorators
# =========================
def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            logger.warning("Missing Authorization header")
            return jsonify({"success": False, "message": "Authorization header missing"}), 401

        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
            g.user = {
                "user_id": payload.get("user_id"),
                "email": payload.get("email"),
                "role": payload.get("role")
            }
            logger.info(f"Authenticated user: {g.user.get('email')}")
        except jwt.ExpiredSignatureError:
            logger.warning("Access token expired")
            return jsonify({"success": False, "message": "Access token expired"}), 401
        except jwt.InvalidTokenError:
            logger.warning("Invalid access token")
            return jsonify({"success": False, "message": "Invalid access token"}), 401

        return f(*args, **kwargs)
    return decorated_function


def require_role(role):
    """
    Use as `@require_auth` then `@require_role('teacher')` to restrict further.
    """
    def wrapper(f):
        @wraps(f)
        def inner(*args, **kwargs):
            if not getattr(g, "user", None):
                return jsonify({"success": False, "message": "Unauthorized"}), 401
            user_role = g.user.get("role")
            if user_role != role:
                logger.warning(f"Role '{user_role}' is not allowed, required: {role}")
                return jsonify({"success": False, "message": "Forbidden (insufficient role)"}), 403
            return f(*args, **kwargs)
        return inner
    return wrapper


# =========================
# Refresh token verification
# =========================
def verify_refresh_token(token, secret_key):
    try:
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Refresh token expired")
        return None
    except jwt.InvalidTokenError:
        logger.warning("Invalid refresh token")
        return None


# =========================
# Auth endpoints helpers (used in app.py)
# =========================
# We keep core helper functions here; the actual Flask routes are in app.py originally.
# But we provide helper functions to be used if required externally.
