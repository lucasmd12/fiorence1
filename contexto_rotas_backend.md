# Contexto das Rotas do Backend

Este documento contém o código-fonte de todos os arquivos de rota encontrados em `./src/routes`.

## Rota: `./src/routes/auth.py`
```python
# ARQUIVO CORRIGIDO: src/routes/auth.py

from flask import Blueprint, request, jsonify
# Importamos os modelos e funções que vamos precisar
from models.user_mongo import User
from models.category_mongo import Category  # <-- 1. IMPORTAR O MODELO CATEGORY
from auth import create_user, generate_custom_token, verify_password_and_get_uid, verify_token
import re

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/auth/register-with-username", methods=["POST"])
def register_with_username():
    """Registra um novo usuário e cria suas categorias padrão."""
    try:
        data = request.json
        username = data.get("username")
        password = data.get("password")
        display_name = data.get("display_name", "")

        if not username or not password:
            return jsonify({"error": "Nome de usuário e senha são obrigatórios"}), 400

        if not re.match(r"^[a-zA-Z0-9_.-]+$", username):
            return jsonify({"error": "Nome de usuário inválido. Use apenas letras, números e os caracteres _ . -"}), 400

        if User.find_by_username(username):
            return jsonify({"error": "Este nome de usuário já está em uso"}), 409

        email_ficticio = f"{username.lower()}@contabilidade-rezende.app"
        if User.find_by_email(email_ficticio):
            return jsonify({"error": "Este nome de usuário já está associado a uma conta"}), 409

        firebase_result = create_user(email_ficticio, password, display_name)
        if not firebase_result["success"]:
            return jsonify({"error": firebase_result["error"]}), 400

        user_mongo = User(
            uid=firebase_result["uid"],
            username=username,
            email=email_ficticio,
            display_name=display_name,
            role="user"
        )
        user_mongo.save()

        # 2. CHAMADA PARA CRIAR AS CATEGORIAS PADRÃO PARA O NOVO USUÁRIO
        try:
            Category.seed_default_categories(user_id=firebase_result["uid"])
            print(f"Categorias padrão criadas para o usuário {firebase_result['uid']}")
        except Exception as seed_error:
            # Log do erro, mas não impede o registro do usuário
            print(f"AVISO: Falha ao criar categorias padrão para o usuário {firebase_result['uid']}. Erro: {seed_error}")


        custom_token = generate_custom_token(firebase_result["uid"])

        return jsonify({
            "success": True,
            "message": "Usuário criado com sucesso!",
            "token": custom_token, # O frontend usará isso para logar
            "user": user_mongo.to_dict()
        }), 201

    except Exception as e:
        return jsonify({"error": f"Erro interno no servidor: {e}"}), 500

@auth_bp.route("/auth/username-login", methods=["POST"])
def username_login():
    """Autentica um usuário com nome de usuário e senha."""
    try:
        data = request.json
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "Nome de usuário e senha são obrigatórios"}), 400

        user_mongo = User.find_by_username(username)
        if not user_mongo:
            return jsonify({"error": "Nome de usuário ou senha inválidos"}), 401

        uid = verify_password_and_get_uid(user_mongo.email, password)

        if not uid:
            return jsonify({"error": "Nome de usuário ou senha inválidos"}), 401

        if uid != user_mongo.uid:
             return jsonify({"error": "Inconsistência de dados, contate o suporte"}), 500

        custom_token = generate_custom_token(uid)

        return jsonify({
            "success": True,
            "message": "Login bem-sucedido!",
            "token": custom_token,
            "user": user_mongo.to_dict()
        }), 200

    except Exception as e:
        return jsonify({"error": f"Erro interno no servidor: {e}"}), 500

@auth_bp.route("/auth/profile", methods=["GET"])
@verify_token
def get_profile(current_user_uid):
    """Obtém o perfil do usuário autenticado."""
    user_mongo = User.find_by_uid(current_user_uid)
    if not user_mongo:
        return jsonify({"error": "Usuário não encontrado no banco de dados"}), 404
    
    return jsonify({"success": True, "user": user_mongo.to_dict()}), 200

```

