# ARQUIVO: src/models/user_mongo.py (MODIFICADO PARA INTEGRAR COM FIREBASE)

from datetime import datetime
from bson import ObjectId
from src.database.mongodb import mongodb

class User:
    def __init__(self, uid=None, username=None, email=None, display_name=None, role='user', _id=None):
        self._id = _id
        self.uid = uid  # ID do Firebase, nossa chave primária agora
        self.username = username
        self.email = email
        self.display_name = display_name
        self.role = role  # 'user' ou 'admin'
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def save(self):
        """Salva ou atualiza o usuário no MongoDB usando o UID do Firebase como chave."""
        collection = mongodb.db.users
        
        data = {
            'uid': self.uid,
            'username': self.username,
            'email': self.email,
            'display_name': self.display_name,
            'role': self.role,
            'updated_at': datetime.utcnow()
        }
        
        # Usamos 'upsert=True' para criar se não existir, ou atualizar se existir.
        # A busca é feita pelo 'uid' do Firebase.
        collection.update_one(
            {'uid': self.uid},
            {
                '$set': data,
                '$setOnInsert': {'created_at': self.created_at}
            },
            upsert=True
        )
        
        # Para garantir que o objeto tenha o _id do MongoDB após a operação
        if not self._id:
            doc = collection.find_one({'uid': self.uid})
            if doc:
                self._id = doc['_id']

        return self
    
    @classmethod
    def find_by_uid(cls, uid):
        """Busca um usuário pelo UID do Firebase."""
        collection = mongodb.db.users
        doc = collection.find_one({'uid': uid})
        
        if doc:
            return cls(
                _id=doc['_id'],
                uid=doc.get('uid'),
                username=doc.get('username'),
                email=doc.get('email'),
                display_name=doc.get('display_name'),
                role=doc.get('role', 'user')
            )
        return None

    @classmethod
    def find_by_username(cls, username):
        """Busca um usuário pelo nome de usuário (case-insensitive)."""
        collection = mongodb.db.users
        # A flag 'i' no regex torna a busca case-insensitive
        doc = collection.find_one({'username': {'$regex': f'^{username}$', '$options': 'i'}})
        
        if doc:
            return cls(
                _id=doc['_id'],
                uid=doc.get('uid'),
                username=doc.get('username'),
                email=doc.get('email'),
                display_name=doc.get('display_name'),
                role=doc.get('role', 'user')
            )
        return None

    @classmethod
    def find_by_email(cls, email):
        """Busca um usuário pelo email (case-insensitive)."""
        collection = mongodb.db.users
        doc = collection.find_one({'email': {'$regex': f'^{email}$', '$options': 'i'}})
        
        if doc:
            return cls(
                _id=doc['_id'],
                uid=doc.get('uid'),
                username=doc.get('username'),
                email=doc.get('email'),
                display_name=doc.get('display_name'),
                role=doc.get('role', 'user')
            )
        return None

    def to_dict(self):
        """Converte o usuário para dicionário, sem informações sensíveis."""
        return {
            'id': str(self._id) if self._id else None,
            'uid': self.uid,
            'username': self.username,
            'email': self.email,
            'display_name': self.display_name,
            'role': self.role,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else str(self.created_at)
        }

