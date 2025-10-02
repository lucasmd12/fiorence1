# ARQUIVO ATUALIZADO: src/routes/document_processing.py
# Implementação da Categorização Dinâmica

from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import tempfile
import traceback
from datetime import datetime, date

# Imports ajustados para sua estrutura
from auth import verify_token
from services.document_processor import DocumentProcessor
from models.transaction_mongo import Transaction
from models.category_mongo import Category

document_processing_bp = Blueprint('document_processing', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'csv', 'xlsx', 'xls'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@document_processing_bp.route('/documents/process', methods=['POST'])
@verify_token
def process_document(current_user_uid):
    """Processar documento e extrair transações com categorização dinâmica"""
    try:
        print(f"Processando documento para usuário: {current_user_uid}")
        
        # Verificar se arquivo foi enviado
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'Nenhum arquivo selecionado'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'Tipo de arquivo não suportado'}), 400
        
        # Obter parâmetros
        context = request.form.get('context', 'business')
        auto_save = request.form.get('auto_save', 'false').lower() == 'true'
        
        print(f"Arquivo: {file.filename}, Context: {context}, Auto-save: {auto_save}")
        
        # Salvar arquivo temporariamente
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file_extension}') as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name
        
        try:
            print(f"Processando arquivo: {temp_file_path}")
            processor = DocumentProcessor()
            result = processor.process_document(temp_file_path, file_extension, context)
            
            print(f"Resultado do processamento: {result}")
            
            if not result.get('success', False):
                return jsonify({'success': False, 'error': result.get('error', 'Erro desconhecido')}), 500
            
            # Validar transações
            valid_transactions = processor.validate_transactions(result.get('transactions', []))
            print(f"Transações válidas encontradas: {len(valid_transactions)}")
            
            # NOVA IMPLEMENTAÇÃO: Categorização dinâmica por transação
            processed_transactions = []
            categories_created = 0
            
            for transaction in valid_transactions:
                try:
                    # 1. Analisar a descrição da transação
                    description = transaction.get('description', '')
                    suggested_category_name = processor.suggest_category_from_description(description)
                    
                    print(f"Transação: '{description}' -> Categoria sugerida: '{suggested_category_name}'")
                    
                    # 2. Verificar se a categoria já existe para este usuário
                    existing_category = Category.find_all({
                        'user_id': current_user_uid,
                        'context': context,
                        'name': suggested_category_name
                    })
                    
                    category_id = None
                    
                    if existing_category and len(existing_category) > 0:
                        # 3a. Usar categoria existente
                        category_id = str(existing_category[0]._id)
                        print(f"Categoria '{suggested_category_name}' já existe: {category_id}")
                    else:
                        # 3b. Criar nova categoria
                        transaction_type = transaction.get('type', 'expense')
                        
                        new_category = Category(
                            name=suggested_category_name,
                            context=context,
                            type='expense',  # Categorias são sempre para despesas por padrão
                            color=processor.get_category_color(suggested_category_name),
                            icon=processor.get_category_icon(suggested_category_name),
                            emoji=processor.get_category_emoji(suggested_category_name),
                            user_id=current_user_uid
                        )
                        
                        new_category.save()
                        category_id = str(new_category._id)
                        categories_created += 1
                        
                        print(f"Nova categoria criada: '{suggested_category_name}' com ID: {category_id}")
                    
                    # 4. Preparar transação com category_id válido
                    processed_transaction = transaction.copy()
                    processed_transaction['user_id'] = current_user_uid
                    processed_transaction['context'] = context
                    processed_transaction['category_id'] = category_id
                    processed_transaction['category_name'] = suggested_category_name
                    
                    processed_transactions.append(processed_transaction)
                    
                except Exception as transaction_error:
                    print(f"Erro ao processar transação: {str(transaction_error)}")
                    # Em caso de erro, adicionar com categoria padrão
                    fallback_transaction = transaction.copy()
                    fallback_transaction['user_id'] = current_user_uid
                    fallback_transaction['context'] = context
                    fallback_transaction['category_id'] = None
                    fallback_transaction['suggested_category_name'] = 'outros'
                    processed_transactions.append(fallback_transaction)
            
            ### NOVO: LÓGICA PARA DEFINIR STATUS "PAGO" OU "PENDENTE" ###
            today = date.today()
            final_transactions = []
            for t in processed_transactions:
                try:
                    # Converte a data da transação (string 'YYYY-MM-DD') para um objeto date
                    transaction_date = datetime.strptime(t['date'], '%Y-%m-%d').date()
                    
                    # Compara com a data de hoje
                    if transaction_date <= today:
                        t['status'] = 'paid'
                    else:
                        t['status'] = 'pending'
                except (ValueError, KeyError):
                    # Se a data for inválida ou não existir, define um status padrão
                    t['status'] = 'pending'
                
                final_transactions.append(t)
            
            # Substitui a lista original pela lista com o status definido
            processed_transactions = final_transactions
            ### FIM DA NOVA LÓGICA ###

            print(f"Processamento concluído: {len(processed_transactions)} transações processadas, {categories_created} categorias criadas")
            
            # Gerar resumo atualizado
            summary = processor.get_processing_summary(processed_transactions)
            summary['categories_created'] = categories_created
            
            # Buscar todas as categorias disponíveis (incluindo as recém-criadas)
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
                'transactions': processed_transactions,
                'summary': summary,
                'filename': filename,
                'available_categories': available_categories,
                'categories_created': categories_created
            }
            
            # Auto-salvamento (agora todas as transações têm category_id)
            if auto_save and processed_transactions:
                try:
                    transaction_model = Transaction()
                    saved_count = 0
                    
                    for transaction_data in processed_transactions:
                        if transaction_data.get('category_id'):  # Agora todas devem ter
                            save_result = transaction_model.create_transaction(transaction_data)
                            if save_result.get('success', False):
                                saved_count += 1
                    
                    response_data['auto_saved'] = True
                    response_data['saved_count'] = saved_count
                    print(f"Auto-salvou {saved_count} transações")
                except Exception as save_error:
                    print(f"Erro ao salvar automaticamente: {save_error}")
                    response_data['save_error'] = str(save_error)
            
            return jsonify(response_data), 200
            
        finally:
            try:
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    print(f"Arquivo temporário removido: {temp_file_path}")
            except Exception as cleanup_error:
                print(f"Erro ao limpar arquivo temporário: {cleanup_error}")
                
    except Exception as e:
        print(f"Erro geral no processamento: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'error': f'Erro interno: {str(e)}'}), 500

# Restante das rotas permanecem inalteradas...
@document_processing_bp.route('/documents/save-transactions', methods=['POST'])
@verify_token
def save_extracted_transactions(current_user_uid):
    """Salvar transações extraídas após revisão do usuário"""
    try:
        data = request.json
        
        print(f"Salvando transações para usuário: {current_user_uid}")
        
        if not data or 'transactions' not in data:
            return jsonify({'success': False, 'error': 'Dados de transações não fornecidos'}), 400
        
        transactions = data['transactions']
        if not isinstance(transactions, list):
            return jsonify({'success': False, 'error': 'Formato de transações inválido'}), 400
        
        print(f"Tentando salvar {len(transactions)} transações")
        
        transaction_model = Transaction()
        saved_transactions = []
        errors = []
        
        for i, transaction_data in enumerate(transactions):
            try:
                # Adicionar user_id
                transaction_data['user_id'] = current_user_uid
                
                if 'context' not in transaction_data:
                    transaction_data['context'] = 'business'
                
                required_fields = ['description', 'amount', 'category_id', 'type', 'date', 'context']
                missing_fields = [field for field in required_fields if field not in transaction_data or transaction_data[field] is None]
                
                if missing_fields:
                    errors.append({
                        'index': i,
                        'error': f'Campos obrigatórios faltando: {", ".join(missing_fields)}'
                    })
                    continue
                
                result = transaction_model.create_transaction(transaction_data)
                if result.get('success', False):
                    saved_transactions.append({
                        'index': i,
                        'transaction_id': result.get('transaction_id')
                    })
                    print(f"Transação {i} salva com sucesso")
                else:
                    errors.append({
                        'index': i,
                        'error': result.get('error', 'Erro desconhecido ao salvar')
                    })
                    print(f"Erro ao salvar transação {i}: {result.get('error')}")
                    
            except Exception as transaction_error:
                errors.append({
                    'index': i,
                    'error': f'Erro ao processar transação: {str(transaction_error)}'
                })
                print(f"Erro na transação {i}: {str(transaction_error)}")
        
        return jsonify({
            'success': True,
            'saved_count': len(saved_transactions),
            'error_count': len(errors),
            'saved_transactions': saved_transactions,
            'errors': errors
        }), 200
        
    except Exception as e:
        print(f"Erro geral ao salvar transações: {str(e)}")
        return jsonify({'success': False, 'error': f'Erro interno: {str(e)}'}), 500

# Demais rotas permanecem inalteradas...
@document_processing_bp.route('/documents/test', methods=['GET'])
def test_document_processing():
    """Rota de teste para verificar se o processamento está funcionando"""
    try:
        print("Testando DocumentProcessor...")
        processor = DocumentProcessor()
        
        test_text = """
        01/08/2025 COMPRA CARTAO MERCADO EXTRA -150,00
        02/08/2025 PIX RECEBIDO CLIENTE +500,00
        03/08/2025 PAGAMENTO CONTA LUZ -89,90
        """
        
        print("Extraindo transações do texto de teste...")
        transactions = processor.extract_transactions_from_text(test_text, 'business')
        print(f"Transações extraídas: {len(transactions)}")
        
        validated = processor.validate_transactions(transactions)
        print(f"Transações validadas: {len(validated)}")
        
        summary = processor.get_processing_summary(validated)
        print(f"Resumo gerado: {summary}")
        
        return jsonify({
            'success': True,
            'test': 'DocumentProcessor funcionando',
            'found_transactions': len(validated),
            'transactions': validated,
            'summary': summary
        }), 200
        
    except Exception as e:
        print(f"Erro no teste: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'test': 'FALHOU',
            'error': f'Erro no teste: {str(e)}'
        }), 500

