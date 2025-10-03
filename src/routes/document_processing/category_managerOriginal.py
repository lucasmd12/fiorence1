# src/routes/modules/document_processing/category_manager.py
# Responsável por: Categorização dinâmica e sugestões de categorias

from flask import request, jsonify
from models.category_mongo import Category

def register_routes(bp):
    """Registra rotas deste módulo no Blueprint"""
    
    @bp.route('/documents/preview-categories', methods=['POST'])
    def preview_auto_categories():
        """Visualizar categorização automática para uma lista de descrições"""
        try:
            data = request.json
            descriptions = data.get('descriptions', [])
            
            if not isinstance(descriptions, list):
                return jsonify({'success': False, 'error': 'Lista de descrições inválida'}), 400
            
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


def process_transaction_categories(transactions, user_id, context, processor):
    """
    Processa categorização dinâmica para lista de transações
    
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