# src/routes/modules/document_processing/upload_handler.py
# Responsável por: Upload, validação de arquivos e gestão de arquivos temporários

from werkzeug.utils import secure_filename
import tempfile
import os

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'csv', 'xlsx', 'xls'}

def allowed_file(filename):
    """Verifica se o arquivo possui extensão permitida"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_file(file):
    """
    Valida arquivo enviado
    
    Returns:
        tuple: (is_valid: bool, error_message: str or None)
    """
    if not file:
        return False, 'Nenhum arquivo enviado'
    
    if file.filename == '':
        return False, 'Nenhum arquivo selecionado'
    
    if not allowed_file(file.filename):
        return False, 'Tipo de arquivo não suportado'
    
    return True, None

def save_temp_file(file):
    """
    Salva arquivo temporariamente
    
    Returns:
        tuple: (temp_file_path: str, filename: str, file_extension: str)
    """
    filename = secure_filename(file.filename)
    file_extension = filename.rsplit('.', 1)[1].lower()
    
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file_extension}')
    file.save(temp_file.name)
    temp_file_path = temp_file.name
    temp_file.close()
    
    return temp_file_path, filename, file_extension

def cleanup_temp_file(file_path):
    """Remove arquivo temporário"""
    try:
        if os.path.exists(file_path):
            os.unlink(file_path)
            print(f"Arquivo temporário removido: {file_path}")
            return True
    except Exception as e:
        print(f"Erro ao limpar arquivo temporário: {e}")
        return False