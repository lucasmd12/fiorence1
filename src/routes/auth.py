from flask import Blueprint, request, jsonify
from src.auth import create_user, get_user_by_email, verify_user_token, verify_token
from src.models.user_firebase import UserFirebase
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    """Registrar novo usuário"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        display_name = data.get('display_name', '')
        
        if not email or not password:
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400
        
        # Criar usuário no Firebase
        firebase_result = create_user(email, password, display_name)
        
        if not firebase_result['success']:
            return jsonify({'error': firebase_result['error']}), 400
        
        # Salvar dados adicionais no MongoDB
        user_data = {
            'firebase_uid': firebase_result['uid'],
            'email': email,
            'display_name': display_name,
            'created_at': datetime.utcnow(),
            'last_login': None,
            'is_active': True
        }
        
        user_mongo = UserFirebase()
        mongo_result = user_mongo.create_user(user_data)
        
        if not mongo_result['success']:
            return jsonify({'error': 'Erro ao salvar dados do usuário'}), 500
        
        return jsonify({
            'success': True,
            'message': 'Usuário criado com sucesso',
            'user': {
                'uid': firebase_result['uid'],
                'email': email,
                'display_name': display_name
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """Verificar login do usuário (o token é gerado no frontend)"""
    try:
        data = request.json
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Token é obrigatório'}), 400
        
        # Verificar token com Firebase
        firebase_result = verify_user_token(token)
        
        if not firebase_result['success']:
            return jsonify({'error': 'Token inválido'}), 401
        
        user_data = firebase_result['user']
        
        # Atualizar último login no MongoDB
        user_mongo = UserFirebase()
        user_mongo.update_last_login(user_data['uid'])
        
        # Buscar dados adicionais do usuário no MongoDB
        mongo_user = user_mongo.get_user_by_firebase_uid(user_data['uid'])
        
        return jsonify({
            'success': True,
            'message': 'Login realizado com sucesso',
            'user': {
                'uid': user_data['uid'],
                'email': user_data['email'],
                'display_name': user_data.get('name', ''),
                'email_verified': user_data.get('email_verified', False),
                'mongo_data': mongo_user.get('user') if mongo_user.get('success') else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/auth/verify', methods=['POST'])
def verify():
    """Verificar se o token ainda é válido"""
    try:
        data = request.json
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Token é obrigatório'}), 400
        
        # Verificar token com Firebase
        firebase_result = verify_user_token(token)
        
        if not firebase_result['success']:
            return jsonify({'error': 'Token inválido ou expirado'}), 401
        
        user_data = firebase_result['user']
        
        return jsonify({
            'success': True,
            'valid': True,
            'user': {
                'uid': user_data['uid'],
                'email': user_data['email'],
                'display_name': user_data.get('name', ''),
                'email_verified': user_data.get('email_verified', False)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/auth/profile', methods=['GET'])
@verify_token
def get_profile():
    """Obter perfil do usuário autenticado"""
    try:
        user_data = request.user
        
        # Buscar dados adicionais no MongoDB
        user_mongo = UserFirebase()
        mongo_user = user_mongo.get_user_by_firebase_uid(user_data['uid'])
        
        return jsonify({
            'success': True,
            'user': {
                'uid': user_data['uid'],
                'email': user_data['email'],
                'display_name': user_data.get('name', ''),
                'email_verified': user_data.get('email_verified', False),
                'mongo_data': mongo_user.get('user') if mongo_user.get('success') else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/auth/profile', methods=['PUT'])
@verify_token
def update_profile():
    """Atualizar perfil do usuário autenticado"""
    try:
        user_data = request.user
        data = request.json
        
        # Atualizar dados no MongoDB
        user_mongo = UserFirebase()
        update_data = {
            'display_name': data.get('display_name'),
            'updated_at': datetime.utcnow()
        }
        
        # Remover campos None
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        result = user_mongo.update_user(user_data['uid'], update_data)
        
        if not result['success']:
            return jsonify({'error': 'Erro ao atualizar perfil'}), 500
        
        return jsonify({
            'success': True,
            'message': 'Perfil atualizado com sucesso'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

