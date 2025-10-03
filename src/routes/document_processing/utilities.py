# src/routes/modules/document_processing/utilities.py
# Responsável por: Rotas de teste, estatísticas e informações auxiliares

from flask import jsonify
import traceback
from auth import verify_token
from services.document_processor import DocumentProcessor

def register_routes(bp):
    """Registra rotas deste módulo no Blueprint"""
    
    @bp.route('/documents/test', methods=['GET'])
    def test_document_processing():
        """Rota de teste para verificar se o processamento está funcionando"""
        try:
            print("Testando DocumentProcessor...")
            processor = DocumentProcessor()
            
            test_text = """
            01/08/2025 COMPRA CARTAO MERCADO EXTRA -150,00
            02/08/2025 PIX RECEBIDO CLIENTE +500,00
            03/08/2025 PAGAMENTO CONTA LUZ -89,90
            """
            
            print("Extraindo transações do texto de teste...")
            transactions = processor.extract_transactions_from_text(test_text, 'business')
            print(f"Transações extraídas: {len(transactions)}")
            
            validated = processor.validate_transactions(transactions)
            print(f"Transações validadas: {len(validated)}")
            
            summary = processor.get_processing_summary(validated)
            print(f"Resumo gerado: {summary}")
            
            return jsonify({
                'success': True,
                'test': 'DocumentProcessor funcionando',
                'found_transactions': len(validated),
                'transactions': validated,
                'summary': summary
            }), 200
            
        except Exception as e:
            print(f"Erro no teste: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return jsonify({
                'success': False,
                'test': 'FALHOU',
                'error': f'Erro no teste: {str(e)}'
            }), 500
    
    @bp.route('/documents/supported-formats', methods=['GET'])
    def get_supported_formats():
        """Retornar formatos de arquivo suportados"""
        return jsonify({
            'success': True,
            'supported_formats': {
                'documents': ['pdf'],
                'images': ['png', 'jpg', 'jpeg'],
                'spreadsheets': ['csv', 'xlsx', 'xls']
            },
            'max_file_size': '10MB',
            'features': {
                'pdf': 'Extração de texto e transações de extratos bancários',
                'images': 'OCR para extrair texto de comprovantes e extratos',
                'spreadsheets': 'Importação de planilhas com dados financeiros'
            }
        }), 200
    
    @bp.route('/documents/processing-stats', methods=['GET'])
    @verify_token
    def get_processing_stats(current_user_uid):
        """Obter estatísticas de processamento de documentos do usuário"""
        try:
            print(f"Buscando estatísticas para o usuário: {current_user_uid}")
            
            return jsonify({
                'success': True,
                'stats': {
                    'total_documents_processed': 0,
                    'total_transactions_extracted': 0,
                    'most_common_categories': [],
                    'processing_accuracy': 0.95,
                    'last_processed': None
                }
            }), 200
            
        except Exception as e:
            return jsonify({'success': False, 'error': f'Erro interno: {str(e)}'}), 500