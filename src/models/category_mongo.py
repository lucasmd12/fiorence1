from datetime import datetime
from bson import ObjectId
from src.database.mongodb import mongodb

class Category:
    def __init__(self, name=None, context=None, type=None, _id=None):
        self._id = _id
        self.name = name
        self.context = context  # 'personal' or 'business'
        self.type = type  # 'income' or 'expense'
        self.created_at = datetime.utcnow()
    
    def save(self):
        """Salva a categoria no MongoDB"""
        collection = mongodb.db.categories
        
        data = {
            'name': self.name,
            'context': self.context,
            'type': self.type,
            'created_at': self.created_at
        }
        
        if self._id:
            # Update existing
            collection.update_one({'_id': ObjectId(self._id)}, {'$set': data})
        else:
            # Insert new
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
                name=doc.get('name'),
                context=doc.get('context'),
                type=doc.get('type')
            )
            category.created_at = doc.get('created_at')
            categories.append(category)
        
        return categories
    
    @classmethod
    def find_by_id(cls, category_id):
        """Busca uma categoria por ID"""
        collection = mongodb.db.categories
        
        # Se category_id é um número, buscar por esse número como ID
        if isinstance(category_id, (int, str)) and str(category_id).isdigit():
            doc = collection.find_one({'legacy_id': int(category_id)})
            if not doc:
                # Se não encontrar por legacy_id, tentar por ObjectId
                try:
                    doc = collection.find_one({'_id': ObjectId(category_id)})
                except:
                    doc = None
        else:
            try:
                doc = collection.find_one({'_id': ObjectId(category_id)})
            except:
                doc = None
        
        if doc:
            category = cls(
                _id=str(doc['_id']),
                name=doc.get('name'),
                context=doc.get('context'),
                type=doc.get('type')
            )
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
            'name': self.name,
            'context': self.context,
            'type': self.type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @classmethod
    def seed_default_categories(cls):
        """Cria categorias padrão se não existirem"""
        collection = mongodb.db.categories
        
        default_categories = [
            # Categorias de Despesa
            {'name': 'Salários', 'context': 'business', 'type': 'expense', 'legacy_id': 1},
            {'name': 'Aluguel empresa', 'context': 'business', 'type': 'expense', 'legacy_id': 2},
            {'name': 'Combustível - Frota', 'context': 'business', 'type': 'expense', 'legacy_id': 3},
            {'name': 'Impostos', 'context': 'business', 'type': 'expense', 'legacy_id': 4},
            {'name': 'Manutenção Equipamentos', 'context': 'business', 'type': 'expense', 'legacy_id': 5},
            {'name': 'Granado', 'context': 'business', 'type': 'expense', 'legacy_id': 6},
            
            # Categorias de Receita
            {'name': 'Vendas', 'context': 'business', 'type': 'income', 'legacy_id': 7},
            {'name': 'Serviços', 'context': 'business', 'type': 'income', 'legacy_id': 8},
            {'name': 'Receitas Diversas', 'context': 'business', 'type': 'income', 'legacy_id': 9},
        ]
        
        for cat_data in default_categories:
            existing = collection.find_one({'name': cat_data['name'], 'context': cat_data['context']})
            if not existing:
                cat_data['created_at'] = datetime.utcnow()
                collection.insert_one(cat_data)

