# src/routes/modules/document_processing/transaction_saver.py
# Responsável por: Salvar transações no banco de dados

from flask import request, jsonify
from auth import verify_token
from models.transaction_mongo import Transaction

def register_routes(bp):
    """Registra rotas deste módulo no Blueprint"""
    
    @bp.route('/documents/save-transactions', methods=['POST'])
    @verify_token
    def save_extracted_transactions(current_user_uid):
        """Salvar transações extraídas após revisão do usuário"""
        try:
            data = request.json
            
            print(f"Salvando transações para usuário: {current_user_uid}")
            
            if not data or 'transactions' not in data:
                return jsonify({'success': False, 'error': 'Dados de transações não fornecidos'}), 400
            
            transactions = data['transactions']
            if not isinstance(transactions, list):
                return jsonify({'success': False, 'error': 'Formato de transações inválido'}), 400
            
            print(f"Tentando salvar {len(transactions)} transações")
            
            # Processar salvamento
            result = save_transactions(transactions, current_user_uid)
            
            return jsonify(result), 200
            
        except Exception as e:
            print(f"Erro geral ao salvar transações: {str(e)}")
            return jsonify({'success': False, 'error': f'Erro interno: {str(e)}'}), 500


def save_transactions(transactions, user_id):
    """
    Salva lista de transações no banco
    
    Returns:
        dict: Resultado do salvamento com contadores
    """
    transaction_model = Transaction()
    saved_transactions = []
    errors = []
    
    for i, transaction_data in enumerate(transactions):
        try:
            # Adicionar user_id
            transaction_data['user_id'] = user_id
            
            if 'context' not in transaction_data:
                transaction_data['context'] = 'business'
            
            # Validar campos obrigatórios
            required_fields = ['description', 'amount', 'category_id', 'type', 'date', 'context']
            missing_fields = [
                field for field in required_fields 
                if field not in transaction_data or transaction_data[field] is None
            ]
            
            if missing_fields:
                errors.append({
                    'index': i,
                    'error': f'Campos obrigatórios faltando: {", ".join(missing_fields)}'
                })
                continue
            
            # Salvar transação
            result = transaction_model.create_transaction(transaction_data)
            if result.get('success', False):
                saved_transactions.append({
                    'index': i,
                    'transaction_id': result.get('transaction_id')
                })
                print(f"Transação {i} salva com sucesso")
            else:
                errors.append({
                    'index': i,
                    'error': result.get('error', 'Erro desconhecido ao salvar')
                })
                print(f"Erro ao salvar transação {i}: {result.get('error')}")
                
        except Exception as transaction_error:
            errors.append({
                'index': i,
                'error': f'Erro ao processar transação: {str(transaction_error)}'
            })
            print(f"Erro na transação {i}: {str(transaction_error)}")
    
    return {
        'success': True,
        'saved_count': len(saved_transactions),
        'error_count': len(errors),
        'saved_transactions': saved_transactions,
        'errors': errors
    }


def auto_save_transactions(transactions, user_id):
    """
    Auto-salva transações processadas
    
    Returns:
        dict: Resultado do auto-salvamento
    """
    try:
        transaction_model = Transaction()
        saved_count = 0
        
        for transaction_data in transactions:
            if transaction_data.get('category_id'):
                result = transaction_model.create_transaction(transaction_data)
                if result.get('success', False):
                    saved_count += 1
        
        print(f"Auto-salvou {saved_count} transações")
        return {
            'auto_saved': True,
            'saved_count': saved_count
        }
    except Exception as save_error:
        print(f"Erro ao salvar automaticamente: {save_error}")
        return {
            'auto_saved': False,
            'save_error': str(save_error)
        }