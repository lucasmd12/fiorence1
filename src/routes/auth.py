# ARQUIVO CORRIGIDO: src/routes/auth.py

from flask import Blueprint, request, jsonify
# Importamos os modelos e funções que vamos precisar
from models.user_mongo import User
from models.category_mongo import Category  # <-- 1. IMPORTAR O MODELO CATEGORY
from auth import create_user, generate_custom_token, verify_password_and_get_uid, verify_token
import re

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/auth/register-with-username", methods=["POST"])
def register_with_username():
    """Registra um novo usuário e cria suas categorias padrão."""
    try:
        data = request.json
        username = data.get("username")
        password = data.get("password")
        display_name = data.get("display_name", "")

        if not username or not password:
            return jsonify({"error": "Nome de usuário e senha são obrigatórios"}), 400

        if not re.match(r"^[a-zA-Z0-9_.-]+$", username):
            return jsonify({"error": "Nome de usuário inválido. Use apenas letras, números e os caracteres _ . -"}), 400

        if User.find_by_username(username):
            return jsonify({"error": "Este nome de usuário já está em uso"}), 409

        email_ficticio = f"{username.lower()}@contabilidade-rezende.app"
        if User.find_by_email(email_ficticio):
            return jsonify({"error": "Este nome de usuário já está associado a uma conta"}), 409

        firebase_result = create_user(email_ficticio, password, display_name)
        if not firebase_result["success"]:
            return jsonify({"error": firebase_result["error"]}), 400

        user_mongo = User(
            uid=firebase_result["uid"],
            username=username,
            email=email_ficticio,
            display_name=display_name,
            role="user"
        )
        user_mongo.save()

        # 2. CHAMADA PARA CRIAR AS CATEGORIAS PADRÃO PARA O NOVO USUÁRIO
        try:
            Category.seed_default_categories(user_id=firebase_result["uid"])
            print(f"Categorias padrão criadas para o usuário {firebase_result['uid']}")
        except Exception as seed_error:
            # Log do erro, mas não impede o registro do usuário
            print(f"AVISO: Falha ao criar categorias padrão para o usuário {firebase_result['uid']}. Erro: {seed_error}")


        custom_token = generate_custom_token(firebase_result["uid"])

        return jsonify({
            "success": True,
            "message": "Usuário criado com sucesso!",
            "token": custom_token, # O frontend usará isso para logar
            "user": user_mongo.to_dict()
        }), 201

    except Exception as e:
        return jsonify({"error": f"Erro interno no servidor: {e}"}), 500

@auth_bp.route("/auth/username-login", methods=["POST"])
def username_login():
    """Autentica um usuário com nome de usuário e senha."""
    try:
        data = request.json
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "Nome de usuário e senha são obrigatórios"}), 400

        user_mongo = User.find_by_username(username)
        if not user_mongo:
            return jsonify({"error": "Nome de usuário ou senha inválidos"}), 401

        uid = verify_password_and_get_uid(user_mongo.email, password)

        if not uid:
            return jsonify({"error": "Nome de usuário ou senha inválidos"}), 401

        if uid != user_mongo.uid:
             return jsonify({"error": "Inconsistência de dados, contate o suporte"}), 500

        custom_token = generate_custom_token(uid)

        return jsonify({
            "success": True,
            "message": "Login bem-sucedido!",
            "token": custom_token,
            "user": user_mongo.to_dict()
        }), 200

    except Exception as e:
        return jsonify({"error": f"Erro interno no servidor: {e}"}), 500

@auth_bp.route("/auth/profile", methods=["GET"])
@verify_token
def get_profile(current_user_uid):
    """Obtém o perfil do usuário autenticado."""
    user_mongo = User.find_by_uid(current_user_uid)
    if not user_mongo:
        return jsonify({"error": "Usuário não encontrado no banco de dados"}), 404
    
    return jsonify({"success": True, "user": user_mongo.to_dict()}), 200

