# controllers.py
from flask import Blueprint, request, jsonify
from passlib.hash import bcrypt
from datetime import datetime
from models import User, LoginLog, Feedback, db
from helpers import normalize_username, error_response
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import and_, func




# NEW imports for emotion model
import os
import pandas as pd
import joblib
from functools import lru_cache
from sklearn.exceptions import NotFittedError
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# controllers.py
from flask import Blueprint, request, jsonify
from passlib.hash import bcrypt
from datetime import datetime
from models import User, LoginLog, Feedback, db
from helpers import normalize_username, error_response
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import and_, func




# NEW imports for emotion model
import os
import pandas as pd
import joblib
from functools import lru_cache
from sklearn.exceptions import NotFittedError
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

api_bp = Blueprint("api", __name__, url_prefix="/api")

# === Paths / Config ===
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_MODEL_PATH = os.getenv("EMOTION_MODEL_PATH", os.path.join(_BASE_DIR, "models_artifacts", "emotion_model.pkl"))
_EMOTION_CSV = os.getenv("EMOTION_CSV_PATH", os.path.join(_BASE_DIR, "data", "EmotionDetection.csv"))

# === Global state ===
_emotion_model = None
_model_clf = None
_model_has_proba = False

# fallback lookup state
_vectorizer = None
_tfidf_matrix = None
_ref_texts = None
_ref_emotions = None

# -------------------------------
# Fallback CSV loader
# -------------------------------
def _ensure_lookup_loaded():
    """Load small fallback CSV and fit TF-IDF vectorizer."""
    global _vectorizer, _tfidf_matrix, _ref_texts, _ref_emotions
    if _ref_texts is not None:  # already loaded
        return

    if not os.path.exists(_EMOTION_CSV):
        print(f"[INFO] No fallback CSV found at: {_EMOTION_CSV} — using dummy fallback.")
        _ref_texts, _ref_emotions = ["neutral"], ["neutral"]
        _vectorizer = TfidfVectorizer(lowercase=True, stop_words="english", ngram_range=(1, 2))
        _tfidf_matrix = _vectorizer.fit_transform(_ref_texts)
        return

    df = pd.read_csv(_EMOTION_CSV)
    if "emotion" not in df.columns and "Emotion" in df.columns:
        df = df.rename(columns={"Emotion": "emotion"})
    if "text" not in df.columns or "emotion" not in df.columns:
        print("[WARN] Fallback CSV must have 'text' and 'emotion' columns.")
        _ref_texts, _ref_emotions = ["neutral"], ["neutral"]
        _vectorizer = TfidfVectorizer(lowercase=True, stop_words="english", ngram_range=(1, 2))
        _tfidf_matrix = _vectorizer.fit_transform(_ref_texts)
        return

    df = df.dropna(subset=["text", "emotion"]).reset_index(drop=True)
    _ref_texts = df["text"].astype(str).tolist()
    _ref_emotions = df["emotion"].astype(str).tolist()

    _vectorizer = TfidfVectorizer(lowercase=True, stop_words="english", ngram_range=(1, 2))
    _tfidf_matrix = _vectorizer.fit_transform(_ref_texts)
    print(f"[INFO] Fallback lookup index loaded with {_tfidf_matrix.shape[0]} rows.")

# -------------------------------
# Model loading
# -------------------------------
def _load_emotion_model():
    """Load the trained sklearn Pipeline from disk, fallback to CSV."""
    global _emotion_model, _model_clf, _model_has_proba

    # Always load fallback lookup first
    _ensure_lookup_loaded()

    if not os.path.exists(_MODEL_PATH):
        print(f"[WARN] Emotion model not found at: {_MODEL_PATH}")
        return

    try:
        _emotion_model = joblib.load(_MODEL_PATH)

        if hasattr(_emotion_model, "named_steps"):
            _model_clf = _emotion_model.named_steps.get("clf", None)
        else:
            _model_clf = None

        _model_has_proba = hasattr(_emotion_model, "predict_proba") or (
            _model_clf is not None and hasattr(_model_clf, "predict_proba")
        )

        print(f"[INFO] Emotion model loaded from: {_MODEL_PATH}")
    except Exception as e:
        print(f"[ERROR] Failed to load emotion model: {e}")
        _emotion_model = None

# Load model and fallback at import
_load_emotion_model()

