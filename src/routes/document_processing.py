# src/routes/document_processing.py
# ARQUIVO PAI - Orquestra todos os módulos de processamento de documentos

from flask import Blueprint

# Importar módulos
from .modules.document_processing import (
    upload_handler,
    transaction_processor,
    category_manager,
    transaction_saver,
    utilities
)

# Criar Blueprint principal com prefixo correto
document_processing_bp = Blueprint(
    'document_processing',
    __name__,
    url_prefix='/documents'  # ⚠️ Importante para manter o /api/documents no main.py
)

# Registrar rotas de cada módulo no Blueprint
transaction_processor.register_routes(document_processing_bp)
category_manager.register_routes(document_processing_bp)
transaction_saver.register_routes(document_processing_bp)
utilities.register_routes(document_processing_bp)

# Exportar para uso no projeto
__all__ = ['document_processing_bp']
