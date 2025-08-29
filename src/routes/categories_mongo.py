from flask import Blueprint, request, jsonify
from src.models.category_mongo import Category

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        context = request.args.get('context')  # 'personal' or 'business'
        
        filters = {}
        if context:
            filters['context'] = context
        
        categories = Category.find_all(filters)
        return jsonify([c.to_dict() for c in categories])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories', methods=['POST'])
def create_category():
    try:
        data = request.get_json()
        
        category = Category(
            name=data['name'],
            context=data.get('context', 'business'),
            type=data.get('type', 'expense')
        )
        
        category.save()
        return jsonify(category.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories/<category_id>', methods=['PUT'])
def update_category(category_id):
    try:
        category = Category.find_by_id(category_id)
        if not category:
            return jsonify({'error': 'Category not found'}), 404
        
        data = request.get_json()
        
        category.name = data.get('name', category.name)
        category.context = data.get('context', category.context)
        category.type = data.get('type', category.type)
        category.save()
        
        return jsonify(category.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories/<category_id>', methods=['DELETE'])
def delete_category(category_id):
    try:
        category = Category.find_by_id(category_id)
        if not category:
            return jsonify({'error': 'Category not found'}), 404
        
        category.delete()
        return jsonify({'message': 'Category deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

