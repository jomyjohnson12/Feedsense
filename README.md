Feedsense – AI + React Screening Test Project

Overview
Feedsense is a web application built with React for the frontend and Flask for the backend, using SQLite as the database. The platform allows users to sign up, sign in, submit feedback, and includes an AI-based sentiment analysis for evaluating feedback. Administrators can view dashboards summarizing user feedback and sentiment results.

Features
-----
User Role
SignUp: Users can create an account by providing their details. Input validation is implemented.
SignIn: Users log in with credentials. Successful login grants access to the feedback form.
Feedback: Users submit ratings and comments about their platform experience. Feedback is stored in the database.

AI Assessment
Sentiment analysis model evaluates the emotion of user feedback (positive, negative, neutral).
Analysis is run on all submitted feedback for insights into user experience.

Administrator Role
Admin Login: Static credentials – admin / admin123.

Dashboard: Shows a summary of all user feedback along with sentiment analysis.
Access restricted only to admin.

Tech Stack
----
Frontend: React.js
Backend: Flask
Database: SQLite
AI/ML: Python (e.g., scikit-learn or NLTK for sentiment analysis)

Installation
Run backend 
---------
cd Backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
set FLASK_APP=app.py
flask run

Run Frontend
-------
cd Frontend
npm install
npm run dev


