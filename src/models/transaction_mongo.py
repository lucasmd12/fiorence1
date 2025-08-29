from datetime import datetime
from bson import ObjectId
from src.database.mongodb import mongodb

class Transaction:
    def __init__(self, description=None, amount=None, type=None, context=None, 
                 category_id=None, date=None, due_date=None, status='pending', 
                 is_recurring=False, recurring_day=None, _id=None):
        self._id = _id
        self.description = description
        self.amount = amount
        self.type = type  # 'income' or 'expense'
        self.context = context  # 'personal' or 'business'
        self.category_id = category_id
        self.date = date
        self.due_date = due_date
        self.status = status
        self.is_recurring = is_recurring
        self.recurring_day = recurring_day
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def save(self):
        """Salva a transação no MongoDB"""
        collection = mongodb.db.transactions
        
        data = {
            'description': self.description,
            'amount': self.amount,
            'type': self.type,
            'context': self.context,
            'category_id': self.category_id,
            'date': self.date,
            'due_date': self.due_date,
            'status': self.status,
            'is_recurring': self.is_recurring,
            'recurring_day': self.recurring_day,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
        
        if self._id:
            # Update existing
            data['updated_at'] = datetime.utcnow()
            collection.update_one({'_id': ObjectId(self._id)}, {'$set': data})
        else:
            # Insert new
            result = collection.insert_one(data)
            self._id = result.inserted_id
        
        return self
    
    @classmethod
    def find_all(cls, filters=None):
        """Busca todas as transações com filtros opcionais"""
        collection = mongodb.db.transactions
        query = filters or {}
        
        transactions = []
        for doc in collection.find(query).sort('date', -1):
            transaction = cls(
                _id=str(doc['_id']),
                description=doc.get('description'),
                amount=doc.get('amount'),
                type=doc.get('type'),
                context=doc.get('context'),
                category_id=doc.get('category_id'),
                date=doc.get('date'),
                due_date=doc.get('due_date'),
                status=doc.get('status'),
                is_recurring=doc.get('is_recurring'),
                recurring_day=doc.get('recurring_day')
            )
            transaction.created_at = doc.get('created_at')
            transaction.updated_at = doc.get('updated_at')
            transactions.append(transaction)
        
        return transactions
    
    @classmethod
    def find_by_id(cls, transaction_id):
        """Busca uma transação por ID"""
        collection = mongodb.db.transactions
        doc = collection.find_one({'_id': ObjectId(transaction_id)})
        
        if doc:
            transaction = cls(
                _id=str(doc['_id']),
                description=doc.get('description'),
                amount=doc.get('amount'),
                type=doc.get('type'),
                context=doc.get('context'),
                category_id=doc.get('category_id'),
                date=doc.get('date'),
                due_date=doc.get('due_date'),
                status=doc.get('status'),
                is_recurring=doc.get('is_recurring'),
                recurring_day=doc.get('recurring_day')
            )
            transaction.created_at = doc.get('created_at')
            transaction.updated_at = doc.get('updated_at')
            return transaction
        
        return None
    
    def delete(self):
        """Remove a transação do MongoDB"""
        if self._id:
            collection = mongodb.db.transactions
            collection.delete_one({'_id': ObjectId(self._id)})
    
    def to_dict(self):
        """Converte a transação para dicionário"""
        # Buscar nome da categoria
        category_name = None
        if self.category_id:
            from src.models.category_mongo import Category
            category = Category.find_by_id(self.category_id)
            if category:
                category_name = category.name
        
        # Função helper para converter datas de forma segura
        def safe_date_format(date_obj):
            if date_obj is None:
                return None
            if isinstance(date_obj, datetime):
                return date_obj.isoformat()
            elif hasattr(date_obj, 'isoformat'):  # date object
                return date_obj.isoformat()
            else:
                return str(date_obj)
        
        return {
            'id': str(self._id) if self._id else None,
            'description': self.description,
            'amount': self.amount,
            'type': self.type,
            'context': self.context,
            'category_id': self.category_id,
            'category_name': category_name,
            'date': safe_date_format(self.date),
            'due_date': safe_date_format(self.due_date),
            'status': self.status,
            'is_recurring': self.is_recurring,
            'recurring_day': self.recurring_day,
            'created_at': safe_date_format(self.created_at),
            'updated_at': safe_date_format(self.updated_at)
        }