# -------------------------------
# Prediction helpers
# -------------------------------
@lru_cache(maxsize=4096)
def _predict_emotion_ml_cached(text: str, neutral_threshold: float = 0.50):
    """Predict via trained model with caching."""
    if not _emotion_model or not text.strip():
        return _predict_emotion_lookup(text)

    try:
        if _model_has_proba:
            try:
                proba = _emotion_model.predict_proba([text])[0]
            except AttributeError:
                proba = _model_clf.predict_proba([text])[0]

            classes = None
            if _model_clf is not None and hasattr(_model_clf, "classes_"):
                classes = _model_clf.classes_

            best_idx = int(proba.argmax())
            best_score = float(proba[best_idx])
            label = classes[best_idx] if classes is not None else _emotion_model.predict([text])[0]

            if best_score < neutral_threshold:
                return "neutral", best_score
            return label, best_score
        else:
            label = _emotion_model.predict([text])[0]
            return label, 1.0

    except NotFittedError:
        print("[ERROR] Model/vectorizer not fitted. Falling back to lookup.")
        return _predict_emotion_lookup(text)
    except Exception as e:
        print(f"[ERROR] Model prediction failed: {e}")
        return _predict_emotion_lookup(text)

def _predict_emotion_lookup(text: str, min_score: float = 0.12):
    """Fallback prediction via cosine similarity to a small CSV."""
    _ensure_lookup_loaded()
    if not text.strip() or not _ref_texts:
        return "neutral", 0.0

    vec = _vectorizer.transform([text])
    scores = cosine_similarity(vec, _tfidf_matrix).ravel()
    best_i = int(scores.argmax())
    best_score = float(scores[best_i])
    if best_score < min_score:
        return "neutral", best_score
    return _ref_emotions[best_i], best_score

def predict_emotion(text: str):
    """Public API: prefer ML model, fallback to lookup."""
    if _emotion_model:
        return _predict_emotion_ml_cached(text)
    return _predict_emotion_lookup(text)

# --- Health ---
@api_bp.get("/health")
def health():
    return jsonify({"ok": True, "time": datetime.utcnow().isoformat() + "Z"})


# --- Add Feedback ---
@api_bp.post("/feedback")
def add_feedback():
    data = request.get_json(silent=True) or {}

    required_fields = [
        "userId",
        "usageFrequency", "primaryPurpose", "ratings",
        "overallRating", "feedbackText"
    ]
    missing = [k for k in required_fields if k not in data]
    if missing:
        return jsonify({"error": f"Missing field(s): {', '.join(missing)}"}), 400

    ratings = data["ratings"]
    feedback_text = data["feedbackText"]

    # Predict emotion
    emotion, score = predict_emotion(feedback_text)

    new_feedback = Feedback(
        user_id=data["userId"],
        usage_frequency=data.get("usageFrequency"),
        primary_purpose=data.get("primaryPurpose"),
        ease_of_use=ratings.get("easeOfUse"),
        speed_performance=ratings.get("speedPerformance"),
        feature_quality=ratings.get("featureQuality"),
        customer_support=ratings.get("customerSupport"),
        overall_rating=float(data.get("overallRating", 0)),
        feedback_text=feedback_text,
        emotion=emotion,
    )

    db.session.add(new_feedback)
    db.session.commit()

    return jsonify({
        "message": "Feedback saved successfully",
        "predictedEmotion": emotion,
        "similarityScore": score
    }), 201





# --- Signup ---------
@api_bp.post("/signup")
def signup():
    data = request.get_json(silent=True) or {}
    required = ["Name", "Mobile", "Email", "Username", "Password"]
    missing = [k for k in required if not str(data.get(k, "")).strip()]
    if missing:
        return error_response(f"Missing fields: {', '.join(missing)}")

    name, mobile, email = data["Name"].strip(), data["Mobile"].strip(), data["Email"].strip()
    username, password = normalize_username(data["Username"]), data["Password"]

    if len(password) < 6:
        return error_response("Password must be at least 6 characters.")

    if User.query.filter_by(Username=username).first():
        return error_response("Username already exists.", 409)
    if User.query.filter_by(Email=email).first():
        return error_response("Email already exists.", 409)

    pwd_hash = bcrypt.hash(password)
    user = User(Name=name, Mobile=mobile, Email=email, Username=username, PasswordHash=pwd_hash)
    db.session.add(user)
    db.session.commit()

    return jsonify({"success": True, "UserId": user.UserId, "Name": user.Name})

# --- Login ---
@api_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    username, password = normalize_username(data.get("Username", "")), data.get("Password", "")

    if not username or not password:
        return error_response("Username and Password are required.")

    user = User.query.filter_by(Username=username).first()
    if not user or not bcrypt.verify(password, user.PasswordHash):
        return error_response("Invalid username or password.", 401)

    return jsonify({"success": True, "UserId": user.UserId, "Name": user.Name})

