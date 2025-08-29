from datetime import datetime
from bson import ObjectId
from src.database.mongodb import mongodb

class User:
    def __init__(self, username=None, email=None, password_hash=None, _id=None):
        self._id = _id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def save(self):
        """Salva o usuário no MongoDB"""
        collection = mongodb.db.users
        
        data = {
            'username': self.username,
            'email': self.email,
            'password_hash': self.password_hash,
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
    def find_by_email(cls, email):
        """Busca um usuário por email"""
        collection = mongodb.db.users
        doc = collection.find_one({'email': email})
        
        if doc:
            user = cls(
                _id=str(doc['_id']),
                username=doc.get('username'),
                email=doc.get('email'),
                password_hash=doc.get('password_hash')
            )
            user.created_at = doc.get('created_at')
            user.updated_at = doc.get('updated_at')
            return user
        
        return None
    
    @classmethod
    def find_by_id(cls, user_id):
        """Busca um usuário por ID"""
        collection = mongodb.db.users
        doc = collection.find_one({'_id': ObjectId(user_id)})
        
        if doc:
            user = cls(
                _id=str(doc['_id']),
                username=doc.get('username'),
                email=doc.get('email'),
                password_hash=doc.get('password_hash')
            )
            user.created_at = doc.get('created_at')
            user.updated_at = doc.get('updated_at')
            return user
        
        return None
    
    def to_dict(self):
        """Converte o usuário para dicionário"""
        return {
            'id': str(self._id) if self._id else None,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

