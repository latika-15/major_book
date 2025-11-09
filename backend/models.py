from datetime import datetime
from bson import ObjectId

# -------------------------------
# User Model
# -------------------------------
def create_user(name, email, password_hash, role="student"):
    return {
        "name": name,
        "email": email,
        "password": password_hash,
        "role": role,
        "createdAt": datetime.utcnow()
    }

# -------------------------------
# Summary Model
# -------------------------------
def create_summary(user_id, source_type, source_name, summary_text, original_text=None):
    return {
        "userId": ObjectId(user_id),
        "sourceType": source_type,  # "pdf" or "text"
        "sourceName": source_name,
        "originalText": original_text or "",
        "summaryText": summary_text,
        "createdAt": datetime.utcnow()
    }
