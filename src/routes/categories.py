from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.category import Category
from datetime import datetime

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        context = request.args.get('context')  # 'personal' or 'business'
        type_filter = request.args.get('type')  # 'income' or 'expense'
        
        query = Category.query.filter(Category.is_active == True)
        
        if context:
            query = query.filter(Category.context == context)
        if type_filter:
            query = query.filter(Category.type == type_filter)
        
        categories = query.order_by(Category.name).all()
        return jsonify([c.to_dict() for c in categories])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories', methods=['POST'])
def create_category():
    try:
        data = request.get_json()
        
        # Check if category already exists
        existing = Category.query.filter(
            Category.name.ilike(data['name']),
            Category.context == data['context'],
            Category.type == data['type']
        ).first()
        
        if existing:
            return jsonify({'error': 'Category already exists'}), 400
        
        category = Category(
            name=data['name'],
            type=data['type'],
            context=data['context'],
            color=data.get('color', '#3B82F6'),
            icon=data.get('icon', 'folder')
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify(category.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    try:
        category = Category.query.get_or_404(category_id)
        data = request.get_json()
        
        category.name = data.get('name', category.name)
        category.color = data.get('color', category.color)
        category.icon = data.get('icon', category.icon)
        category.updated_at = datetime.utcnow()
        
        db.session.commit()
        return jsonify(category.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    try:
        category = Category.query.get_or_404(category_id)
        
        # Check if category has transactions
        from src.models.transaction import Transaction
        has_transactions = Transaction.query.filter(Transaction.category_id == category_id).first()
        
        if has_transactions:
            # Soft delete - mark as inactive
            category.is_active = False
            category.updated_at = datetime.utcnow()
            db.session.commit()
            return jsonify({'message': 'Category deactivated (has transactions)'})
        else:
            # Hard delete
            db.session.delete(category)
            db.session.commit()
            return jsonify({'message': 'Category deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories/seed', methods=['POST'])
def seed_categories():
    """Create initial default categories"""
    try:
        default_categories = [
            # Business Expenses
            {'name': 'Salários', 'type': 'expense', 'context': 'business', 'color': '#EF4444', 'icon': 'users'},
            {'name': 'Combustível - Frota', 'type': 'expense', 'context': 'business', 'color': '#F59E0B', 'icon': 'fuel'},
            {'name': 'Impostos', 'type': 'expense', 'context': 'business', 'color': '#DC2626', 'icon': 'receipt'},
            {'name': 'Manutenção Equipamentos', 'type': 'expense', 'context': 'business', 'color': '#7C3AED', 'icon': 'wrench'},
            {'name': 'Aluguel Escritório', 'type': 'expense', 'context': 'business', 'color': '#059669', 'icon': 'building'},
            
            # Business Income
            {'name': 'Contrato de Vigilância', 'type': 'income', 'context': 'business', 'color': '#10B981', 'icon': 'shield'},
            {'name': 'Serviço de Escolta', 'type': 'income', 'context': 'business', 'color': '#06B6D4', 'icon': 'car'},
            
            # Personal Expenses
            {'name': 'Aluguel Casa', 'type': 'expense', 'context': 'personal', 'color': '#8B5CF6', 'icon': 'home'},
            {'name': 'Supermercado', 'type': 'expense', 'context': 'personal', 'color': '#F59E0B', 'icon': 'shopping-cart'},
            {'name': 'Transporte Pessoal', 'type': 'expense', 'context': 'personal', 'color': '#3B82F6', 'icon': 'car'},
            
            # Personal Income
            {'name': 'Salário', 'type': 'income', 'context': 'personal', 'color': '#10B981', 'icon': 'dollar-sign'},
            {'name': 'Freelance', 'type': 'income', 'context': 'personal', 'color': '#06B6D4', 'icon': 'briefcase'}
        ]
        
        created_count = 0
        for cat_data in default_categories:
            # Check if category already exists
            existing = Category.query.filter(
                Category.name == cat_data['name'],
                Category.context == cat_data['context'],
                Category.type == cat_data['type']
            ).first()
            
            if not existing:
                category = Category(**cat_data)
                db.session.add(category)
                created_count += 1
        
        db.session.commit()
        return jsonify({'message': f'{created_count} categories created successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

