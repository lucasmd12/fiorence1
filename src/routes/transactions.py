from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.transaction import Transaction
from src.models.category import Category
from datetime import datetime, date
import calendar

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/transactions', methods=['GET'])
def get_transactions():
    try:
        context = request.args.get('context')  # 'personal' or 'business'
        type_filter = request.args.get('type')  # 'income' or 'expense'
        month = request.args.get('month')
        year = request.args.get('year')
        
        query = Transaction.query
        
        if context:
            query = query.filter(Transaction.context == context)
        if type_filter:
            query = query.filter(Transaction.type == type_filter)
        if month and year:
            query = query.filter(
                db.extract('month', Transaction.date) == int(month),
                db.extract('year', Transaction.date) == int(year)
            )
        
        transactions = query.order_by(Transaction.date.desc()).all()
        return jsonify([t.to_dict() for t in transactions])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions', methods=['POST'])
def create_transaction():
    try:
        data = request.get_json()
        
        # Parse date
        transaction_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        due_date = None
        if data.get('due_date'):
            due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
        
        transaction = Transaction(
            description=data['description'],
            amount=float(data['amount']),
            type=data['type'],
            context=data['context'],
            category_id=int(data['category_id']),
            date=transaction_date,
            due_date=due_date,
            status=data.get('status', 'pending'),
            is_recurring=data.get('is_recurring', False),
            recurring_day=data.get('recurring_day')
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        # If recurring, create next month's transaction
        if transaction.is_recurring and transaction.recurring_day:
            create_next_recurring_transaction(transaction)
        
        return jsonify(transaction.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    try:
        transaction = Transaction.query.get_or_404(transaction_id)
        data = request.get_json()
        
        transaction.description = data.get('description', transaction.description)
        transaction.amount = float(data.get('amount', transaction.amount))
        transaction.type = data.get('type', transaction.type)
        transaction.context = data.get('context', transaction.context)
        transaction.category_id = int(data.get('category_id', transaction.category_id))
        transaction.status = data.get('status', transaction.status)
        
        if data.get('date'):
            transaction.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        if data.get('due_date'):
            transaction.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
        
        transaction.updated_at = datetime.utcnow()
        
        db.session.commit()
        return jsonify(transaction.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    try:
        transaction = Transaction.query.get_or_404(transaction_id)
        db.session.delete(transaction)
        db.session.commit()
        return jsonify({'message': 'Transaction deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/dashboard/summary', methods=['GET'])
def get_dashboard_summary():
    try:
        context = request.args.get('context', 'business')
        current_month = datetime.now().month
        current_year = datetime.now().year
        
        # Current month transactions
        month_transactions = Transaction.query.filter(
            Transaction.context == context,
            db.extract('month', Transaction.date) == current_month,
            db.extract('year', Transaction.date) == current_year
        ).all()
        
        # Calculate totals
        total_income = sum(t.amount for t in month_transactions if t.type == 'income')
        total_expenses = sum(t.amount for t in month_transactions if t.type == 'expense')
        balance = total_income - total_expenses
        
        # Pending payments
        pending_payments = Transaction.query.filter(
            Transaction.context == context,
            Transaction.type == 'expense',
            Transaction.status == 'pending'
        ).count()
        
        # Upcoming receivables
        upcoming_receivables = Transaction.query.filter(
            Transaction.context == context,
            Transaction.type == 'income',
            Transaction.status == 'pending'
        ).count()
        
        return jsonify({
            'balance': balance,
            'total_income': total_income,
            'total_expenses': total_expenses,
            'pending_payments': pending_payments,
            'upcoming_receivables': upcoming_receivables,
            'month': current_month,
            'year': current_year
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def create_next_recurring_transaction(original_transaction):
    """Create next month's recurring transaction"""
    try:
        today = date.today()
        next_month = today.month + 1 if today.month < 12 else 1
        next_year = today.year if today.month < 12 else today.year + 1
        
        # Calculate next due date
        last_day = calendar.monthrange(next_year, next_month)[1]
        next_day = min(original_transaction.recurring_day, last_day)
        next_due_date = date(next_year, next_month, next_day)
        
        # Check if transaction already exists for next month
        existing = Transaction.query.filter(
            Transaction.description == original_transaction.description,
            Transaction.context == original_transaction.context,
            Transaction.is_recurring == True,
            db.extract('month', Transaction.due_date) == next_month,
            db.extract('year', Transaction.due_date) == next_year
        ).first()
        
        if not existing:
            next_transaction = Transaction(
                description=original_transaction.description,
                amount=original_transaction.amount,
                type=original_transaction.type,
                context=original_transaction.context,
                category_id=original_transaction.category_id,
                date=next_due_date,
                due_date=next_due_date,
                status='pending',
                is_recurring=True,
                recurring_day=original_transaction.recurring_day
            )
            
            db.session.add(next_transaction)
            db.session.commit()
    except Exception as e:
        print(f"Error creating recurring transaction: {e}")
        db.session.rollback()

