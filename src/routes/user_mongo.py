from flask import Blueprint, request, jsonify
from src.models.user_mongo import User
import hashlib

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        
        # Verificar se o usuário já existe
        existing_user = User.find_by_email(data['email'])
        if existing_user:
            return jsonify({'error': 'User already exists'}), 400
        
        # Hash da senha (implementação simples)
        password_hash = hashlib.sha256(data['password'].encode()).hexdigest()
        
        user = User(
            username=data['username'],
            email=data['email'],
            password_hash=password_hash
        )
        
        user.save()
        return jsonify(user.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/login', methods=['POST'])
def login_user():
    try:
        data = request.get_json()
        
        user = User.find_by_email(data['email'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Verificar senha
        password_hash = hashlib.sha256(data['password'].encode()).hexdigest()
        if user.password_hash != password_hash:
            return jsonify({'error': 'Invalid password'}), 401
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

