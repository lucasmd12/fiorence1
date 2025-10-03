# src/routes/document_processing/__init__.py
# Define o Blueprint principal de "document_processing"
# e conecta todos os submódulos de rota a ele.

from flask import Blueprint

# 1. Importe os submódulos primeiro
from . import upload_handler
from . import transaction_processor
from . import category_manager
from . import transaction_saver
from . import utilities

# 2. Crie o Blueprint principal. 
#    É uma boa prática definir o prefixo comum aqui para evitar repetição.
document_processing_bp = Blueprint(
    "document_processing", 
    __name__, 
    url_prefix='/documents'
)

# 3. CHAME A FUNÇÃO DE REGISTRO DE CADA SUBMÓDULO (ESTA É A CORREÇÃO)
#    Isso conecta as rotas definidas em cada arquivo ao 'document_processing_bp'.
transaction_processor.register_routes(document_processing_bp)
category_manager.register_routes(document_processing_bp)
transaction_saver.register_routes(document_processing_bp)
utilities.register_routes(document_processing_bp)
# Nota: upload_handler.py não tem rotas, apenas funções auxiliares, então não precisa ser registrado.

# 4. Exporte apenas o Blueprint configurado para ser usado no main.py
__all__ = [
    'document_processing_bp'
]
