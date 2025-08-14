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
-----
Run backend 
----
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



Screenshots
--------

<img width="1920" height="1080" alt="Screenshot (15)" src="https://github.com/user-attachments/assets/1c72831e-2ac6-48ba-a33c-8b510fa009d4" />
<img width="1920" height="1080" alt="Screenshot (16)" src="https://github.com/user-attachments/assets/e8d3e160-a7ad-4213-858c-829a54a7128c" />
<img width="1920" height="1080" alt="Screenshot (17)" src="https://github.com/user-attachments/assets/d112a704-97aa-4333-bcbd-e11368c96c41" />
<img width="1920" height="1080" alt="Screenshot (18)" src="https://github.com/user-attachments/assets/7d893027-5bb7-4799-93e4-8b258a26c1cb" />
<img width="1920" height="1080" alt="Screenshot (21)" src="https://github.com/user-attachments/assets/505411f2-745f-427f-bdf4-b6083e4e64bc" />
<img width="1920" height="1080" alt="Screenshot (22)" src="https://github.com/user-attachments/assets/2a2b000b-ff9e-43bb-8421-4ddb461e4576" />
<img width="1920" height="1080" alt="Screenshot (24)" src="https://github.com/user-attachments/assets/bc7bb50c-59c7-431d-b5a0-5e0bcd962210" />
<img width="1920" height="1080" alt="Screenshot (25)" src="https://github.com/user-attachments/assets/c334a4bc-fc01-4072-b98f-e4a5dd4d1c7c" />
<img width="1920" height="1080" alt="Screenshot (26)" src="https://github.com/user-attachments/assets/ea3fa55a-9f02-4ae8-9ebc-659c0cfb495d" />
<img width="1920" height="1080" alt="Screenshot (27)" src="https://github.com/user-attachments/assets/cc378207-208a-43ef-a099-13c46ac69596" />
<img width="1920" height="1080" alt="Screenshot (28)" src="https://github.com/user-attachments/assets/7a7ef042-1346-4521-9eeb-cb9452863cbe" />
<img width="1920" height="1080" alt="Screenshot (29)" src="https://github.com/user-attachments/assets/b3a57921-4b8f-4aed-af0b-b2ba974024d3" />


