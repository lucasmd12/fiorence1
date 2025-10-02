# ARQUIVO CORRIGIDO E SEGURO: src/models/category_mongo.py

from datetime import datetime
from bson import ObjectId
from database.mongodb import mongodb # Assumindo que a importação está correta

class Category:
    # 1. Adicionado user_id ao construtor
    def __init__(self, name=None, context=None, type=None, color=None, icon=None, emoji=None, user_id=None, _id=None):
        self._id = _id
        self.user_id = user_id # Campo para associar ao usuário
        self.name = name
        self.context = context
        self.type = type
        self.color = color or '#3B82F6'
        self.icon = icon or 'folder'
        self.emoji = emoji or '📁'
        self.created_at = datetime.utcnow()
    
    def save(self):
        """Salva a categoria no MongoDB"""
        collection = mongodb.db.categories
        
        data = {
            'user_id': self.user_id, # 2. Incluído user_id nos dados a serem salvos
            'name': self.name,
            'context': self.context,
            'type': self.type,
            'color': self.color,
            'icon': self.icon,
            'emoji': self.emoji,
            'created_at': self.created_at
        }
        
        if self._id:
            collection.update_one({'_id': ObjectId(self._id)}, {'$set': data})
        else:
            result = collection.insert_one(data)
            self._id = result.inserted_id
        
        return self
    
    @classmethod
    def find_all(cls, filters=None):
        """Busca todas as categorias com filtros opcionais"""
        collection = mongodb.db.categories
        query = filters or {}
        
        categories = []
        for doc in collection.find(query).sort('name', 1):
            category = cls(
                _id=str(doc['_id']),
                user_id=doc.get('user_id'), # 3. Carregado o user_id do banco
                name=doc.get('name'),
                context=doc.get('context'),
                type=doc.get('type'),
                color=doc.get('color', '#3B82F6'),
                icon=doc.get('icon', 'folder'),
                emoji=doc.get('emoji', '📁')
            )
            category.created_at = doc.get('created_at')
            categories.append(category)
        
        return categories
    
    @classmethod
    def find_by_id(cls, category_id):
        """Busca uma categoria por ID"""
        collection = mongodb.db.categories
        doc = None
        try:
            doc = collection.find_one({'_id': ObjectId(category_id)})
        except:
            doc = None
        
        if doc:
            category = cls(
                _id=str(doc['_id']),
                user_id=doc.get('user_id'), # 4. Carregado o user_id do banco
                name=doc.get('name'),
                context=doc.get('context'),
                type=doc.get('type'),
                color=doc.get('color', '#3B82F6'),
                icon=doc.get('icon', 'folder'),
                emoji=doc.get('emoji', '📁')
            )
            # Preservar o user_id que está no documento do banco
            category.user_id = doc.get('user_id')
            category.created_at = doc.get('created_at')
            return category
        
        return None
    
    def delete(self):
        """Remove a categoria do MongoDB"""
        if self._id:
            collection = mongodb.db.categories
            collection.delete_one({'_id': ObjectId(self._id)})
    
    def to_dict(self):
        """Converte a categoria para dicionário"""
        return {
            'id': str(self._id) if self._id else None,
            'user_id': self.user_id, # 5. Adicionado user_id ao dicionário de retorno
            'name': self.name,
            'context': self.context,
            'type': self.type,
            'color': self.color,
            'icon': self.icon,
            'emoji': self.emoji,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @classmethod
    def seed_default_categories(cls, user_id): # 6. Modificado para aceitar um user_id
        """Cria categorias padrão para um usuário específico se não existirem"""
        collection = mongodb.db.categories
        
        default_categories = [
            {'name': 'Salários', 'context': 'business', 'type': 'expense', 'color': '#DC2626', 'emoji': '💼', 'icon': 'briefcase'},
            {'name': 'Aluguel', 'context': 'business', 'type': 'expense', 'color': '#7C2D12', 'emoji': '🏢', 'icon': 'building'},
            {'name': 'Combustível', 'context': 'business', 'type': 'expense', 'color': '#EA580C', 'emoji': '⛽', 'icon': 'fuel'},
            {'name': 'Impostos', 'context': 'business', 'type': 'expense', 'color': '#B91C1C', 'emoji': '📋', 'icon': 'receipt'},
            {'name': 'Manutenção', 'context': 'business', 'type': 'expense', 'color': '#92400E', 'emoji': '🔧', 'icon': 'wrench'},
            {'name': 'Fornecedores', 'context': 'business', 'type': 'expense', 'color': '#7C3AED', 'emoji': '🛍️', 'icon': 'shopping-cart'},
            {'name': 'Vendas', 'context': 'business', 'type': 'income', 'color': '#059669', 'emoji': '💰', 'icon': 'dollar-sign'},
            {'name': 'Serviços', 'context': 'business', 'type': 'income', 'color': '#0D9488', 'emoji': '🛠️', 'icon': 'wrench'},
            {'name': 'Receitas Diversas', 'context': 'business', 'type': 'income', 'color': '#047857', 'emoji': '📈', 'icon': 'trending-up'},
        ]
        
        count = 0
        for cat_data in default_categories:
            # Verifica se a categoria já existe PARA ESTE USUÁRIO
            existing = collection.find_one({
                'user_id': user_id,
                'name': cat_data['name'], 
                'context': cat_data['context']
            })
            if not existing:
                cat_data['user_id'] = user_id # Associa ao usuário
                cat_data['created_at'] = datetime.utcnow()
                collection.insert_one(cat_data)
                count += 1
        
        return count
