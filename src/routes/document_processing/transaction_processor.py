# src/routes/modules/document_processing/transaction_processor.py
# Responsável por: Processamento principal de documentos e extração de transações

from flask import request, jsonify
from datetime import datetime, date
import traceback
from auth import verify_token
from services.document_processor import DocumentProcessor
from .upload_handler import validate_file, save_temp_file, cleanup_temp_file
from .category_manager import process_transaction_categories
from .transaction_saver import auto_save_transactions

def register_routes(bp):
    """Registra rotas deste módulo no Blueprint"""
    
    @bp.route('/documents/process', methods=['POST'])
    @verify_token
    def process_document(current_user_uid):
        """Processar documento e extrair transações com categorização dinâmica"""
        try:
            print(f"Processando documento para usuário: {current_user_uid}")
            
            # Validar arquivo
            file = request.files.get('file')
            is_valid, error = validate_file(file)
            if not is_valid:
                return jsonify({'success': False, 'error': error}), 400
            
            # Obter parâmetros
            context = request.form.get('context', 'business')
            auto_save = request.form.get('auto_save', 'false').lower() == 'true'
            
            print(f"Arquivo: {file.filename}, Context: {context}, Auto-save: {auto_save}")
            
            # Salvar arquivo temporariamente
            temp_file_path, filename, file_extension = save_temp_file(file)
            
            try:
                print(f"Processando arquivo: {temp_file_path}")
                
                # Processar documento
                processor = DocumentProcessor()
                result = processor.process_document(temp_file_path, file_extension, context)
                
                print(f"Resultado do processamento: {result}")
                
                if not result.get('success', False):
                    return jsonify({'success': False, 'error': result.get('error', 'Erro desconhecido')}), 500
                
                # Validar transações
                valid_transactions = processor.validate_transactions(result.get('transactions', []))
                print(f"Transações válidas encontradas: {len(valid_transactions)}")
                
                # Categorizar transações dinamicamente
                processed_transactions, categories_created = process_transaction_categories(
                    valid_transactions, 
                    current_user_uid, 
                    context, 
                    processor
                )
                
                # Definir status (pago/pendente) baseado na data
                final_transactions = set_transaction_status(processed_transactions)
                
                print(f"Processamento concluído: {len(final_transactions)} transações, {categories_created} categorias criadas")
                
                # Gerar resumo
                summary = processor.get_processing_summary(final_transactions)
                summary['categories_created'] = categories_created
                
                # Buscar categorias disponíveis
                from models.category_mongo import Category
                all_categories = Category.find_all({
                    'user_id': current_user_uid,
                    'context': context
                })
                
                available_categories = [
                    {'id': str(cat._id), 'name': cat.name} 
                    for cat in all_categories
                ]
                
                response_data = {
                    'success': True,
                    'transactions': final_transactions,
                    'summary': summary,
                    'filename': filename,
                    'available_categories': available_categories,
                    'categories_created': categories_created
                }
                
                # Auto-salvamento
                if auto_save and final_transactions:
                    save_result = auto_save_transactions(final_transactions, current_user_uid)
                    response_data.update(save_result)
                
                return jsonify(response_data), 200
                
            finally:
                cleanup_temp_file(temp_file_path)
                    
        except Exception as e:
            print(f"Erro geral no processamento: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return jsonify({'success': False, 'error': f'Erro interno: {str(e)}'}), 500
    
    @bp.route('/documents/extract-text', methods=['POST'])
    @verify_token
    def extract_text_only(current_user_uid):
        """Extrair apenas texto de um documento (sem processar transações)"""
        try:
            print(f"Extraindo texto para o usuário: {current_user_uid}")
            
            file = request.files.get('file')
            is_valid, error = validate_file(file)
            if not is_valid:
                return jsonify({'success': False, 'error': error}), 400
            
            temp_file_path, filename, file_extension = save_temp_file(file)
            
            try:
                text = extract_text_from_file(temp_file_path, file_extension)
                
                return jsonify({
                    'success': True,
                    'extracted_text': text,
                    'filename': filename
                }), 200
                
            finally:
                cleanup_temp_file(temp_file_path)
                    
        except Exception as e:
            return jsonify({'success': False, 'error': f'Erro interno: {str(e)}'}), 500


def set_transaction_status(transactions):
    """Define status 'paid' ou 'pending' baseado na data da transação"""
    today = date.today()
    final_transactions = []
    
    for t in transactions:
        try:
            transaction_date = datetime.strptime(t['date'], '%Y-%m-%d').date()
            t['status'] = 'paid' if transaction_date <= today else 'pending'
        except (ValueError, KeyError):
            t['status'] = 'pending'
        
        final_transactions.append(t)
    
    return final_transactions


def extract_text_from_file(file_path, file_extension):
    """Extrai texto de PDF ou imagem"""
    if file_extension == 'pdf':
        import PyPDF2
        with open(file_path, 'rb') as pdf_file:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    
    elif file_extension in ['jpg', 'jpeg', 'png']:
        from PIL import Image
        import pytesseract
        image = Image.open(file_path)
        return pytesseract.image_to_string(image, lang='por')
    
    else:
        raise ValueError('Extração de texto não suportada para este tipo de arquivo')