# -- models.py
from datetime import datetime, timezone, timedelta
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func

db = SQLAlchemy()

# Indian Standard Time (UTC+5:30)
IST = timezone(timedelta(hours=5, minutes=30))

class User(db.Model):
    __tablename__ = "users"

    UserId = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(120), nullable=False)
    Mobile = db.Column(db.String(20), nullable=False)
    Email = db.Column(db.String(200), nullable=False, unique=True)
    Username = db.Column(db.String(80), nullable=False, unique=True, index=True)
    PasswordHash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)

    def to_public_json(self):
        return {
            "UserId": self.UserId,
            "Name": self.Name,
            "Mobile": self.Mobile,
            "Email": self.Email,
            "Username": self.Username,
            "CreatedAt": self.created_at.astimezone(IST).isoformat() if self.created_at else None,
        }

class LoginLog(db.Model):
    __tablename__ = "login_logs"

    LogId = db.Column(db.Integer, primary_key=True)
    EmployeeCode = db.Column(db.Integer, db.ForeignKey("users.UserId"), nullable=True)
    EmployeeName = db.Column(db.String(120), nullable=True)
    LoginUserName = db.Column(db.String(80), nullable=False)
    IPAddress = db.Column(db.String(64), nullable=True)
    LoginStatus = db.Column(db.Boolean, default=False, nullable=False)
    UserAgent = db.Column(db.Text, nullable=True)
    LoginMethod = db.Column(db.String(50), nullable=True)
    SessionID = db.Column(db.String(128), nullable=True)
    GeoLatitude = db.Column(db.Float, nullable=True)
    GeoLongitude = db.Column(db.Float, nullable=True)
    GeoPlace = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)

    def to_public_json(self):
        return {
            "LogId": self.LogId,
            "EmployeeCode": self.EmployeeCode,
            "EmployeeName": self.EmployeeName,
            "LoginUserName": self.LoginUserName,
            "IPAddress": self.IPAddress,
            "LoginStatus": self.LoginStatus,
            "UserAgent": self.UserAgent,
            "LoginMethod": self.LoginMethod,
            "SessionID": self.SessionID,
            "GeoLatitude": self.GeoLatitude,
            "GeoLongitude": self.GeoLongitude,
            "GeoPlace": self.GeoPlace,
            "CreatedAt": self.created_at.astimezone(IST).isoformat() if self.created_at else None,
        }

class Feedback(db.Model):
    __tablename__ = "feedback"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.UserId"), nullable=False)  # NEW
    usage_frequency = db.Column(db.String(50), nullable=False)
    primary_purpose = db.Column(db.String(50), nullable=False)
    ease_of_use = db.Column(db.Integer, nullable=False)
    speed_performance = db.Column(db.Integer, nullable=False)
    feature_quality = db.Column(db.Integer, nullable=False)
    customer_support = db.Column(db.Integer, nullable=False)
    overall_rating = db.Column(db.Float, nullable=False)
    feedback_text = db.Column(db.Text, nullable=False)
    emotion = db.Column(db.String(50), nullable=True)  # initially NULL
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)

    def to_public_json(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "usage_frequency": self.usage_frequency,
            "primary_purpose": self.primary_purpose,
            "ease_of_use": self.ease_of_use,
            "speed_performance": self.speed_performance,
            "feature_quality": self.feature_quality,
            "customer_support": self.customer_support,
            "overall_rating": self.overall_rating,
            "feedback_text": self.feedback_text,
            "emotion": self.emotion,
            "CreatedAt": self.created_at.astimezone(IST).isoformat() if self.created_at else None,
        }
