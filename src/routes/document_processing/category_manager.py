# src/routes/modules/document_processing/category_manager.py
# Responsável por: Categorização dinâmica e sugestões de categorias

from flask import request, jsonify
from models.category_mongo import Category
from auth import verify_token  # Adicionada a importação para proteger a nova rota

def register_routes(bp):
    """Registra rotas deste módulo no Blueprint"""
    
    # =================================================================
    # ROTA EXISTENTE (Sem alterações)
    # =================================================================
    @bp.route('/documents/preview-categories', methods=['POST'])
    def preview_auto_categories():
        """Visualizar categorização automática para uma lista de descrições"""
        try:
            data = request.json
            descriptions = data.get('descriptions', [])
            
            if not isinstance(descriptions, list):
                return jsonify({'success': False, 'error': 'Lista de descrições inválida'}), 400
            
            # A importação é feita aqui dentro para evitar dependências circulares
            from services.document_processor import DocumentProcessor
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

    # =================================================================
    # === NOVA ROTA DE DIAGNÓSTICO (A Via Neural para o VoiceCommand) ===
    # =================================================================
    @bp.route('/documents/suggest-category', methods=['POST'])
    @verify_token # Protegemos a rota, pois ela acessa dados do usuário
    def suggest_single_category(current_user_uid):
        """
        Recebe uma descrição e retorna um diagnóstico: usar uma categoria 
        existente ou sugerir a criação de uma nova. NÃO CRIA NADA NO BANCO.
        """
        try:
            data = request.json
            description = data.get('description')
            transaction_type = data.get('type', 'expense')
            context = data.get('context', 'business')

            if not description:
                return jsonify({'success': False, 'error': 'Descrição é obrigatória'}), 400

            # Importamos o processador aqui para evitar dependência circular
            from services.document_processor import DocumentProcessor
            processor = DocumentProcessor()
            
            # 1. OBTÉM O NOME SUGERIDO (O DNA da inteligência)
            suggested_name = processor.suggest_category_from_description(description)

            # 2. VERIFICA O BANCO DE MEMÓRIA (MongoDB) do usuário
            existing_category = Category.find_all({
                'user_id': current_user_uid,
                'context': context,
                'name': suggested_name
            })

            if existing_category and len(existing_category) > 0:
                # 3A. DIAGNÓSTICO: Categoria já existe.
                category = existing_category[0]
                print(f"Diagnóstico para '{description}': Usar categoria existente '{category.name}' (ID: {category._id})")
                return jsonify({
                    'success': True,
                    'suggestion_type': 'existing',
                    'category': category.to_dict() # Retorna os dados completos da categoria
                }), 200
            else:
                # 3B. DIAGNÓSTICO: Categoria não existe.
                print(f"Diagnóstico para '{description}': Sugerir criação da categoria '{suggested_name}'")
                # Monta a "receita" para criar a categoria, mas não a salva.
                suggestion_details = {
                    'name': suggested_name,
                    'type': transaction_type,
                    'context': context,
                    'color': processor.get_category_color(suggested_name),
                    'icon': processor.get_category_icon(suggested_name),
                    'emoji': processor.get_category_emoji(suggested_name)
                }
                return jsonify({
                    'success': True,
                    'suggestion_type': 'new',
                    'category': suggestion_details # Retorna a receita para o frontend decidir o que fazer
                }), 200

        except Exception as e:
            print(f"Erro no diagnóstico de categoria: {e}")
            return jsonify({'success': False, 'error': f'Erro interno: {str(e)}'}), 500


# =================================================================
# FUNÇÃO AUXILIAR EXISTENTE (Sem alterações)
# =================================================================
def process_transaction_categories(transactions, user_id, context, processor):
    """
    Processa categorização dinâmica para lista de transações.
    Esta função continua útil para o processamento de documentos em lote.
    
    Args:
        transactions: Lista de transações
        user_id: ID do usuário
        context: Contexto (business/personal)
        processor: Instância do DocumentProcessor
        
    Returns:
        tuple: (processed_transactions, categories_created_count)
    """
    processed_transactions = []
    categories_created = 0
    
    for transaction in transactions:
        try:
            # Analisar descrição
            description = transaction.get('description', '')
            suggested_category_name = processor.suggest_category_from_description(description)
            
            print(f"Transação: '{description}' -> Categoria sugerida: '{suggested_category_name}'")
            
            # Verificar se categoria existe
            existing_category = Category.find_all({
                'user_id': user_id,
                'context': context,
                'name': suggested_category_name
            })
            
            category_id = None
            
            if existing_category and len(existing_category) > 0:
                # Usar categoria existente
                category_id = str(existing_category[0]._id)
                print(f"Categoria '{suggested_category_name}' já existe: {category_id}")
            else:
                # Criar nova categoria
                new_category = Category(
                    name=suggested_category_name,
                    context=context,
                    type='expense',
                    color=processor.get_category_color(suggested_category_name),
                    icon=processor.get_category_icon(suggested_category_name),
                    emoji=processor.get_category_emoji(suggested_category_name),
                    user_id=user_id
                )
                
                new_category.save()
                category_id = str(new_category._id)
                categories_created += 1
                
                print(f"Nova categoria criada: '{suggested_category_name}' com ID: {category_id}")
            
            # Preparar transação com category_id
            processed_transaction = transaction.copy()
            processed_transaction['user_id'] = user_id
            processed_transaction['context'] = context
            processed_transaction['category_id'] = category_id
            processed_transaction['category_name'] = suggested_category_name
            
            processed_transactions.append(processed_transaction)
            
        except Exception as transaction_error:
            print(f"Erro ao processar transação: {str(transaction_error)}")
            # Fallback com categoria padrão
            fallback_transaction = transaction.copy()
            fallback_transaction['user_id'] = user_id
            fallback_transaction['context'] = context
            fallback_transaction['category_id'] = None
            fallback_transaction['suggested_category_name'] = 'outros'
            processed_transactions.append(fallback_transaction)
    
    return processed_transactions, categories_created
