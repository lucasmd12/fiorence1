import firebase_admin
from firebase_admin import credentials, auth
from flask import request, jsonify
from functools import wraps
import os
import requests # Para fazer requisições HTTP para a API REST do Firebase Auth

# CORREÇÃO: Variável global para controlar se Firebase já foi inicializado
_firebase_initialized = False

def initialize_firebase():
    """Inicializa Firebase apenas uma vez"""
    global _firebase_initialized
    
    if _firebase_initialized:
        return
    
    try:
        # Verificar se já existe uma app Firebase
        firebase_admin.get_app()
        _firebase_initialized = True
        return
    except ValueError:
        # App não existe, pode inicializar
        pass
    
    # Inicializar Firebase Admin SDK
    # Tenta carregar as credenciais da variável de ambiente GOOGLE_APPLICATION_CREDENTIALS
    # ou de um caminho relativo se a variável não estiver definida (para desenvolvimento local)
    if "GOOGLE_APPLICATION_CREDENTIALS" in os.environ:
        cred = credentials.ApplicationDefault()
    else:
        # Para desenvolvimento local, assume que o arquivo está na mesma pasta que auth.py
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        FIREBASE_CREDENTIALS_PATH = os.path.join(
            BASE_DIR,
            os.environ.get("FIREBASE_ADMIN_SDK_PATH", "borrachariadeley-76f94-firebase-adminsdk-fbsvc-f997c8f27d.json")
        )
        
        # Verificar se o arquivo de credenciais existe
        if os.path.exists(FIREBASE_CREDENTIALS_PATH):
            cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
        else:
            print(f"AVISO: Arquivo de credenciais Firebase não encontrado em: {FIREBASE_CREDENTIALS_PATH}")
            # Em produção, usar ApplicationDefault mesmo sem GOOGLE_APPLICATION_CREDENTIALS
            cred = credentials.ApplicationDefault()
    
    try:
        firebase_admin.initialize_app(cred)
        _firebase_initialized = True
        print("Firebase Admin SDK inicializado com sucesso!")
    except Exception as e:
        print(f"Erro ao inicializar Firebase: {e}")
        raise

# Inicializar Firebase quando o módulo for importado
initialize_firebase()

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
            # Passa o UID do usuário para a função decorada
            return f(decoded_token['uid'], *args, **kwargs)
        except Exception as e:
            print(f"Erro ao verificar token: {e}")
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


def generate_custom_token(uid):
    """Gera um token customizado do Firebase para um UID."""
    try:
        custom_token = auth.create_custom_token(uid)
        return custom_token.decode('utf-8') # Retorna como string
    except Exception as e:
        print(f"Erro ao gerar token customizado para {uid}: {e}")
        return None

def verify_password_and_get_uid(email, password):
    """Verifica a senha de um usuário usando a API REST do Firebase Auth e retorna o UID.
    Retorna o UID se a autenticação for bem-sucedida, None caso contrário.
    """
    # A API Key do Firebase é necessária para esta requisição.
    # É altamente recomendável que esta API Key seja uma variável de ambiente.
    FIREBASE_WEB_API_KEY = os.environ.get("FIREBASE_WEB_API_KEY")

    if not FIREBASE_WEB_API_KEY:
        print("ERRO: FIREBASE_WEB_API_KEY não configurada. Não é possível verificar a senha.")
        return None

    rest_api_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_WEB_API_KEY}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "email": email,
        "password": password,
        "returnSecureToken": True
    }

    try:
        response = requests.post(rest_api_url, headers=headers, json=payload)
        response_data = response.json()

        if response.status_code == 200 and "localId" in response_data:
            return response_data["localId"]
        else:
            print(f"Erro na verificação de senha Firebase: {response_data.get('error', {}).get('message', 'Erro desconhecido')}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Erro de conexão ao verificar senha Firebase: {e}")
        return None


# As funções abaixo não são mais usadas diretamente pelo auth.py de rotas
# mas podem ser úteis para outras partes do backend ou para depuração.

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
