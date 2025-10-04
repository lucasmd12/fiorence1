# src/routes/document_processing.py
# ARQUIVO PAI - Orquestra todos os módulos de processamento de documentos

from flask import Blueprint

# 1. Importar os módulos do subdiretório 'document_processing'.
#    A sintaxe '.document_processing' refere-se ao pacote (a pasta)
#    e de lá importamos os arquivos .py (os módulos).
from .document_processing import transaction_processor
from .document_processing import category_manager
from .document_processing import transaction_saver
from .document_processing import utilities
# Adicionei o upload_handler que estava no seu exemplo original, caso seja necessário.
# from .document_processing import upload_handler

# 2. Criar o Blueprint principal SEM o url_prefix.
#    O prefixo será adicionado nas próprias rotas dentro de cada módulo.
#    Isso centraliza a lógica de roteamento nos arquivos finais.
document_processing_bp = Blueprint('document_processing', __name__)

# 3. Registrar as rotas de cada módulo no Blueprint principal.
#    Cada função 'register_routes' adicionará suas rotas ao 'document_processing_bp'.
# upload_handler.register_routes(document_processing_bp) # Descomente se este módulo também tiver rotas
transaction_processor.register_routes(document_processing_bp)
category_manager.register_routes(document_processing_bp)
transaction_saver.register_routes(document_processing_bp)
utilities.register_routes(document_processing_bp)

# 4. Exportar o Blueprint montado para ser usado no app principal (main.py).
__all__ = ['document_processing_bp']
