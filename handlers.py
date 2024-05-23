from operator import or_
from flask import json, jsonify, request
from models import Users, db, Todo
from werkzeug.security import generate_password_hash,check_password_hash
import json

def sign_up():
    if request.method == 'POST':
        data = request.data
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400

        parsed_data = json.loads(data)
        username = parsed_data.get('username')
        email = parsed_data.get('email')
        password = parsed_data.get('password')
        confirm_password = parsed_data.get('confirm_password')

        if not all([username, email, password, confirm_password]):
            return jsonify({'error': 'Missing required fields'}), 400

        if password != confirm_password:
            return jsonify({'error': 'Passwords do not match'}), 400

        existing_user = Users.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'error': 'Email already registered. Please log in.'}), 400

        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = Users(username=username, email=email, password=hashed_password)
        try:
            db.session.add(new_user)
            db.session.commit()
            return jsonify({'message': 'Registration successful! Please log in.','user': new_user.to_json()}), 200
        except Exception as e:
            print(f"Error registering user: {e}")
            return jsonify({'error': 'There was an issue registering your account'}), 500
    else:
        return jsonify({'error': 'Method not allowed'}), 405

def login():
    if request.method=='POST':
        data = request.data
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400
        parsed_data = json.loads(data)
        identifier = parsed_data.get('identifier')
        password = parsed_data.get('password')
        if not identifier or not password:
            return jsonify({'error': 'Missing identifier or password'}), 400
        user = Users.query.filter(or_(Users.email == identifier, Users.username == identifier)).first()
        if user and check_password_hash(user.password, password):
            return jsonify({'message': 'Login successful', 'user': user.to_json()}), 200
        else:
            return jsonify({'error': 'Invalid username/email or password'}), 401

def add_task():
    if request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400
        
        content = data.get('content')
        due_date = data.get('due_date')
        user_id = data.get('user_id')
        
        if not content or not user_id:
            return jsonify({'error': 'Content and user_id are required'}), 400
        
        new_task = Todo(content=content, due_date=due_date, user_id=user_id)
        try:
            db.session.add(new_task)
            db.session.commit()
            return jsonify({'message': 'Task added successfully', 'task': new_task.to_json()}), 200
        except Exception as e:
            print(f"Error adding task: {e}")
            return jsonify({'error': f'An error occurred: {e}'}), 500
    else:
        tasks = Todo.query.all()
        return jsonify({'tasks': [task.to_json() for task in tasks]}), 200