## Rota: `./src/routes/categories_mongo.py`
```python
# ARQUIVO CORRIGIDO E SEGURO: src/routes/categories.py

from flask import Blueprint, request, jsonify
from models.category_mongo import Category
from auth import verify_token # <-- 1. Importar o decorator de verificação

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('/categories', methods=['GET'])
@verify_token # <-- 2. Proteger a rota
def get_categories(current_user_uid): # <-- 3. Receber o UID do usuário
    """Busca apenas as categorias do usuário logado."""
    try:
        context = request.args.get('context')
        
        # 4. Adicionar filtro OBRIGATÓRIO pelo ID do usuário
        filters = {'user_id': current_user_uid}
        if context:
            filters['context'] = context
        
        categories = Category.find_all(filters)
        return jsonify([c.to_dict() for c in categories])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories', methods=['POST'])
@verify_token # <-- 5. Proteger a rota
def create_category(current_user_uid): # <-- 6. Receber o UID
    """Cria uma categoria associada ao usuário logado."""
    try:
        data = request.get_json()
        
        category = Category(
            user_id=current_user_uid, # <-- 7. Associar a categoria ao usuário
            name=data['name'],
            context=data.get('context', 'business'),
            type=data.get('type', 'expense'),
            color=data.get('color', '#3B82F6'),
            icon=data.get('icon', 'folder'),
            emoji=data.get('emoji', '📁')
        )
        
        category.save()
        return jsonify(category.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories/<category_id>', methods=['PUT'])
@verify_token # <-- 8. Proteger a rota
def update_category(current_user_uid, category_id): # <-- 9. Receber ambos os argumentos
    """Atualiza uma categoria, verificando se ela pertence ao usuário logado."""
    try:
        category = Category.find_by_id(category_id)
        if not category:
            return jsonify({'error': 'Category not found'}), 404
        
        # 10. VERIFICAÇÃO DE SEGURANÇA CRUCIAL
        if category.user_id != current_user_uid:
            return jsonify({'error': 'Permission denied'}), 403 # Proibido
        
        data = request.get_json()
        
        category.name = data.get('name', category.name)
        category.context = data.get('context', category.context)
        category.type = data.get('type', category.type)
        category.color = data.get('color', category.color)
        category.icon = data.get('icon', category.icon)
        category.emoji = data.get('emoji', category.emoji)
        category.save()
        
        return jsonify(category.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories/<category_id>', methods=['DELETE'])
@verify_token # <-- 11. Proteger a rota
def delete_category(current_user_uid, category_id): # <-- 12. Receber ambos
    """Deleta uma categoria, verificando se ela pertence ao usuário logado."""
    try:
        category = Category.find_by_id(category_id)
        if not category:
            return jsonify({'error': 'Category not found'}), 404
        
        # 13. VERIFICAÇÃO DE SEGURANÇA CRUCIAL
        if category.user_id != current_user_uid:
            return jsonify({'error': 'Permission denied'}), 403 # Proibido
        
        category.delete()
        return jsonify({'message': 'Category deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# As rotas abaixo são "públicas" e não precisam de token, o que está correto.
# Elas fornecem dados genéricos para o frontend.

@categories_bp.route('/categories/seed', methods=['POST'])
def seed_categories():
    """Endpoint para criar categorias padrão"""
    try:
        # IMPORTANTE: A lógica de `seed_default_categories` precisa ser ajustada
        # para não criar categorias duplicadas e talvez associá-las a um usuário específico se necessário.
        # Por enquanto, mantemos como está.
        count = Category.seed_default_categories()
        return jsonify({
            'success': True,
            'message': f'{count} categorias padrão verificadas/criadas com sucesso!'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories/colors', methods=['GET'])
def get_available_colors():
    """Retorna paleta de cores vibrantes disponíveis"""
    vibrant_colors = [
        '#DC2626', '#EA580C', '#D97706', '#CA8A04', '#65A30D', '#059669',
        '#0891B2', '#0284C7', '#2563EB', '#7C3AED', '#C026D3', '#DB2777',
        '#BE123C', '#92400E', '#374151'
    ]
    return jsonify({'success': True, 'colors': vibrant_colors})

@categories_bp.route('/categories/emojis', methods=['GET'])
def get_available_emojis():
    """Retorna coleção extensa de emojis organizados por categoria"""
    emoji_categories = {
        'financeiro': ['💰', '💳', '💵', '💸', '💎', '🏦', '📊', '📈', '📉', '💹'],
        'casa': ['🏠', '🏡', '🏢', '🏬', '🏭', '🏪', '🛏️', '🛋️', '🚿', '🔌'],
        'transporte': ['🚗', '🚙', '🚐', '🚚', '🛻', '🏍️', '🚲', '🛴', '⛽', '🚏'],
        'alimentacao': ['🍕', '🍔', '🌭', '🥪', '🌮', '🍝', '🍜', '🍱', '☕', '🍺'],
        'compras': ['🛒', '🛍️', '👕', '👔', '👗', '👠', '💄', '📱', '💻', '⌚'],
        'saude': ['🏥', '💊', '🩺', '💉', '🦷', '👓', '🏃', '🧘', '💪', '❤️'],
        'educacao': ['📚', '📖', '✏️', '🖊️', '📝', '🎓', '🎒', '💡', '🔬', '📐'],
        'lazer': ['🎬', '🎮', '🎵', '🎸', '🎨', '📺', '📷', '🎪', '🎭', '🎫'],
        'trabalho': ['💼', '📊', '📈', '📉', '💹', '📋', '📄', '🖥️', '⌨️', '🖨️'],
        'viagem': ['✈️', '🏨', '🗺️', '🧳', '📷', '🎒', '🌍', '🗽', '🏖️', '⛱️'],
        'servicos': ['🔧', '🔨', '🪚', '⚡', '🔌', '🧹', '🧽', '🧴', '🚿', '🔑'],
        'impostos': ['📋', '📄', '📊', '💼', '🏛️', '⚖️', '📝', '✍️', '🎯', '📌']
    }
    return jsonify({
        'success': True,
        'emoji_categories': emoji_categories,
        'total_emojis': sum(len(emojis) for emojis in emoji_categories.values())
    })
```

