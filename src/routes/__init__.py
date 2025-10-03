# src/routes/__init__.py
# Este arquivo é a "sala de controle" que expõe todos os Blueprints para a aplicação principal.

# Importa o Blueprint de cada um dos seus arquivos de rota principais.
from .auth import auth_bp
from .categories_mongo import categories_bp
from .document_processing import document_processing_bp
from .recurring import recurring_bp
from .reports_export import reports_export_bp
from .transactions_mongo import transactions_bp
from .user_mongo import user_bp

# Esta lista informa ao Python quais nomes devem ser considerados "públicos"
# quando alguém faz 'from routes import *', o que é uma boa prática.
__all__ = [
    'auth_bp',
    'categories_bp',
    'document_processing_bp',
    'recurring_bp',
    'reports_export_bp',
    'transactions_bp',
    'user_bp'
]
