from src.models.user import db
from datetime import datetime

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'income' or 'expense'
    context = db.Column(db.String(20), nullable=False)  # 'personal' or 'business'
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    due_date = db.Column(db.Date, nullable=True)  # For scheduled payments
    status = db.Column(db.String(20), default='pending')  # 'pending', 'paid', 'overdue'
    is_recurring = db.Column(db.Boolean, default=False)
    recurring_day = db.Column(db.Integer, nullable=True)  # Day of month for recurring
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    category = db.relationship('Category', backref=db.backref('transactions', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'amount': self.amount,
            'type': self.type,
            'context': self.context,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'date': self.date.isoformat() if self.date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'status': self.status,
            'is_recurring': self.is_recurring,
            'recurring_day': self.recurring_day,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

