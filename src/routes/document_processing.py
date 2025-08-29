from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from src.auth import verify_token
from src.services.document_processor import DocumentProcessor
from src.models.transaction_mongo import Transaction
from src.models.category_mongo import Category
import tempfile

document_processing_bp = Blueprint('document_processing', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'csv', 'xlsx', 'xls'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@document_processing_bp.route('/documents/process', methods=['POST'])
@verify_token
def process_document():
    """Processar documento e extrair transações"""
    try:
        user_data = request.user
        
        # Verificar se arquivo foi enviado
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Tipo de arquivo não suportado'}), 400
        
        # Obter parâmetros
        context = request.form.get('context', 'business')
        auto_save = request.form.get('auto_save', 'false').lower() == 'true'
        
        # Salvar arquivo temporariamente
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file_extension}') as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name
        
        try:
            # Processar documento
            processor = DocumentProcessor()
            result = processor.process_document(temp_file_path, file_extension, context)
            
            if not result['success']:
                return jsonify({'error': result['error']}), 500
            
            # Validar transações
            valid_transactions = processor.validate_transactions(result['transactions'])
            
            # Mapear categorias para IDs
            category_model = Category()
            categories = category_model.get_categories_by_context(context)
            category_map = {cat['name'].lower(): cat['id'] for cat in categories}
            
            # Adicionar category_id às transações
            for transaction in valid_transactions:
                category_name = transaction.get('category', 'outros').lower()
                transaction['category_id'] = category_map.get(category_name, category_map.get('outros', 1))
                transaction['user_id'] = user_data['uid']
            
            # Gerar resumo
            summary = processor.get_processing_summary(valid_transactions)
            
            response_data = {
                'success': True,
                'transactions': valid_transactions,
                'summary': summary,
                'filename': filename
            }
            
            # Salvar automaticamente se solicitado
            if auto_save and valid_transactions:
                transaction_model = Transaction()
                saved_count = 0
                
                for transaction_data in valid_transactions:
                    save_result = transaction_model.create_transaction(transaction_data)
                    if save_result['success']:
                        saved_count += 1
                
                response_data['auto_saved'] = True
                response_data['saved_count'] = saved_count
            
            return jsonify(response_data), 200
            
        finally:
            # Limpar arquivo temporário
            try:
                os.unlink(temp_file_path)
            except:
                pass
                
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@document_processing_bp.route('/documents/save-transactions', methods=['POST'])
@verify_token
def save_extracted_transactions():
    """Salvar transações extraídas após revisão do usuário"""
    try:
        user_data = request.user
        data = request.json
        
        if not data or 'transactions' not in data:
            return jsonify({'error': 'Dados de transações não fornecidos'}), 400
        
        transactions = data['transactions']
        if not isinstance(transactions, list):
            return jsonify({'error': 'Formato de transações inválido'}), 400
        
        transaction_model = Transaction()
        saved_transactions = []
        errors = []
        
        for i, transaction_data in enumerate(transactions):
            # Adicionar user_id
            transaction_data['user_id'] = user_data['uid']
            
            # Validar campos obrigatórios
            required_fields = ['description', 'amount', 'category_id', 'type', 'date', 'context']
            missing_fields = [field for field in required_fields if field not in transaction_data]
            
            if missing_fields:
                errors.append({
                    'index': i,
                    'error': f'Campos obrigatórios faltando: {", ".join(missing_fields)}'
                })
                continue
            
            # Tentar salvar
            result = transaction_model.create_transaction(transaction_data)
            if result['success']:
                saved_transactions.append({
                    'index': i,
                    'transaction_id': result['transaction_id']
                })
            else:
                errors.append({
                    'index': i,
                    'error': result['error']
                })
        
        return jsonify({
            'success': True,
            'saved_count': len(saved_transactions),
            'error_count': len(errors),
            'saved_transactions': saved_transactions,
            'errors': errors
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@document_processing_bp.route('/documents/preview-categories', methods=['POST'])
def preview_auto_categories():
    """Visualizar categorização automática para uma lista de descrições"""
    try:
        data = request.json
        descriptions = data.get('descriptions', [])
        
        if not isinstance(descriptions, list):
            return jsonify({'error': 'Lista de descrições inválida'}), 400
        
        processor = DocumentProcessor()
        categorized = []
        
        for description in descriptions:
            category = processor.auto_categorize(description)
            categorized.append({
                'description': description,
                'suggested_category': category
            })
        
        return jsonify({
            'success': True,
            'categorized_descriptions': categorized
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@document_processing_bp.route('/documents/extract-text', methods=['POST'])
@verify_token
def extract_text_only():
    """Extrair apenas texto de um documento (sem processar transações)"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Tipo de arquivo não suportado'}), 400
        
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file_extension}') as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name
        
        try:
            processor = DocumentProcessor()
            
            if file_extension == 'pdf':
                import PyPDF2
                with open(temp_file_path, 'rb') as pdf_file:
                    pdf_reader = PyPDF2.PdfReader(pdf_file)
                    text = ""
                    for page in pdf_reader.pages:
                        text += page.extract_text() + "\n"
            
            elif file_extension in ['jpg', 'jpeg', 'png']:
                from PIL import Image
                import pytesseract
                image = Image.open(temp_file_path)
                text = pytesseract.image_to_string(image, lang='por')
            
            else:
                return jsonify({'error': 'Extração de texto não suportada para este tipo de arquivo'}), 400
            
            return jsonify({
                'success': True,
                'extracted_text': text,
                'filename': filename
            }), 200
            
        finally:
            try:
                os.unlink(temp_file_path)
            except:
                pass
                
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@document_processing_bp.route('/documents/supported-formats', methods=['GET'])
def get_supported_formats():
    """Retornar formatos de arquivo suportados"""
    return jsonify({
        'success': True,
        'supported_formats': {
            'documents': ['pdf'],
            'images': ['png', 'jpg', 'jpeg'],
            'spreadsheets': ['csv', 'xlsx', 'xls']
        },
        'max_file_size': '10MB',
        'features': {
            'pdf': 'Extração de texto e transações de extratos bancários',
            'images': 'OCR para extrair texto de comprovantes e extratos',
            'spreadsheets': 'Importação de planilhas com dados financeiros'
        }
    }), 200

@document_processing_bp.route('/documents/processing-stats', methods=['GET'])
@verify_token
def get_processing_stats():
    """Obter estatísticas de processamento de documentos do usuário"""
    try:
        user_data = request.user
        
        # Aqui você pode implementar estatísticas baseadas em logs ou banco de dados
        # Por enquanto, retornar dados mock
        
        return jsonify({
            'success': True,
            'stats': {
                'total_documents_processed': 0,
                'total_transactions_extracted': 0,
                'most_common_categories': [],
                'processing_accuracy': 0.95,
                'last_processed': None
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

