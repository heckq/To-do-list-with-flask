from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv
from models import db
from handlers import sign_up,login,add_task



load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}/{os.getenv('POSTGRES_DB')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_default_secret_key')
db.init_app(app)

@app.route('/sign_up', methods=['POST'])
def signing_up():
    return sign_up()

@app.route('/login', methods=['POST'])
def loging_in():
    return login()

@app.route('/tasks' , methods=(['POST'],['GET']))
def handle_add_task():
    return add_task()


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)