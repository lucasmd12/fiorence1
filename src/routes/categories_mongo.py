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
