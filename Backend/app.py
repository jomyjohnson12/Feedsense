from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from controllers import api_bp

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGIN}})

db.init_app(app)
with app.app_context():
    db.create_all()

app.register_blueprint(api_bp)

if __name__ == "__main__":
    app.run(debug=(Config.ENV == "development"))
