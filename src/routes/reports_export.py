# ARQUIVO CORRIGIDO E SEGURO: src/routes/reports_export.py

from flask import Blueprint, request, jsonify, make_response
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from datetime import datetime
import io
from auth import verify_token
from models.transaction_mongo import Transaction
from models.category_mongo import Category

reports_export_bp = Blueprint('reports_export', __name__)

@reports_export_bp.route('/reports/export-pdf', methods=['GET'])
@verify_token
def export_transactions_pdf(current_user_uid):
    """Exportar transações para PDF - APENAS DO USUÁRIO LOGADO"""
    try:
        context = request.args.get('context', 'business')
        period = request.args.get('period', 'current_month')
        
        # CORREÇÃO: Buscar transações APENAS do usuário logado
        filters = {
            'user_id': current_user_uid,  # FILTRO DE SEGURANÇA OBRIGATÓRIO
            'context': context
        }
        
        transactions = Transaction.find_all(filters)
        
        if not transactions:
            return jsonify({'error': 'Nenhuma transação encontrada'}), 404
        
        # CORREÇÃO: Buscar categorias APENAS do usuário logado
        category_filters = {
            'user_id': current_user_uid,  # FILTRO DE SEGURANÇA OBRIGATÓRIO
            'context': context
        }
        categories = Category.find_all(category_filters)
        category_map = {str(cat._id): cat.name for cat in categories}
        
        # Criar PDF em memória
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        
        # Estilos
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            textColor=colors.HexColor('#1f2937'),
            alignment=1  # Center
        )
        
        # Título do relatório
        context_text = 'Empresarial' if context == 'business' else 'Pessoal'
        title = Paragraph(f"Relatório Financeiro - {context_text}", title_style)
        elements.append(title)
        
        # Data de geração
        date_generated = datetime.now().strftime('%d/%m/%Y às %H:%M')
        date_para = Paragraph(f"Gerado em: {date_generated}", styles['Normal'])
        elements.append(date_para)
        elements.append(Spacer(1, 20))
        
        # Calcular resumo usando objetos Transaction
        total_income = sum(t.amount for t in transactions if t.type == 'income')
        total_expenses = sum(t.amount for t in transactions if t.type == 'expense')
        balance = total_income - total_expenses
        
        # Tabela de resumo
        summary_data = [
            ['RESUMO FINANCEIRO', ''],
            ['Total de Receitas', f"R$ {total_income:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')],
            ['Total de Despesas', f"R$ {total_expenses:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')],
            ['Saldo Líquido', f"R$ {balance:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')],
            ['Total de Transações', str(len(transactions))]
        ]
        
        summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0'))
        ]))
        
        elements.append(summary_table)
        elements.append(Spacer(1, 30))
        
        # Tabela de transações
        transactions_title = Paragraph("DETALHAMENTO DAS TRANSAÇÕES", styles['Heading2'])
        elements.append(transactions_title)
        elements.append(Spacer(1, 12))
        
        # Cabeçalho da tabela
        table_data = [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']]
        
        # Ordenar transações por data (mais recentes primeiro)
        sorted_transactions = sorted(transactions, key=lambda x: x.date, reverse=True)
        
        # Adicionar dados das transações usando objetos Transaction
        for transaction in sorted_transactions:
            date_str = transaction.date.strftime('%d/%m/%Y') if transaction.date else 'N/A'
            category_name = category_map.get(transaction.category_id, 'Sem categoria')
            type_text = 'Receita' if transaction.type == 'income' else 'Despesa'
            
            amount = transaction.amount
            if transaction.type == 'income':
                amount_str = f"+R$ {amount:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
            else:
                amount_str = f"-R$ {amount:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
            
            table_data.append([
                date_str,
                transaction.description[:40] + ('...' if len(transaction.description) > 40 else ''),
                category_name[:20] + ('...' if len(category_name) > 20 else ''),
                type_text,
                amount_str
            ])
        
        # Criar tabela
        transactions_table = Table(table_data, colWidths=[0.8*inch, 2.5*inch, 1.5*inch, 0.8*inch, 1.2*inch])
        transactions_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#374151')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(transactions_table)
        
        doc.build(elements)
        
        buffer.seek(0)
        pdf_data = buffer.getvalue()
        buffer.close()
        
        filename = f"relatorio_financeiro_{context}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        response = make_response(pdf_data)
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
        
    except Exception as e:
        return jsonify({'error': f'Erro ao gerar PDF: {str(e)}'}), 500

@reports_export_bp.route('/reports/export-csv', methods=['GET'])
@verify_token
def export_transactions_csv(current_user_uid):
    """Exportar transações para CSV - APENAS DO USUÁRIO LOGADO"""
    try:
        context = request.args.get('context', 'business')
        
        # CORREÇÃO: Buscar transações APENAS do usuário logado
        filters = {
            'user_id': current_user_uid,  # FILTRO DE SEGURANÇA OBRIGATÓRIO
            'context': context
        }
        
        transactions = Transaction.find_all(filters)
        
        if not transactions:
            return jsonify({'error': 'Nenhuma transação encontrada'}), 404
        
        # CORREÇÃO: Buscar categorias APENAS do usuário logado
        category_filters = {
            'user_id': current_user_uid,  # FILTRO DE SEGURANÇA OBRIGATÓRIO
            'context': context
        }
        categories = Category.find_all(category_filters)
        category_map = {str(cat._id): cat.name for cat in categories}
        
        # Gerar CSV
        import csv
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status'])
        
        # Ordenar transações usando objetos Transaction
        sorted_transactions = sorted(transactions, key=lambda x: x.date, reverse=True)
        
        for transaction in sorted_transactions:
            date_str = transaction.date.strftime('%Y-%m-%d') if transaction.date else 'N/A'
            
            writer.writerow([
                date_str,
                transaction.description,
                category_map.get(transaction.category_id, 'Sem categoria'),
                'Receita' if transaction.type == 'income' else 'Despesa',
                transaction.amount,
                transaction.status or 'pending'
            ])
        
        csv_data = output.getvalue()
        output.close()
        
        filename = f"transacoes_{context}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        response = make_response(csv_data)
        response.headers['Content-Type'] = 'text/csv; charset=utf-8'
        response.headers['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
        
    except Exception as e:
        return jsonify({'error': f'Erro ao gerar CSV: {str(e)}'}), 500
