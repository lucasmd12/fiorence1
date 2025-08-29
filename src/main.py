import os
import sys

# Ajuste para que o Python encontre os módulos dentro de 'src'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from database.mongodb import mongodb
from models.category_mongo import Category
from routes.user_mongo import user_bp
from routes.transactions_mongo import transactions_bp
from routes.categories_mongo import categories_bp
from routes.upload import upload_bp

# Importar as novas rotas
from routes.auth import auth_bp
from routes.recurring import recurring_bp
from routes.document_processing import document_processing_bp

# AJUSTE: Aponta para 'static/dist' onde o Vite coloca os arquivos buildados
app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static', 'dist'))
app.config.from_object(Config)

# Enable CORS for all routes
CORS(app)

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(transactions_bp, url_prefix='/api')
app.register_blueprint(categories_bp, url_prefix='/api')
app.register_blueprint(upload_bp, url_prefix='/api')

# Registrar as novas blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(recurring_bp, url_prefix='/api')
app.register_blueprint(document_processing_bp, url_prefix='/api')

# Initialize MongoDB connection and seed data
with app.app_context():
    # Test MongoDB connection
    try:
        mongodb.client.admin.command('ping')
        print("MongoDB connection successful!")
        
        # Seed default categories
        Category.seed_default_categories()
        print("Default categories seeded!")
        
    except Exception as e:
        print(f"MongoDB connection failed: {e}")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)