# --- Insert Login Log ---
@api_bp.post("/insertLoginLog")
def insert_login_log():
    data = request.get_json(silent=True) or {}
    if not data.get("LoginUserName"):
        return error_response("LoginUserName is required.")

    geo = data.get("GeoLocation") or {}
    try:
        lat = float(geo.get("latitude")) if geo.get("latitude") else None
        lon = float(geo.get("longitude")) if geo.get("longitude") else None
    except (TypeError, ValueError):
        lat, lon = None, None

    log = LoginLog(
        EmployeeCode=data.get("EmployeeCode"),
        EmployeeName=data.get("EmployeeName"),
        LoginUserName=data["LoginUserName"],
        IPAddress=data.get("IPAddress"),
        LoginStatus=bool(data.get("LoginStatus", False)),
        UserAgent=data.get("UserAgent"),
        LoginMethod=data.get("LoginMethod"),
        SessionID=data.get("SessionID"),
        GeoLatitude=lat,
        GeoLongitude=lon,
        GeoPlace=data.get("GeoPlace"),
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"success": True, "LogId": log.LogId})

# --- Get User By ID ---
@api_bp.get("/getUserbyid")
def get_user_by_id():
    try:
        user_id = request.args.get("UserId", type=int)
        if not user_id:
            return jsonify({"error": "UserId is required"}), 400

        user = User.query.filter_by(UserId=user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        user_data = {
            "UserId": user.UserId,
            "Name": user.Name,
            "Mobile": user.Mobile,
            "Email": user.Email,
            "Username": user.Username,
        }
        return jsonify([user_data])
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@api_bp.post("/resetpassword")
def reset_password():
    try:
        data = request.get_json() or {}
        UserId = data.get("UserId")
        current_password = data.get("CurrentPassword")
        new_password = data.get("NewPassword")

        if not UserId or not current_password or not new_password:
            return jsonify({"success": False, "Message": "All fields are required"}), 400

        # Find user
        user = User.query.filter_by(UserId=UserId).first()
        if not user:
            return jsonify({"success": False, "Message": "User not found"}), 404

        # Verify current password
        if not bcrypt.verify(current_password, user.PasswordHash):
            return jsonify({"success": False, "Message": "Current password is incorrect"}), 400

        # Hash new password and update
        user.PasswordHash = bcrypt.hash(new_password)
        db.session.commit()

        return jsonify({"success": True, "Message": "Password updated successfully"})

    except Exception as e:
        return jsonify({"success": False, "Message": str(e)}), 500
    
@api_bp.get("/feedback/report")
def feedback_report():
    try:
        user_id = request.args.get("user_id", type=int)
        from_date = request.args.get("from_date")
        to_date = request.args.get("to_date")

        if not user_id:
            return jsonify({"success": False, "message": "User ID required"}), 400

        query = Feedback.query.filter(Feedback.user_id == user_id)

        if from_date:
            query = query.filter(Feedback.created_at >= from_date)
        if to_date:
            query = query.filter(Feedback.created_at <= to_date)

        feedbacks = [f.to_public_json() for f in query.order_by(Feedback.created_at.desc()).all()]
        return jsonify({"success": True, "data": feedbacks}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    

@api_bp.get("/customers")
def get_users():
    try:
        fromdate_str = request.args.get("fromdate")
        todate_str = request.args.get("todate")

        query = User.query

        # Handle fromdate
        if fromdate_str:
            try:
                fromdate = datetime.strptime(fromdate_str, "%Y-%m-%d")
                query = query.filter(User.created_at >= fromdate)
            except ValueError:
                return jsonify({"error": "Invalid fromdate format. Use YYYY-MM-DD"}), 400

        # Handle todate
        if todate_str:
            try:
                todate = datetime.strptime(todate_str, "%Y-%m-%d").replace(
                    hour=23, minute=59, second=59
                )
                query = query.filter(User.created_at <= todate)
            except ValueError:
                return jsonify({"error": "Invalid todate format. Use YYYY-MM-DD"}), 400

        users = query.order_by(User.created_at.desc()).all()
        return jsonify([user.to_public_json() for user in users]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@api_bp.get("/feedback/allfeedback")
def all_feedback_report():
    try:
        from_date = request.args.get("from_date")
        to_date = request.args.get("to_date")

        # Base query with LEFT JOIN
        query = (
            db.session.query(
                Feedback,
                User.Name.label("name"),
                User.Email.label("email"),
                User.Mobile.label("mobile")
            )
            .join(User, Feedback.user_id == User.UserId, isouter=True)
        )

        # Apply date filters if provided
        if from_date:
            query = query.filter(Feedback.created_at >= from_date)
        if to_date:
            query = query.filter(Feedback.created_at <= to_date)

        # Fetch results
        results = query.order_by(Feedback.created_at.desc()).all()

        # Format output
        feedbacks = []
        for fb, name, email, mobile in results:
            fb_data = fb.to_public_json()
            fb_data.update({
                "name": name,
                "email": email,
                "mobile": mobile
            })
            feedbacks.append(fb_data)

        return jsonify({"success": True, "data": feedbacks}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    

@api_bp.get("/login_logs")
def get_login_logs():
    logs = LoginLog.query.order_by(LoginLog.LogId.desc()).all()
    return jsonify([log.to_public_json() for log in logs]), 200


@api_bp.get("/feedback/ratings-summary")
def ratings_summary():
    feedbacks = Feedback.query.with_entities(Feedback.overall_rating).all()
    ratings = [float(r[0]) for r in feedbacks if r[0] is not None]

    def category(s):
        if s <= 1.9:
            return "😡"
        elif s <= 2.9:
            return "😕"
        elif s <= 3.9:
            return "😐"
        elif s <= 4.4:
            return "🙂"
        return "😍"

    summary = {"😡": 0, "😕": 0, "😐": 0, "🙂": 0, "😍": 0, "total": 0}
    for r in ratings:
        summary[category(r)] += 1
    summary["total"] = len(ratings)

    return jsonify(summary), 200

@api_bp.get("/emotion-counts")
def get_emotion_counts():
    emotions = [
        "anger", "boredom", "empty", "enthusiasm", "fun",
        "happiness", "hate", "love", "neutral", "relief",
        "sadness", "surprise", "worry"
    ]

    # Query counts
    counts_query = db.session.query(
        Feedback.emotion,
        func.count(Feedback.id).label("count")
    ).group_by(Feedback.emotion).all()

    # Convert to dict
    counts_dict = {emotion: 0 for emotion in emotions}
    for emotion, count in counts_query:
        counts_dict[emotion] = count

    return jsonify(counts_dict)


@api_bp.get("/feedback-activity")
def get_feedback_activity():
    # Day-wise total count
    day_wise_data = (
        db.session.query(
            func.date(Feedback.created_at).label("date"),
            func.count(Feedback.id).label("total_count")
        )
        .join(User, User.UserId == Feedback.user_id)  # match DB fields
        .group_by(func.date(Feedback.created_at))
        .order_by(func.date(Feedback.created_at))
        .all()
    )

    # Name-wise total count
    name_wise_data = (
        db.session.query(
            User.Name.label("name"),  # capital N
            func.count(Feedback.id).label("total_count")
        )
        .join(User, User.UserId == Feedback.user_id)  # match DB fields
        .group_by(User.Name)
        .order_by(func.count(Feedback.id).desc())
        .all()
    )

    return jsonify({
        "dayWise": [
            {"date": str(row.date), "total_count": row.total_count}
            for row in day_wise_data
        ],
        "nameWise": [
            {"name": row.name if row.name else "System Entry", "total_count": row.total_count}
            for row in name_wise_data
        ]
    })

@api_bp.get("/Feedbackloc")
def get_feedback_locations():
    # 1️⃣ Subquery: latest feedback date per user
    latest_feedback = (
        db.session.query(
            Feedback.user_id,
            func.max(Feedback.created_at).label("last_feedback_date")
        )
        .group_by(Feedback.user_id)
        .subquery()
    )

    # 2️⃣ Subquery: latest login_logs per EmployeeCode
    latest_login = (
        db.session.query(
            LoginLog.EmployeeCode,
            func.max(LoginLog.created_at).label("last_login_time")
        )
        .group_by(LoginLog.EmployeeCode)
        .subquery()
    )

    # 3️⃣ Join latest feedback -> Feedback table -> latest login -> login_logs
    results = (
        db.session.query(
            Feedback.id.label("EmpLocID"),
            Feedback.user_id,
            Feedback.created_at.label("Date"),
            LoginLog.GeoLatitude.label("Latitude"),
            LoginLog.GeoLongitude.label("Longitude"),
            LoginLog.EmployeeName.label("Name"),
            LoginLog.GeoPlace.label("Place")  # ✅ corrected to match model
        )
        .join(latest_feedback, and_(
            latest_feedback.c.user_id == Feedback.user_id,
            latest_feedback.c.last_feedback_date == Feedback.created_at
        ))
        .join(latest_login, latest_login.c.EmployeeCode == Feedback.user_id)
        .join(
            LoginLog,
            and_(
                LoginLog.EmployeeCode == latest_login.c.EmployeeCode,
                LoginLog.created_at == latest_login.c.last_login_time
            )
        )
        .all()
    )

    # 4️⃣ Convert to dict for JSON
    data = [
        {
            "EmpLocID": r.EmpLocID,
            "Date": r.Date.isoformat() if r.Date else None,
            "Latitude": r.Latitude,
            "Longitude": r.Longitude,
            "Name": r.Name,
            "Place": r.Place
        }
        for r in results
    ]
    return jsonify(data)
