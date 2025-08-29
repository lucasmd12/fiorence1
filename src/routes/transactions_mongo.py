from flask import Blueprint, request, jsonify
from src.models.transaction_mongo import Transaction
from src.models.category_mongo import Category
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
        
        filters = {}
        
        if context:
            filters['context'] = context
        if type_filter:
            filters['type'] = type_filter
        if month and year:
            # Filtrar por mês e ano
            start_date = datetime(int(year), int(month), 1)
            if int(month) == 12:
                end_date = datetime(int(year) + 1, 1, 1)
            else:
                end_date = datetime(int(year), int(month) + 1, 1)
            
            filters['date'] = {
                '$gte': start_date,
                '$lt': end_date
            }
        
        transactions = Transaction.find_all(filters)
        return jsonify([t.to_dict() for t in transactions])
    except Exception as e:
        print(f"Error in get_transactions: {e}")  # Debug
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions', methods=['POST'])
def create_transaction():
    try:
        data = request.get_json()
        print(f"Received data: {data}")  # Debug
        
        # Parse date - CORREÇÃO PRINCIPAL: manter como datetime para MongoDB
        transaction_date = datetime.strptime(data['date'], '%Y-%m-%d')
        due_date = None
        if data.get('due_date'):
            due_date = datetime.strptime(data['due_date'], '%Y-%m-%d')
        
        transaction = Transaction(
            description=data['description'],
            amount=float(data['amount']),
            type=data['type'],
            context=data['context'],
            category_id=data['category_id'],  # Já deve vir como string do frontend
            date=transaction_date,
            due_date=due_date,
            status=data.get('status', 'pending'),
            is_recurring=data.get('is_recurring', False),
            recurring_day=data.get('recurring_day')
        )
        
        result = transaction.save()
        print(f"Transaction saved successfully: {result._id}")  # Debug
        
        # If recurring, create next month's transaction
        if transaction.is_recurring and transaction.recurring_day:
            create_next_recurring_transaction(transaction)
        
        return jsonify(transaction.to_dict()), 201
    except Exception as e:
        print(f"Error in create_transaction: {e}")  # Debug
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions/<transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    try:
        transaction = Transaction.find_by_id(transaction_id)
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        data = request.get_json()
        
        transaction.description = data.get('description', transaction.description)
        transaction.amount = float(data.get('amount', transaction.amount))
        transaction.type = data.get('type', transaction.type)
        transaction.context = data.get('context', transaction.context)
        transaction.category_id = data.get('category_id', transaction.category_id)
        transaction.status = data.get('status', transaction.status)
        
        if data.get('date'):
            transaction.date = datetime.strptime(data['date'], '%Y-%m-%d')
        if data.get('due_date'):
            transaction.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d')
        
        transaction.updated_at = datetime.utcnow()
        transaction.save()
        
        return jsonify(transaction.to_dict())
    except Exception as e:
        print(f"Error in update_transaction: {e}")  # Debug
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions/<transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    try:
        transaction = Transaction.find_by_id(transaction_id)
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        transaction.delete()
        return jsonify({'message': 'Transaction deleted successfully'})
    except Exception as e:
        print(f"Error in delete_transaction: {e}")  # Debug
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/dashboard/summary', methods=['GET'])
def get_dashboard_summary():
    try:
        context = request.args.get('context', 'business')
        current_month = datetime.now().month
        current_year = datetime.now().year
        
        # Current month transactions
        filters = {
            'context': context,
            'date': {
                '$gte': datetime(current_year, current_month, 1),
                '$lt': datetime(current_year, current_month + 1, 1) if current_month < 12 else datetime(current_year + 1, 1, 1)
            }
        }
        
        month_transactions = Transaction.find_all(filters)
        
        # Calculate totals
        total_income = sum(t.amount for t in month_transactions if t.type == 'income')
        total_expenses = sum(t.amount for t in month_transactions if t.type == 'expense')
        balance = total_income - total_expenses
        
        # Pending payments
        pending_filters = {
            'context': context,
            'type': 'expense',
            'status': 'pending'
        }
        pending_payments = len(Transaction.find_all(pending_filters))
        
        # Upcoming receivables
        receivable_filters = {
            'context': context,
            'type': 'income',
            'status': 'pending'
        }
        upcoming_receivables = len(Transaction.find_all(receivable_filters))
        
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
        print(f"Error in get_dashboard_summary: {e}")  # Debug
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
        next_due_date = datetime(next_year, next_month, next_day)  # datetime, não date
        
        # Check if transaction already exists for next month
        filters = {
            'description': original_transaction.description,
            'context': original_transaction.context,
            'is_recurring': True,
            'date': {
                '$gte': datetime(next_year, next_month, 1),
                '$lt': datetime(next_year, next_month + 1, 1) if next_month < 12 else datetime(next_year + 1, 1, 1)
            }
        }
        
        existing = Transaction.find_all(filters)
        
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
            
            next_transaction.save()
            print(f"Next recurring transaction created: {next_transaction._id}")  # Debug
    except Exception as e:
        print(f"Error creating recurring transaction: {e}")  # Debug
