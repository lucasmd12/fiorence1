# ARQUIVO CORRIGIDO E SEGURO: src/routes/transactions.py

from flask import Blueprint, request, jsonify
from models.transaction_mongo import Transaction
from models.category_mongo import Category
from auth import verify_token  # CORREÇÃO: Importar decorator de autenticação
from datetime import datetime, date
import calendar
import re

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/transactions', methods=['GET'])
@verify_token  # CORREÇÃO: Proteger rota com token
def get_transactions(current_user_uid):  # CORREÇÃO: Receber UID do usuário
    """Buscar transações APENAS do usuário logado"""
    try:
        # Parâmetros de filtro existentes
        context = request.args.get('context')
        type_filter = request.args.get('type')
        month = request.args.get('month')
        year = request.args.get('year')
        
        # Parâmetros de filtro avançado
        status_filter = request.args.get('status')
        search_term = request.args.get('search')
        limit = request.args.get('limit', type=int)
        
        # CORREÇÃO: Filtro OBRIGATÓRIO por user_id
        filters = {'user_id': current_user_uid}
        
        if context:
            filters['context'] = context
        if type_filter:
            filters['type'] = type_filter
        if status_filter:
            filters['status'] = status_filter
            
        if search_term:
            # Busca case-insensitive na descrição
            regex = re.compile(re.escape(search_term), re.IGNORECASE)
            filters['description'] = regex

        if month and year:
            start_date = datetime(int(year), int(month), 1)
            end_date = datetime(int(year), int(month) + 1, 1) if int(month) < 12 else datetime(int(year) + 1, 1, 1)
            filters['date'] = {'$gte': start_date, '$lt': end_date}
        
        # Buscar transações com limite
        transactions = Transaction.find_all(filters, limit=limit)
        
        return jsonify([t.to_dict() for t in transactions])
    except Exception as e:
        print(f"Error in get_transactions: {e}")
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions', methods=['POST'])
@verify_token  # CORREÇÃO: Proteger rota com token
def create_transaction(current_user_uid):  # CORREÇÃO: Receber UID
    """Criar transação para o usuário logado"""
    try:
        data = request.get_json()
        print(f"Received data: {data}")
        
        # CORREÇÃO: Adicionar user_id automaticamente
        data['user_id'] = current_user_uid
        
        transaction_date = datetime.strptime(data['date'], '%Y-%m-%d')
        due_date = None
        if data.get('due_date'):
            due_date = datetime.strptime(data['due_date'], '%Y-%m-%d')
        
        transaction = Transaction(
            user_id=current_user_uid,  # CORREÇÃO: Associar ao usuário logado
            description=data['description'],
            amount=float(data['amount']),
            type=data['type'],
            context=data['context'],
            category_id=data['category_id'],
            date=transaction_date,
            due_date=due_date,
            status=data.get('status', 'pending'),
            is_recurring=data.get('is_recurring', False),
            recurring_day=data.get('recurring_day')
        )
        
        result = transaction.save()
        print(f"Transaction saved successfully: {result._id}")
        
        if transaction.is_recurring and transaction.recurring_day:
            create_next_recurring_transaction(transaction)
        
        return jsonify(transaction.to_dict()), 201
    except Exception as e:
        print(f"Error in create_transaction: {e}")
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions/<transaction_id>', methods=['PUT'])
@verify_token  # CORREÇÃO: Proteger rota com token
def update_transaction(current_user_uid, transaction_id):  # CORREÇÃO: Receber UID
    """Atualizar transação verificando se pertence ao usuário"""
    try:
        transaction = Transaction.find_by_id(transaction_id)
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        # CORREÇÃO: Verificação de segurança crucial
        if transaction.user_id != current_user_uid:
            return jsonify({'error': 'Permission denied'}), 403
        
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
        print(f"Error in update_transaction: {e}")
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions/<transaction_id>', methods=['DELETE'])
@verify_token  # CORREÇÃO: Proteger rota com token
def delete_transaction(current_user_uid, transaction_id):  # CORREÇÃO: Receber UID
    """Deletar transação verificando se pertence ao usuário"""
    try:
        transaction = Transaction.find_by_id(transaction_id)
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        # CORREÇÃO: Verificação de segurança crucial
        if transaction.user_id != current_user_uid:
            return jsonify({'error': 'Permission denied'}), 403
        
        transaction.delete()
        return jsonify({'message': 'Transaction deleted successfully'})
    except Exception as e:
        print(f"Error in delete_transaction: {e}")
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/dashboard/summary', methods=['GET'])
@verify_token  # CORREÇÃO: Proteger rota com token
def get_dashboard_summary(current_user_uid):  # CORREÇÃO: Receber UID
    """Resumo do dashboard APENAS do usuário logado"""
    try:
        context = request.args.get('context', 'business')
        current_month = datetime.now().month
        current_year = datetime.now().year
        
        # CORREÇÃO: Filtro obrigatório por user_id
        filters = {
            'user_id': current_user_uid,  # SEGURANÇA: Apenas dados do usuário
            'context': context,
            'date': {
                '$gte': datetime(current_year, current_month, 1),
                '$lt': datetime(current_year, current_month + 1, 1) if current_month < 12 else datetime(current_year + 1, 1, 1)
            }
        }
        
        month_transactions = Transaction.find_all(filters)
        
        total_income = sum(t.amount for t in month_transactions if t.type == 'income')
        total_expenses = sum(t.amount for t in month_transactions if t.type == 'expense')
        balance = total_income - total_expenses
        
        # CORREÇÃO: Filtros para pagamentos e recebimentos com user_id
        pending_filters = {
            'user_id': current_user_uid,
            'context': context, 
            'type': 'expense', 
            'status': 'pending'
        }
        pending_payments = len(Transaction.find_all(pending_filters))
        
        receivable_filters = {
            'user_id': current_user_uid,
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
        print(f"Error in get_dashboard_summary: {e}")
        return jsonify({'error': str(e)}), 500

def create_next_recurring_transaction(original_transaction):
    """Criar próxima transação recorrente mantendo o user_id"""
    try:
        today = date.today()
        next_month = today.month + 1 if today.month < 12 else 1
        next_year = today.year if today.month < 12 else today.year + 1
        
        last_day = calendar.monthrange(next_year, next_month)[1]
        next_day = min(original_transaction.recurring_day, last_day)
        next_due_date = datetime(next_year, next_month, next_day)
        
        # CORREÇÃO: Incluir user_id na busca por transações existentes
        filters = {
            'user_id': original_transaction.user_id,  # SEGURANÇA
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
                user_id=original_transaction.user_id,  # CORREÇÃO: Manter user_id
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
            print(f"Next recurring transaction created: {next_transaction._id}")
    except Exception as e:
        print(f"Error creating recurring transaction: {e}")

# CORREÇÃO: Nova rota para corrigir a rota seed que estava duplicada
@transactions_bp.route('/categories/seed', methods=['POST'])
@verify_token
def seed_categories_for_user(current_user_uid):
    """Criar categorias padrão para o usuário logado"""
    try:
        count = Category.seed_default_categories(user_id=current_user_uid)
        return jsonify({
            'success': True,
            'message': f'{count} categorias padrão verificadas/criadas com sucesso!'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