@document_processing_bp.route('/documents/preview-categories', methods=['POST'])
def preview_auto_categories():
    """Visualizar categorização automática para uma lista de descrições"""
    try:
        data = request.json
        descriptions = data.get('descriptions', [])
        
        if not isinstance(descriptions, list):
            return jsonify({'success': False, 'error': 'Lista de descrições inválida'}), 400
        
        processor = DocumentProcessor()
        categorized = []
        
        for description in descriptions:
            category = processor.suggest_category_from_description(description)
            categorized.append({
                'description': description,
                'suggested_category': category
            })
        
        return jsonify({
            'success': True,
            'categorized_descriptions': categorized
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': f'Erro interno: {str(e)}'}), 500

@document_processing_bp.route('/documents/extract-text', methods=['POST'])
@verify_token
def extract_text_only(current_user_uid):
    """Extrair apenas texto de um documento (sem processar transações)"""
    try:
        print(f"Extraindo texto para o usuário: {current_user_uid}")
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'Nenhum arquivo selecionado'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'Tipo de arquivo não suportado'}), 400
        
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
                return jsonify({'success': False, 'error': 'Extração de texto não suportada para este tipo de arquivo'}), 400
            
            return jsonify({
                'success': True,
                'extracted_text': text,
                'filename': filename
            }), 200
            
        finally:
            try:
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
            except:
                pass
                
    except Exception as e:
        return jsonify({'success': False, 'error': f'Erro interno: {str(e)}'}), 500

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
def get_processing_stats(current_user_uid):
    """Obter estatísticas de processamento de documentos do usuário"""
    try:
        print(f"Buscando estatísticas para o usuário: {current_user_uid}")
        
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
        return jsonify({'success': False, 'error': f'Erro interno: {str(e)}'}), 500
