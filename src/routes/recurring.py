from flask import Blueprint, request, jsonify
from src.auth import verify_token
from src.models.transaction_mongo import Transaction
from datetime import datetime, timedelta
import calendar

recurring_bp = Blueprint('recurring', __name__)

@recurring_bp.route('/recurring/transactions', methods=['POST'])
@verify_token
def create_recurring_transaction():
    """Criar uma nova transação recorrente"""
    try:
        data = request.json
        user_data = request.user
        
        # Validações
        required_fields = ['description', 'amount', 'category_id', 'type', 'context', 'recurring_frequency']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        # Criar transação recorrente
        transaction_data = {
            'description': data['description'],
            'amount': float(data['amount']),
            'category_id': int(data['category_id']),
            'type': data['type'],
            'context': data['context'],
            'user_id': user_data['uid'],
            'recurring': True,
            'recurring_frequency': data['recurring_frequency'],  # 'weekly', 'monthly', 'yearly'
            'recurring_day': int(data.get('recurring_day', 1)),
            'recurring_active': True,
            'next_occurrence': calculate_next_occurrence(
                data['recurring_frequency'], 
                int(data.get('recurring_day', 1))
            ),
            'created_at': datetime.utcnow(),
            'last_generated': None
        }
        
        transaction = Transaction()
        result = transaction.create_recurring_transaction(transaction_data)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'Transação recorrente criada com sucesso',
                'transaction_id': result['transaction_id']
            }), 201
        else:
            return jsonify({'error': result['error']}), 500
            
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@recurring_bp.route('/recurring/transactions', methods=['GET'])
@verify_token
def get_recurring_transactions():
    """Listar transações recorrentes do usuário"""
    try:
        user_data = request.user
        context = request.args.get('context')
        active_only = request.args.get('active_only', 'true').lower() == 'true'
        
        transaction = Transaction()
        result = transaction.get_recurring_transactions(
            user_id=user_data['uid'],
            context=context,
            active_only=active_only
        )
        
        if result['success']:
            return jsonify(result['transactions']), 200
        else:
            return jsonify({'error': result['error']}), 500
            
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@recurring_bp.route('/recurring/transactions/<transaction_id>', methods=['PUT'])
@verify_token
def update_recurring_transaction(transaction_id):
    """Atualizar transação recorrente"""
    try:
        data = request.json
        user_data = request.user
        
        # Campos que podem ser atualizados
        update_data = {}
        updatable_fields = [
            'description', 'amount', 'category_id', 'recurring_frequency', 
            'recurring_day', 'recurring_active'
        ]
        
        for field in updatable_fields:
            if field in data:
                if field == 'amount':
                    update_data[field] = float(data[field])
                elif field == 'category_id' or field == 'recurring_day':
                    update_data[field] = int(data[field])
                else:
                    update_data[field] = data[field]
        
        # Recalcular próxima ocorrência se necessário
        if 'recurring_frequency' in update_data or 'recurring_day' in update_data:
            frequency = update_data.get('recurring_frequency')
            day = update_data.get('recurring_day')
            
            # Se não foram fornecidos, buscar os valores atuais
            if not frequency or not day:
                transaction = Transaction()
                current = transaction.get_recurring_transaction_by_id(transaction_id)
                if current['success']:
                    frequency = frequency or current['transaction']['recurring_frequency']
                    day = day or current['transaction']['recurring_day']
            
            update_data['next_occurrence'] = calculate_next_occurrence(frequency, day)
        
        update_data['updated_at'] = datetime.utcnow()
        
        transaction = Transaction()
        result = transaction.update_recurring_transaction(transaction_id, user_data['uid'], update_data)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'Transação recorrente atualizada com sucesso'
            }), 200
        else:
            return jsonify({'error': result['error']}), 500
            
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@recurring_bp.route('/recurring/transactions/<transaction_id>', methods=['DELETE'])
@verify_token
def delete_recurring_transaction(transaction_id):
    """Deletar transação recorrente"""
    try:
        user_data = request.user
        
        transaction = Transaction()
        result = transaction.delete_recurring_transaction(transaction_id, user_data['uid'])
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'Transação recorrente deletada com sucesso'
            }), 200
        else:
            return jsonify({'error': result['error']}), 500
            
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@recurring_bp.route('/recurring/transactions/<transaction_id>/toggle', methods=['POST'])
@verify_token
def toggle_recurring_transaction(transaction_id):
    """Ativar/desativar transação recorrente"""
    try:
        user_data = request.user
        
        transaction = Transaction()
        result = transaction.toggle_recurring_transaction(transaction_id, user_data['uid'])
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': f'Transação recorrente {"ativada" if result["active"] else "desativada"} com sucesso',
                'active': result['active']
            }), 200
        else:
            return jsonify({'error': result['error']}), 500
            
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@recurring_bp.route('/recurring/process', methods=['POST'])
@verify_token
def process_recurring_transactions():
    """Processar transações recorrentes (gerar transações para datas vencidas)"""
    try:
        user_data = request.user
        
        transaction = Transaction()
        result = transaction.process_recurring_transactions(user_data['uid'])
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': f'{result["processed_count"]} transação(ões) recorrente(s) processada(s)',
                'processed_count': result['processed_count'],
                'generated_transactions': result['generated_transactions']
            }), 200
        else:
            return jsonify({'error': result['error']}), 500
            
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@recurring_bp.route('/recurring/preview', methods=['POST'])
def preview_recurring_schedule():
    """Visualizar cronograma de uma transação recorrente"""
    try:
        data = request.json
        frequency = data.get('recurring_frequency')
        day = int(data.get('recurring_day', 1))
        months_ahead = int(data.get('months_ahead', 12))
        
        if not frequency:
            return jsonify({'error': 'Frequência é obrigatória'}), 400
        
        schedule = generate_recurring_schedule(frequency, day, months_ahead)
        
        return jsonify({
            'success': True,
            'schedule': schedule,
            'total_occurrences': len(schedule)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

def calculate_next_occurrence(frequency, day):
    """Calcular próxima ocorrência de uma transação recorrente"""
    now = datetime.now()
    
    if frequency == 'weekly':
        # day representa o dia da semana (0=segunda, 6=domingo)
        days_ahead = day - now.weekday()
        if days_ahead <= 0:  # Se já passou esta semana
            days_ahead += 7
        return now + timedelta(days=days_ahead)
    
    elif frequency == 'monthly':
        # day representa o dia do mês
        try:
            if now.day <= day:
                # Ainda não passou este mês
                next_date = now.replace(day=day)
            else:
                # Já passou este mês, ir para o próximo
                if now.month == 12:
                    next_date = now.replace(year=now.year + 1, month=1, day=day)
                else:
                    next_date = now.replace(month=now.month + 1, day=day)
            
            return next_date
        except ValueError:
            # Dia não existe no mês (ex: 31 de fevereiro)
            # Usar último dia do mês
            if now.month == 12:
                next_month = 1
                next_year = now.year + 1
            else:
                next_month = now.month + 1
                next_year = now.year
            
            last_day = calendar.monthrange(next_year, next_month)[1]
            return datetime(next_year, next_month, min(day, last_day))
    
    elif frequency == 'yearly':
        # day representa o dia do ano (1-365)
        start_of_year = datetime(now.year, 1, 1)
        target_date = start_of_year + timedelta(days=day - 1)
        
        if target_date <= now:
            # Já passou este ano
            start_of_next_year = datetime(now.year + 1, 1, 1)
            target_date = start_of_next_year + timedelta(days=day - 1)
        
        return target_date
    
    return now + timedelta(days=30)  # Fallback

def generate_recurring_schedule(frequency, day, months_ahead):
    """Gerar cronograma de ocorrências futuras"""
    schedule = []
    current_date = calculate_next_occurrence(frequency, day)
    end_date = datetime.now() + timedelta(days=months_ahead * 30)
    
    while current_date <= end_date and len(schedule) < 50:  # Limite de 50 ocorrências
        schedule.append({
            'date': current_date.isoformat(),
            'formatted_date': current_date.strftime('%d/%m/%Y'),
            'day_of_week': current_date.strftime('%A'),
            'month_year': current_date.strftime('%B %Y')
        })
        
        # Calcular próxima ocorrência
        if frequency == 'weekly':
            current_date += timedelta(weeks=1)
        elif frequency == 'monthly':
            if current_date.month == 12:
                try:
                    current_date = current_date.replace(year=current_date.year + 1, month=1)
                except ValueError:
                    # Dia não existe no próximo mês
                    last_day = calendar.monthrange(current_date.year + 1, 1)[1]
                    current_date = datetime(current_date.year + 1, 1, min(day, last_day))
            else:
                try:
                    current_date = current_date.replace(month=current_date.month + 1)
                except ValueError:
                    # Dia não existe no próximo mês
                    last_day = calendar.monthrange(current_date.year, current_date.month + 1)[1]
                    current_date = datetime(current_date.year, current_date.month + 1, min(day, last_day))
        elif frequency == 'yearly':
            current_date = current_date.replace(year=current_date.year + 1)
    
    return schedule

