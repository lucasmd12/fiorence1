# ARQUIVO: src/main.py (Completo e com estrutura aprimorada)

import os
import sys

# Ajuste para que o Python encontre os módulos dentro de 'src'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from flask import Flask, send_from_directory, jsonify, Blueprint
from flask_cors import CORS
from config import Config
from database.mongodb import mongodb

# Importar os blueprints dos módulos de rotas
from routes.user_mongo import user_bp
from routes.transactions_mongo import transactions_bp
from routes.categories_mongo import categories_bp
from routes.auth import auth_bp
from routes.recurring import recurring_bp
from routes.document_processing import document_processing_bp
from routes.reports_export import reports_export_bp

# --- Configuração da Aplicação Flask ---
# Aponta para 'static/dist' onde o Vite coloca os arquivos buildados
app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static', 'dist'))
app.config.from_object(Config)

# Habilita CORS para todas as rotas, permitindo que o frontend acesse a API
CORS(app)


# --- Estrutura de Blueprints Aninhados (Boa Prática) ---
# 1. Crie um Blueprint "pai" para agrupar todas as rotas da API sob um único prefixo.
api_bp = Blueprint('api', __name__, url_prefix='/api')

# 2. Registre todos os blueprints de funcionalidades DENTRO do blueprint 'api_bp'.
#    O Flask irá aninhar os prefixos. Por exemplo, document_processing_bp (com prefixo '/documents')
#    se tornará '/api/documents'.
api_bp.register_blueprint(user_bp)
api_bp.register_blueprint(transactions_bp)
api_bp.register_blueprint(categories_bp)
api_bp.register_blueprint(auth_bp)
api_bp.register_blueprint(recurring_bp)
api_bp.register_blueprint(document_processing_bp)
api_bp.register_blueprint(reports_export_bp)

# 3. Registre o Blueprint "pai" na aplicação Flask principal.
app.register_blueprint(api_bp)


# --- Inicialização e Verificação de Conexão ---
with app.app_context():
    # Testa a conexão com o MongoDB na inicialização
    try:
        mongodb.client.admin.command('ping')
        print("✅ Conexão com o MongoDB estabelecida com sucesso!")
        
        # Se necessário, descomente para popular categorias padrão na primeira execução
        # from models.category_mongo import Category
        # Category.seed_default_categories()
        # print("✅ Categorias padrão verificadas/criadas!")
        
    except Exception as e:
        print(f"❌ Falha na conexão com o MongoDB: {e}")


# --- Rotas Utilitárias e de Serviço ---

@app.route('/api/health')
def health_check():
    """Rota leve para verificações de saúde (ex: Render.com usa para saber se o serviço está ativo)."""
    return jsonify({"status": "ok", "message": "Serviço operacional"}), 200

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """
    Serve os arquivos estáticos do frontend (React/Vite).
    - Se o caminho existir (ex: /assets/index.js), serve o arquivo.
    - Caso contrário, serve o 'index.html' para permitir que o roteamento do React funcione.
    """
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Erro: Pasta estática não configurada.", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "Erro: index.html não encontrado na pasta de build.", 404


# --- Ponto de Entrada da Aplicação ---
if __name__ == '__main__':
    # Executa o servidor em modo de desenvolvimento
    app.run(host='0.0.0.0', port=5000, debug=True)
