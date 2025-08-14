#--helpers.py


from flask import jsonify

def normalize_username(u: str) -> str:
    return (u or "").strip().lower()

def error_response(message, status=400):
    return jsonify({"success": False, "error": message}), status
