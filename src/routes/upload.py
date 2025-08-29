from flask import Blueprint, request, jsonify
from src.services.cloudinary_service import CloudinaryService
from src.models.transaction_mongo import Transaction
from datetime import datetime
import json

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload/document', methods=['POST'])
def upload_document():
    """Upload de documentos (extratos bancários, comprovantes, etc.)"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        # Metadados opcionais
        context = request.form.get('context', 'business')
        description = request.form.get('description', '')
        document_type = request.form.get('type', 'extract')  # extract, receipt, invoice, etc.
        
        # Upload para Cloudinary
        upload_result = CloudinaryService.upload_file(
            file,
            folder=f"documents/{context}/{document_type}",
            resource_type="auto"
        )
        
        if not upload_result['success']:
            return jsonify({'error': upload_result['error']}), 500
        
        # Salvar informações do documento no MongoDB
        from src.database.mongodb import mongodb
        document_data = {
            'filename': file.filename,
            'original_name': file.filename,
            'cloudinary_url': upload_result['url'],
            'cloudinary_public_id': upload_result['public_id'],
            'file_format': upload_result['format'],
            'file_size': upload_result['bytes'],
            'context': context,
            'description': description,
            'document_type': document_type,
            'uploaded_at': datetime.utcnow(),
            'processed': False
        }
        
        result = mongodb.db.documents.insert_one(document_data)
        document_data['id'] = str(result.inserted_id)
        
        return jsonify({
            'success': True,
            'message': 'Documento enviado com sucesso',
            'document': {
                'id': document_data['id'],
                'filename': document_data['filename'],
                'url': document_data['cloudinary_url'],
                'type': document_data['document_type'],
                'size': document_data['file_size'],
                'uploaded_at': document_data['uploaded_at'].isoformat()
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Erro no upload: {str(e)}'}), 500

@upload_bp.route('/upload/extract', methods=['POST'])
def upload_bank_extract():
    """Upload específico para extratos bancários com processamento automático"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        context = request.form.get('context', 'business')
        
        # Upload para Cloudinary
        upload_result = CloudinaryService.upload_file(
            file,
            folder=f"extracts/{context}",
            resource_type="auto"
        )
        
        if not upload_result['success']:
            return jsonify({'error': upload_result['error']}), 500
        
        # Salvar extrato no MongoDB
        from src.database.mongodb import mongodb
        extract_data = {
            'filename': file.filename,
            'original_name': file.filename,
            'cloudinary_url': upload_result['url'],
            'cloudinary_public_id': upload_result['public_id'],
            'file_format': upload_result['format'],
            'file_size': upload_result['bytes'],
            'context': context,
            'document_type': 'bank_extract',
            'uploaded_at': datetime.utcnow(),
            'processed': False,
            'transactions_extracted': []
        }
        
        result = mongodb.db.bank_extracts.insert_one(extract_data)
        extract_data['id'] = str(result.inserted_id)
        
        # TODO: Aqui você pode adicionar processamento automático do extrato
        # usando OCR ou outras técnicas para extrair transações automaticamente
        
        return jsonify({
            'success': True,
            'message': 'Extrato bancário enviado com sucesso',
            'extract': {
                'id': extract_data['id'],
                'filename': extract_data['filename'],
                'url': extract_data['cloudinary_url'],
                'size': extract_data['file_size'],
                'uploaded_at': extract_data['uploaded_at'].isoformat(),
                'processed': extract_data['processed']
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Erro no upload do extrato: {str(e)}'}), 500

@upload_bp.route('/documents', methods=['GET'])
def get_documents():
    """Lista todos os documentos enviados"""
    try:
        context = request.args.get('context')
        document_type = request.args.get('type')
        
        from src.database.mongodb import mongodb
        query = {}
        if context:
            query['context'] = context
        if document_type:
            query['document_type'] = document_type
        
        documents = []
        for doc in mongodb.db.documents.find(query).sort('uploaded_at', -1):
            documents.append({
                'id': str(doc['_id']),
                'filename': doc.get('filename'),
                'url': doc.get('cloudinary_url'),
                'type': doc.get('document_type'),
                'context': doc.get('context'),
                'description': doc.get('description'),
                'size': doc.get('file_size'),
                'uploaded_at': doc.get('uploaded_at').isoformat() if doc.get('uploaded_at') else None,
                'processed': doc.get('processed', False)
            })
        
        return jsonify(documents)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@upload_bp.route('/extracts', methods=['GET'])
def get_bank_extracts():
    """Lista todos os extratos bancários enviados"""
    try:
        context = request.args.get('context')
        
        from src.database.mongodb import mongodb
        query = {}
        if context:
            query['context'] = context
        
        extracts = []
        for doc in mongodb.db.bank_extracts.find(query).sort('uploaded_at', -1):
            extracts.append({
                'id': str(doc['_id']),
                'filename': doc.get('filename'),
                'url': doc.get('cloudinary_url'),
                'context': doc.get('context'),
                'size': doc.get('file_size'),
                'uploaded_at': doc.get('uploaded_at').isoformat() if doc.get('uploaded_at') else None,
                'processed': doc.get('processed', False),
                'transactions_count': len(doc.get('transactions_extracted', []))
            })
        
        return jsonify(extracts)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

