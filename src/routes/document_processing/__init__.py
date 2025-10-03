# src/routes/modules/document_processing/__init__.py
# Define o Blueprint principal de "document_processing"
# e conecta todos os submódulos de rota a ele.

from flask import Blueprint

# Cria o Blueprint principal
document_processing_bp = Blueprint("document_processing", __name__)

# Importa os submódulos, que devem registrar suas rotas no Blueprint
from . import upload_handler
from . import transaction_processor
from . import category_manager
from . import transaction_saver
from . import utilities

# Garante que o Python saiba o que exportar
__all__ = [
    'document_processing_bp',
    'upload_handler',
    'transaction_processor',
    'category_manager',
    'transaction_saver',
    'utilities'
]
