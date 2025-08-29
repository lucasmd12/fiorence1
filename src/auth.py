import firebase_admin
from firebase_admin import credentials, auth
from flask import request, jsonify
from functools import wraps
import os

# Inicializar Firebase Admin SDK
cred = credentials.Certificate('/home/ubuntu/Rezendeinteligente/src/borrachariadeley-76f94-firebase-adminsdk-fbsvc-f997c8f27d.json')
firebase_admin.initialize_app(cred)

def verify_token(f):
    """Decorator para verificar token de autenticação Firebase"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Verificar se o token está no header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Token inválido'}), 401
        
        if not token:
            return jsonify({'error': 'Token de autenticação necessário'}), 401
        
        try:
            # Verificar o token com Firebase
            decoded_token = auth.verify_id_token(token)
            request.user = decoded_token
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Token inválido ou expirado'}), 401
    
    return decorated_function

def create_user(email, password, display_name=None):
    """Criar um novo usuário no Firebase"""
    try:
        user = auth.create_user(
            email=email,
            password=password,
            display_name=display_name
        )
        return {'success': True, 'uid': user.uid, 'email': user.email}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def get_user_by_email(email):
    """Buscar usuário por email"""
    try:
        user = auth.get_user_by_email(email)
        return {
            'success': True,
            'user': {
                'uid': user.uid,
                'email': user.email,
                'display_name': user.display_name,
                'email_verified': user.email_verified
            }
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}

def update_user(uid, **kwargs):
    """Atualizar dados do usuário"""
    try:
        user = auth.update_user(uid, **kwargs)
        return {'success': True, 'uid': user.uid}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def delete_user(uid):
    """Deletar usuário"""
    try:
        auth.delete_user(uid)
        return {'success': True}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def verify_user_token(token):
    """Verificar token do usuário"""
    try:
        decoded_token = auth.verify_id_token(token)
        return {'success': True, 'user': decoded_token}
    except Exception as e:
        return {'success': False, 'error': str(e)}

