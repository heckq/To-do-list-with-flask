from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from models import Todo, db
from handlers import sign_up,login,add_task

TASKS_PER_PAGE = 3


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
        user_id = request.args.get('user_id')  
        page = int(request.args.get('page', 1))  
        tasks = Todo.query.filter_by(user_id=user_id).paginate(page=page, per_page=TASKS_PER_PAGE, error_out=False)
        tasks_data = [task.to_json() for task in tasks.items]

        has_prev = tasks.has_prev
        if page == 1:
            has_prev = False

        return jsonify({'tasks': tasks_data, 'has_prev': has_prev, 'has_next': tasks.has_next}), 200
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