## Rota: `./src/routes/document_processing.py`
```python
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
```

## Rota: `./src/routes/reports_export.py`
```python
# ARQUIVO CORRIGIDO E SEGURO: src/routes/reports_export.py

from flask import Blueprint, request, jsonify, make_response
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from datetime import datetime
import io
from auth import verify_token
from models.transaction_mongo import Transaction
from models.category_mongo import Category

reports_export_bp = Blueprint('reports_export', __name__)

@reports_export_bp.route('/reports/export-pdf', methods=['GET'])
@verify_token
def export_transactions_pdf(current_user_uid):
    """Exportar transações para PDF - APENAS DO USUÁRIO LOGADO"""
    try:
        context = request.args.get('context', 'business')
        period = request.args.get('period', 'current_month')
        
        # CORREÇÃO: Buscar transações APENAS do usuário logado
        filters = {
            'user_id': current_user_uid,  # FILTRO DE SEGURANÇA OBRIGATÓRIO
            'context': context
        }
        
        transactions = Transaction.find_all(filters)
        
        if not transactions:
            return jsonify({'error': 'Nenhuma transação encontrada'}), 404
        
        # CORREÇÃO: Buscar categorias APENAS do usuário logado
        category_filters = {
            'user_id': current_user_uid,  # FILTRO DE SEGURANÇA OBRIGATÓRIO
            'context': context
        }
        categories = Category.find_all(category_filters)
        category_map = {str(cat._id): cat.name for cat in categories}
        
        # Criar PDF em memória
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        
        # Estilos
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            textColor=colors.HexColor('#1f2937'),
            alignment=1  # Center
        )
        
        # Título do relatório
        context_text = 'Empresarial' if context == 'business' else 'Pessoal'
        title = Paragraph(f"Relatório Financeiro - {context_text}", title_style)
        elements.append(title)
        
        # Data de geração
        date_generated = datetime.now().strftime('%d/%m/%Y às %H:%M')
        date_para = Paragraph(f"Gerado em: {date_generated}", styles['Normal'])
        elements.append(date_para)
        elements.append(Spacer(1, 20))
        
        # Calcular resumo usando objetos Transaction
        total_income = sum(t.amount for t in transactions if t.type == 'income')
        total_expenses = sum(t.amount for t in transactions if t.type == 'expense')
        balance = total_income - total_expenses
        
        # Tabela de resumo
        summary_data = [
            ['RESUMO FINANCEIRO', ''],
            ['Total de Receitas', f"R$ {total_income:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')],
            ['Total de Despesas', f"R$ {total_expenses:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')],
            ['Saldo Líquido', f"R$ {balance:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')],
            ['Total de Transações', str(len(transactions))]
        ]
        
        summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0'))
        ]))
        
        elements.append(summary_table)
        elements.append(Spacer(1, 30))
        
        # Tabela de transações
        transactions_title = Paragraph("DETALHAMENTO DAS TRANSAÇÕES", styles['Heading2'])
        elements.append(transactions_title)
        elements.append(Spacer(1, 12))
        
        # Cabeçalho da tabela
        table_data = [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']]
        
        # Ordenar transações por data (mais recentes primeiro)
        sorted_transactions = sorted(transactions, key=lambda x: x.date, reverse=True)
        
        # Adicionar dados das transações usando objetos Transaction
        for transaction in sorted_transactions:
            date_str = transaction.date.strftime('%d/%m/%Y') if transaction.date else 'N/A'
            category_name = category_map.get(transaction.category_id, 'Sem categoria')
            type_text = 'Receita' if transaction.type == 'income' else 'Despesa'
            
            amount = transaction.amount
            if transaction.type == 'income':
                amount_str = f"+R$ {amount:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
            else:
                amount_str = f"-R$ {amount:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
            
            table_data.append([
                date_str,
                transaction.description[:40] + ('...' if len(transaction.description) > 40 else ''),
                category_name[:20] + ('...' if len(category_name) > 20 else ''),
                type_text,
                amount_str
            ])
        
        # Criar tabela
        transactions_table = Table(table_data, colWidths=[0.8*inch, 2.5*inch, 1.5*inch, 0.8*inch, 1.2*inch])
        transactions_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#374151')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(transactions_table)
        
        doc.build(elements)
        
        buffer.seek(0)
        pdf_data = buffer.getvalue()
        buffer.close()
        
        filename = f"relatorio_financeiro_{context}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        response = make_response(pdf_data)
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
        
    except Exception as e:
        return jsonify({'error': f'Erro ao gerar PDF: {str(e)}'}), 500

@reports_export_bp.route('/reports/export-csv', methods=['GET'])
@verify_token
def export_transactions_csv(current_user_uid):
    """Exportar transações para CSV - APENAS DO USUÁRIO LOGADO"""
    try:
        context = request.args.get('context', 'business')
        
        # CORREÇÃO: Buscar transações APENAS do usuário logado
        filters = {
            'user_id': current_user_uid,  # FILTRO DE SEGURANÇA OBRIGATÓRIO
            'context': context
        }
        
        transactions = Transaction.find_all(filters)
        
        if not transactions:
            return jsonify({'error': 'Nenhuma transação encontrada'}), 404
        
        # CORREÇÃO: Buscar categorias APENAS do usuário logado
        category_filters = {
            'user_id': current_user_uid,  # FILTRO DE SEGURANÇA OBRIGATÓRIO
            'context': context
        }
        categories = Category.find_all(category_filters)
        category_map = {str(cat._id): cat.name for cat in categories}
        
        # Gerar CSV
        import csv
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status'])
        
        # Ordenar transações usando objetos Transaction
        sorted_transactions = sorted(transactions, key=lambda x: x.date, reverse=True)
        
        for transaction in sorted_transactions:
            date_str = transaction.date.strftime('%Y-%m-%d') if transaction.date else 'N/A'
            
            writer.writerow([
                date_str,
                transaction.description,
                category_map.get(transaction.category_id, 'Sem categoria'),
                'Receita' if transaction.type == 'income' else 'Despesa',
                transaction.amount,
                transaction.status or 'pending'
            ])
        
        csv_data = output.getvalue()
        output.close()
        
        filename = f"transacoes_{context}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        response = make_response(csv_data)
        response.headers['Content-Type'] = 'text/csv; charset=utf-8'
        response.headers['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
        
    except Exception as e:
        return jsonify({'error': f'Erro ao gerar CSV: {str(e)}'}), 500
```

