from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from models import Todo, db
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

@app.route('/tasks', methods=['GET', 'POST'])
def handle_tasks():
    if request.method == 'GET':
        tasks = Todo.query.all()
        return jsonify({'tasks': [task.to_json() for task in tasks]}), 200
    elif request.method == 'POST':
        return add_task()


@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Todo.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404

    try:
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task deleted successfully'}), 200
    except Exception as e:
        print(f"Error deleting task: {e}")
        db.session.rollback()
        return jsonify({'error': f'An error occurred: {e}'}), 500

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)