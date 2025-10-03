# src/routes/modules/document_processing/__init__.py
# Facilita importação dos módulos

from . import upload_handler
from . import transaction_processor
from . import category_manager
from . import transaction_saver
from . import utilities

__all__ = [
    'upload_handler',
    'transaction_processor',
    'category_manager',
    'transaction_saver',
    'utilities'
]