## Rota: `./src/routes/transactions_mongo.py`
```python
# ARQUIVO CORRIGIDO E SEGURO: src/routes/transactions.py

from flask import Blueprint, request, jsonify
from models.transaction_mongo import Transaction
from models.category_mongo import Category
from auth import verify_token  # CORREÇÃO: Importar decorator de autenticação
from datetime import datetime, date
import calendar
import re

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/transactions', methods=['GET'])
@verify_token  # CORREÇÃO: Proteger rota com token
def get_transactions(current_user_uid):  # CORREÇÃO: Receber UID do usuário
    """Buscar transações APENAS do usuário logado"""
    try:
        # Parâmetros de filtro existentes
        context = request.args.get('context')
        type_filter = request.args.get('type')
        month = request.args.get('month')
        year = request.args.get('year')
        
        # Parâmetros de filtro avançado
        status_filter = request.args.get('status')
        search_term = request.args.get('search')
        limit = request.args.get('limit', type=int)
        
        # CORREÇÃO: Filtro OBRIGATÓRIO por user_id
        filters = {'user_id': current_user_uid}
        
        if context:
            filters['context'] = context
        if type_filter:
            filters['type'] = type_filter
        if status_filter:
            filters['status'] = status_filter
            
        if search_term:
            # Busca case-insensitive na descrição
            regex = re.compile(re.escape(search_term), re.IGNORECASE)
            filters['description'] = regex

        if month and year:
            start_date = datetime(int(year), int(month), 1)
            end_date = datetime(int(year), int(month) + 1, 1) if int(month) < 12 else datetime(int(year) + 1, 1, 1)
            filters['date'] = {'$gte': start_date, '$lt': end_date}
        
        # Buscar transações com limite
        transactions = Transaction.find_all(filters, limit=limit)
        
        return jsonify([t.to_dict() for t in transactions])
    except Exception as e:
        print(f"Error in get_transactions: {e}")
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions', methods=['POST'])
@verify_token  # CORREÇÃO: Proteger rota com token
def create_transaction(current_user_uid):  # CORREÇÃO: Receber UID
    """Criar transação para o usuário logado"""
    try:
        data = request.get_json()
        print(f"Received data: {data}")
        
        # CORREÇÃO: Adicionar user_id automaticamente
        data['user_id'] = current_user_uid
        
        transaction_date = datetime.strptime(data['date'], '%Y-%m-%d')
        due_date = None
        if data.get('due_date'):
            due_date = datetime.strptime(data['due_date'], '%Y-%m-%d')
        
        transaction = Transaction(
            user_id=current_user_uid,  # CORREÇÃO: Associar ao usuário logado
            description=data['description'],
            amount=float(data['amount']),
            type=data['type'],
            context=data['context'],
            category_id=data['category_id'],
            date=transaction_date,
            due_date=due_date,
            status=data.get('status', 'pending'),
            is_recurring=data.get('is_recurring', False),
            recurring_day=data.get('recurring_day')
        )
        
        result = transaction.save()
        print(f"Transaction saved successfully: {result._id}")
        
        if transaction.is_recurring and transaction.recurring_day:
            create_next_recurring_transaction(transaction)
        
        return jsonify(transaction.to_dict()), 201
    except Exception as e:
        print(f"Error in create_transaction: {e}")
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions/<transaction_id>', methods=['PUT'])
@verify_token  # CORREÇÃO: Proteger rota com token
def update_transaction(current_user_uid, transaction_id):  # CORREÇÃO: Receber UID
    """Atualizar transação verificando se pertence ao usuário"""
    try:
        transaction = Transaction.find_by_id(transaction_id)
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        # CORREÇÃO: Verificação de segurança crucial
        if transaction.user_id != current_user_uid:
            return jsonify({'error': 'Permission denied'}), 403
        
        data = request.get_json()
        
        transaction.description = data.get('description', transaction.description)
        transaction.amount = float(data.get('amount', transaction.amount))
        transaction.type = data.get('type', transaction.type)
        transaction.context = data.get('context', transaction.context)
        transaction.category_id = data.get('category_id', transaction.category_id)
        transaction.status = data.get('status', transaction.status)
        
        if data.get('date'):
            transaction.date = datetime.strptime(data['date'], '%Y-%m-%d')
        if data.get('due_date'):
            transaction.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d')
        
        transaction.updated_at = datetime.utcnow()
        transaction.save()
        
        return jsonify(transaction.to_dict())
    except Exception as e:
        print(f"Error in update_transaction: {e}")
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions/<transaction_id>', methods=['DELETE'])
@verify_token  # CORREÇÃO: Proteger rota com token
def delete_transaction(current_user_uid, transaction_id):  # CORREÇÃO: Receber UID
    """Deletar transação verificando se pertence ao usuário"""
    try:
        transaction = Transaction.find_by_id(transaction_id)
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        # CORREÇÃO: Verificação de segurança crucial
        if transaction.user_id != current_user_uid:
            return jsonify({'error': 'Permission denied'}), 403
        
        transaction.delete()
        return jsonify({'message': 'Transaction deleted successfully'})
    except Exception as e:
        print(f"Error in delete_transaction: {e}")
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/dashboard/summary', methods=['GET'])
@verify_token  # CORREÇÃO: Proteger rota com token
def get_dashboard_summary(current_user_uid):  # CORREÇÃO: Receber UID
    """Resumo do dashboard APENAS do usuário logado"""
    try:
        context = request.args.get('context', 'business')
        current_month = datetime.now().month
        current_year = datetime.now().year
        
        # CORREÇÃO: Filtro obrigatório por user_id
        filters = {
            'user_id': current_user_uid,  # SEGURANÇA: Apenas dados do usuário
            'context': context,
            'date': {
                '$gte': datetime(current_year, current_month, 1),
                '$lt': datetime(current_year, current_month + 1, 1) if current_month < 12 else datetime(current_year + 1, 1, 1)
            }
        }
        
        month_transactions = Transaction.find_all(filters)
        
        total_income = sum(t.amount for t in month_transactions if t.type == 'income')
        total_expenses = sum(t.amount for t in month_transactions if t.type == 'expense')
        balance = total_income - total_expenses
        
        # CORREÇÃO: Filtros para pagamentos e recebimentos com user_id
        pending_filters = {
            'user_id': current_user_uid,
            'context': context, 
            'type': 'expense', 
            'status': 'pending'
        }
        pending_payments = len(Transaction.find_all(pending_filters))
        
        receivable_filters = {
            'user_id': current_user_uid,
            'context': context, 
            'type': 'income', 
            'status': 'pending'
        }
        upcoming_receivables = len(Transaction.find_all(receivable_filters))
        
        return jsonify({
            'balance': balance,
            'total_income': total_income,
            'total_expenses': total_expenses,
            'pending_payments': pending_payments,
            'upcoming_receivables': upcoming_receivables,
            'month': current_month,
            'year': current_year
        })
    except Exception as e:
        print(f"Error in get_dashboard_summary: {e}")
        return jsonify({'error': str(e)}), 500

def create_next_recurring_transaction(original_transaction):
    """Criar próxima transação recorrente mantendo o user_id"""
    try:
        today = date.today()
        next_month = today.month + 1 if today.month < 12 else 1
        next_year = today.year if today.month < 12 else today.year + 1
        
        last_day = calendar.monthrange(next_year, next_month)[1]
        next_day = min(original_transaction.recurring_day, last_day)
        next_due_date = datetime(next_year, next_month, next_day)
        
        # CORREÇÃO: Incluir user_id na busca por transações existentes
        filters = {
            'user_id': original_transaction.user_id,  # SEGURANÇA
            'description': original_transaction.description,
            'context': original_transaction.context,
            'is_recurring': True,
            'date': {
                '$gte': datetime(next_year, next_month, 1),
                '$lt': datetime(next_year, next_month + 1, 1) if next_month < 12 else datetime(next_year + 1, 1, 1)
            }
        }
        
        existing = Transaction.find_all(filters)
        
        if not existing:
            next_transaction = Transaction(
                user_id=original_transaction.user_id,  # CORREÇÃO: Manter user_id
                description=original_transaction.description,
                amount=original_transaction.amount,
                type=original_transaction.type,
                context=original_transaction.context,
                category_id=original_transaction.category_id,
                date=next_due_date,
                due_date=next_due_date,
                status='pending',
                is_recurring=True,
                recurring_day=original_transaction.recurring_day
            )
            
            next_transaction.save()
            print(f"Next recurring transaction created: {next_transaction._id}")
    except Exception as e:
        print(f"Error creating recurring transaction: {e}")

# CORREÇÃO: Nova rota para corrigir a rota seed que estava duplicada
@transactions_bp.route('/categories/seed', methods=['POST'])
@verify_token
def seed_categories_for_user(current_user_uid):
    """Criar categorias padrão para o usuário logado"""
    try:
        count = Category.seed_default_categories(user_id=current_user_uid)
        return jsonify({
            'success': True,
            'message': f'{count} categorias padrão verificadas/criadas com sucesso!'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

## Rota: `./src/routes/upload.py`
```python
from flask import Blueprint, request, jsonify
from src.services.cloudinary_service import CloudinaryService
from src.models.transaction_mongo import Transaction
from datetime import datetime
import json

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload/document', methods=['POST'])
def upload_document():
    """Upload de documentos (extratos bancários, comprovantes, etc.)"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        # Metadados opcionais
        context = request.form.get('context', 'business')
        description = request.form.get('description', '')
        document_type = request.form.get('type', 'extract')  # extract, receipt, invoice, etc.
        
        # Upload para Cloudinary
        upload_result = CloudinaryService.upload_file(
            file,
            folder=f"documents/{context}/{document_type}",
            resource_type="auto"
        )
        
        if not upload_result['success']:
            return jsonify({'error': upload_result['error']}), 500
        
        # Salvar informações do documento no MongoDB
        from src.database.mongodb import mongodb
        document_data = {
            'filename': file.filename,
            'original_name': file.filename,
            'cloudinary_url': upload_result['url'],
            'cloudinary_public_id': upload_result['public_id'],
            'file_format': upload_result['format'],
            'file_size': upload_result['bytes'],
            'context': context,
            'description': description,
            'document_type': document_type,
            'uploaded_at': datetime.utcnow(),
            'processed': False
        }
        
        result = mongodb.db.documents.insert_one(document_data)
        document_data['id'] = str(result.inserted_id)
        
        return jsonify({
            'success': True,
            'message': 'Documento enviado com sucesso',
            'document': {
                'id': document_data['id'],
                'filename': document_data['filename'],
                'url': document_data['cloudinary_url'],
                'type': document_data['document_type'],
                'size': document_data['file_size'],
                'uploaded_at': document_data['uploaded_at'].isoformat()
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Erro no upload: {str(e)}'}), 500

@upload_bp.route('/upload/extract', methods=['POST'])
def upload_bank_extract():
    """Upload específico para extratos bancários com processamento automático"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        context = request.form.get('context', 'business')
        
        # Upload para Cloudinary
        upload_result = CloudinaryService.upload_file(
            file,
            folder=f"extracts/{context}",
            resource_type="auto"
        )
        
        if not upload_result['success']:
            return jsonify({'error': upload_result['error']}), 500
        
        # Salvar extrato no MongoDB
        from src.database.mongodb import mongodb
        extract_data = {
            'filename': file.filename,
            'original_name': file.filename,
            'cloudinary_url': upload_result['url'],
            'cloudinary_public_id': upload_result['public_id'],
            'file_format': upload_result['format'],
            'file_size': upload_result['bytes'],
            'context': context,
            'document_type': 'bank_extract',
            'uploaded_at': datetime.utcnow(),
            'processed': False,
            'transactions_extracted': []
        }
        
        result = mongodb.db.bank_extracts.insert_one(extract_data)
        extract_data['id'] = str(result.inserted_id)
        
        # TODO: Aqui você pode adicionar processamento automático do extrato
        # usando OCR ou outras técnicas para extrair transações automaticamente
        
        return jsonify({
            'success': True,
            'message': 'Extrato bancário enviado com sucesso',
            'extract': {
                'id': extract_data['id'],
                'filename': extract_data['filename'],
                'url': extract_data['cloudinary_url'],
                'size': extract_data['file_size'],
                'uploaded_at': extract_data['uploaded_at'].isoformat(),
                'processed': extract_data['processed']
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Erro no upload do extrato: {str(e)}'}), 500

@upload_bp.route('/documents', methods=['GET'])
def get_documents():
    """Lista todos os documentos enviados"""
    try:
        context = request.args.get('context')
        document_type = request.args.get('type')
        
        from src.database.mongodb import mongodb
        query = {}
        if context:
            query['context'] = context
        if document_type:
            query['document_type'] = document_type
        
        documents = []
        for doc in mongodb.db.documents.find(query).sort('uploaded_at', -1):
            documents.append({
                'id': str(doc['_id']),
                'filename': doc.get('filename'),
                'url': doc.get('cloudinary_url'),
                'type': doc.get('document_type'),
                'context': doc.get('context'),
                'description': doc.get('description'),
                'size': doc.get('file_size'),
                'uploaded_at': doc.get('uploaded_at').isoformat() if doc.get('uploaded_at') else None,
                'processed': doc.get('processed', False)
            })
        
        return jsonify(documents)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@upload_bp.route('/extracts', methods=['GET'])
def get_bank_extracts():
    """Lista todos os extratos bancários enviados"""
    try:
        context = request.args.get('context')
        
        from src.database.mongodb import mongodb
        query = {}
        if context:
            query['context'] = context
        
        extracts = []
        for doc in mongodb.db.bank_extracts.find(query).sort('uploaded_at', -1):
            extracts.append({
                'id': str(doc['_id']),
                'filename': doc.get('filename'),
                'url': doc.get('cloudinary_url'),
                'context': doc.get('context'),
                'size': doc.get('file_size'),
                'uploaded_at': doc.get('uploaded_at').isoformat() if doc.get('uploaded_at') else None,
                'processed': doc.get('processed', False),
                'transactions_count': len(doc.get('transactions_extracted', []))
            })
        
        return jsonify(extracts)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

```

## Rota: `./src/routes/user_mongo.py`
```python
from flask import Blueprint, request, jsonify
from src.models.user_mongo import User
import hashlib

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        
        # Verificar se o usuário já existe
        existing_user = User.find_by_email(data['email'])
        if existing_user:
            return jsonify({'error': 'User already exists'}), 400
        
        # Hash da senha (implementação simples)
        password_hash = hashlib.sha256(data['password'].encode()).hexdigest()
        
        user = User(
            username=data['username'],
            email=data['email'],
            password_hash=password_hash
        )
        
        user.save()
        return jsonify(user.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/login', methods=['POST'])
def login_user():
    try:
        data = request.get_json()
        
        user = User.find_by_email(data['email'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Verificar senha
        password_hash = hashlib.sha256(data['password'].encode()).hexdigest()
        if user.password_hash != password_hash:
            return jsonify({'error': 'Invalid password'}), 401
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

```

