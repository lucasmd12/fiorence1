import re
import PyPDF2
import pandas as pd
from datetime import datetime
import io
import requests
from PIL import Image
import pytesseract
import json

class DocumentProcessor:
    def __init__(self):
        self.transaction_patterns = {
            'date': [
                r'(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})',  # dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy
                r'(\d{2,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})',  # yyyy/mm/dd, yyyy-mm-dd
            ],
            'amount': [
                r'R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)',  # R$ 1.000,00
                r'(\d{1,3}(?:\.\d{3})*(?:,\d{2}))',         # 1.000,00
                r'(\d+,\d{2})',                              # 100,50
                r'(\d+\.\d{2})',                             # 100.50
            ],
            'negative_indicators': [
                'débito', 'saque', 'pagamento', 'transferência enviada', 'compra',
                'taxa', 'tarifa', 'anuidade', 'juros', 'multa', 'desconto',
                'pix enviado', 'ted enviada', 'doc enviado'
            ],
            'positive_indicators': [
                'crédito', 'depósito', 'transferência recebida', 'pix recebido',
                'ted recebida', 'doc recebido', 'salário', 'rendimento',
                'estorno', 'reembolso'
            ],
            'merchant_patterns': [
                r'(?:em|para|de)\s+([A-Z\s]+?)(?:\s+\d|\s*$)',  # EM POSTO SHELL
                r'([A-Z][A-Z\s]{3,}?)(?:\s+\d|\s*$)',          # MERCADO EXTRA
                r'(\w+\s+\w+)(?:\s+\d|\s*$)',                  # Posto Shell
            ]
        }
        
        # Categorias automáticas baseadas em palavras-chave
        self.auto_categories = {
            'alimentação': [
                'mercado', 'supermercado', 'padaria', 'restaurante', 'lanchonete',
                'pizzaria', 'hamburgueria', 'açougue', 'hortifruti', 'extra',
                'carrefour', 'pão de açúcar', 'big', 'walmart'
            ],
            'combustível': [
                'posto', 'shell', 'petrobras', 'ipiranga', 'ale', 'br',
                'combustível', 'gasolina', 'etanol', 'diesel'
            ],
            'transporte': [
                'uber', 'taxi', '99', 'cabify', 'ônibus', 'metrô', 'trem',
                'estacionamento', 'pedágio', 'vlt', 'brt'
            ],
            'saúde': [
                'farmácia', 'drogaria', 'hospital', 'clínica', 'laboratório',
                'médico', 'dentista', 'fisioterapeuta', 'psicólogo'
            ],
            'educação': [
                'escola', 'faculdade', 'universidade', 'curso', 'livro',
                'material escolar', 'mensalidade'
            ],
            'lazer': [
                'cinema', 'teatro', 'show', 'festa', 'bar', 'balada',
                'viagem', 'hotel', 'pousada', 'turismo'
            ],
            'casa': [
                'aluguel', 'condomínio', 'luz', 'energia', 'água', 'gás',
                'internet', 'telefone', 'tv', 'streaming', 'netflix'
            ],
            'vestuário': [
                'loja', 'roupa', 'calçado', 'sapato', 'tênis', 'camisa',
                'calça', 'vestido', 'shopping'
            ]
        }

    def process_document(self, file_path, file_type, context='business'):
        """Processar documento e extrair transações"""
        try:
            if file_type.lower() == 'pdf':
                return self.process_pdf(file_path, context)
            elif file_type.lower() in ['jpg', 'jpeg', 'png']:
                return self.process_image(file_path, context)
            elif file_type.lower() in ['csv', 'xlsx', 'xls']:
                return self.process_spreadsheet(file_path, context)
            else:
                return {'success': False, 'error': 'Tipo de arquivo não suportado'}
        except Exception as e:
            return {'success': False, 'error': f'Erro ao processar documento: {str(e)}'}

    def process_pdf(self, file_path, context):
        """Processar arquivo PDF"""
        try:
            transactions = []
            
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                full_text = ""
                for page in pdf_reader.pages:
                    full_text += page.extract_text() + "\n"
                
                # Extrair transações do texto
                extracted_transactions = self.extract_transactions_from_text(full_text, context)
                transactions.extend(extracted_transactions)
            
            return {
                'success': True,
                'transactions': transactions,
                'total_found': len(transactions)
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Erro ao processar PDF: {str(e)}'}

    def process_image(self, file_path, context):
        """Processar imagem usando OCR"""
        try:
            # Usar OCR para extrair texto da imagem
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image, lang='por')
            
            # Extrair transações do texto
            transactions = self.extract_transactions_from_text(text, context)
            
            return {
                'success': True,
                'transactions': transactions,
                'total_found': len(transactions),
                'extracted_text': text
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Erro ao processar imagem: {str(e)}'}

    def process_spreadsheet(self, file_path, context):
        """Processar planilha (CSV, Excel)"""
        try:
            transactions = []
            
            # Tentar ler como Excel primeiro, depois CSV
            try:
                df = pd.read_excel(file_path)
            except:
                df = pd.read_csv(file_path, encoding='utf-8')
            
            # Identificar colunas relevantes
            columns = df.columns.str.lower()
            
            date_col = None
            amount_col = None
            description_col = None
            
            # Procurar colunas de data
            for col in columns:
                if any(word in col for word in ['data', 'date', 'dt']):
                    date_col = df.columns[columns.get_loc(col)]
                    break
            
            # Procurar colunas de valor
            for col in columns:
                if any(word in col for word in ['valor', 'amount', 'quantia', 'total']):
                    amount_col = df.columns[columns.get_loc(col)]
                    break
            
            # Procurar colunas de descrição
            for col in columns:
                if any(word in col for word in ['descrição', 'description', 'histórico', 'memo']):
                    description_col = df.columns[columns.get_loc(col)]
                    break
            
            # Processar cada linha
            for _, row in df.iterrows():
                transaction = self.extract_transaction_from_row(
                    row, date_col, amount_col, description_col, context
                )
                if transaction:
                    transactions.append(transaction)
            
            return {
                'success': True,
                'transactions': transactions,
                'total_found': len(transactions)
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Erro ao processar planilha: {str(e)}'}

    def extract_transactions_from_text(self, text, context):
        """Extrair transações de texto livre"""
        transactions = []
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if len(line) < 10:  # Pular linhas muito curtas
                continue
            
            transaction = self.parse_transaction_line(line, context)
            if transaction:
                transactions.append(transaction)
        
        return transactions

    def parse_transaction_line(self, line, context):
        """Analisar uma linha e extrair dados da transação"""
        try:
            # Extrair data
            date = self.extract_date_from_text(line)
            if not date:
                return None
            
            # Extrair valor
            amount = self.extract_amount_from_text(line)
            if not amount:
                return None
            
            # Determinar se é entrada ou saída
            transaction_type = self.determine_transaction_type(line)
            
            # Extrair descrição/comerciante
            description = self.extract_description(line)
            
            # Determinar categoria automaticamente
            category = self.auto_categorize(description)
            
            return {
                'date': date,
                'amount': abs(amount),
                'type': transaction_type,
                'description': description,
                'category': category,
                'context': context,
                'source': 'document_extraction',
                'raw_line': line
            }
            
        except Exception as e:
            print(f"Erro ao analisar linha: {line} - {str(e)}")
            return None

    def extract_transaction_from_row(self, row, date_col, amount_col, description_col, context):
        """Extrair transação de uma linha de planilha"""
        try:
            transaction = {}
            
            # Data
            if date_col and pd.notna(row[date_col]):
                date = self.parse_date(str(row[date_col]))
                if date:
                    transaction['date'] = date
            
            # Valor
            if amount_col and pd.notna(row[amount_col]):
                amount = self.parse_amount(str(row[amount_col]))
                if amount:
                    transaction['amount'] = abs(amount)
                    transaction['type'] = 'expense' if amount < 0 else 'income'
            
            # Descrição
            if description_col and pd.notna(row[description_col]):
                transaction['description'] = str(row[description_col]).strip()
            
            # Só retornar se tiver pelo menos data e valor
            if 'date' in transaction and 'amount' in transaction:
                transaction['context'] = context
                transaction['source'] = 'spreadsheet_extraction'
                
                # Auto-categorizar
                if 'description' in transaction:
                    transaction['category'] = self.auto_categorize(transaction['description'])
                
                return transaction
            
            return None
            
        except Exception as e:
            print(f"Erro ao processar linha da planilha: {str(e)}")
            return None

    def extract_date_from_text(self, text):
        """Extrair data do texto"""
        for pattern in self.transaction_patterns['date']:
            match = re.search(pattern, text)
            if match:
                date_str = match.group(1)
                return self.parse_date(date_str)
        return None

    def parse_date(self, date_str):
        """Converter string de data para formato ISO"""
        try:
            # Tentar diferentes formatos
            formats = [
                '%d/%m/%Y', '%d-%m-%Y', '%d.%m.%Y',
                '%d/%m/%y', '%d-%m-%y', '%d.%m.%y',
                '%Y/%m/%d', '%Y-%m-%d', '%Y.%m.%d',
                '%Y-%m-%d %H:%M:%S'
            ]
            
            for fmt in formats:
                try:
                    date_obj = datetime.strptime(date_str.strip(), fmt)
                    return date_obj.strftime('%Y-%m-%d')
                except ValueError:
                    continue
            
            return None
        except:
            return None

    def extract_amount_from_text(self, text):
        """Extrair valor monetário do texto"""
        for pattern in self.transaction_patterns['amount']:
            match = re.search(pattern, text)
            if match:
                amount_str = match.group(1)
                return self.parse_amount(amount_str)
        return None

    def parse_amount(self, amount_str):
        """Converter string de valor para float"""
        try:
            # Remover símbolos e espaços
            clean_amount = re.sub(r'[R$\s]', '', amount_str)
            
            # Verificar se usa vírgula como decimal
            if ',' in clean_amount and '.' in clean_amount:
                # Formato brasileiro: 1.000,50
                clean_amount = clean_amount.replace('.', '').replace(',', '.')
            elif ',' in clean_amount:
                # Apenas vírgula: 100,50
                clean_amount = clean_amount.replace(',', '.')
            
            return float(clean_amount)
        except:
            return None

    def determine_transaction_type(self, text):
        """Determinar se é entrada ou saída baseado no texto"""
        text_lower = text.lower()
        
        # Verificar indicadores negativos (saída)
        for indicator in self.transaction_patterns['negative_indicators']:
            if indicator in text_lower:
                return 'expense'
        
        # Verificar indicadores positivos (entrada)
        for indicator in self.transaction_patterns['positive_indicators']:
            if indicator in text_lower:
                return 'income'
        
        # Se não encontrar indicadores claros, assumir como despesa
        return 'expense'

    def extract_description(self, text):
        """Extrair descrição/comerciante do texto"""
        # Tentar extrair nome do comerciante
        for pattern in self.transaction_patterns['merchant_patterns']:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                merchant = match.group(1).strip()
                if len(merchant) > 3:
                    return merchant
        
        # Se não encontrar padrão específico, usar a linha inteira limpa
        clean_text = re.sub(r'\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}', '', text)  # Remover datas
        clean_text = re.sub(r'R\$\s*\d+(?:\.\d{3})*(?:,\d{2})?', '', clean_text)  # Remover valores
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()  # Normalizar espaços
        
        return clean_text[:100] if clean_text else 'Transação extraída de documento'

    def auto_categorize(self, description):
        """Categorizar automaticamente baseado na descrição"""
        if not description:
            return 'outros'
        
        description_lower = description.lower()
        
        for category, keywords in self.auto_categories.items():
            for keyword in keywords:
                if keyword in description_lower:
                    return category
        
        return 'outros'

    def validate_transactions(self, transactions):
        """Validar e limpar transações extraídas"""
        valid_transactions = []
        
        for transaction in transactions:
            # Verificar campos obrigatórios
            if not all(key in transaction for key in ['date', 'amount', 'description']):
                continue
            
            # Verificar se a data é válida
            try:
                datetime.strptime(transaction['date'], '%Y-%m-%d')
            except ValueError:
                continue
            
            # Verificar se o valor é positivo
            if transaction['amount'] <= 0:
                continue
            
            # Limitar descrição
            if len(transaction['description']) > 200:
                transaction['description'] = transaction['description'][:200]
            
            valid_transactions.append(transaction)
        
        return valid_transactions

    def get_processing_summary(self, transactions):
        """Gerar resumo do processamento"""
        if not transactions:
            return {
                'total_transactions': 0,
                'total_income': 0,
                'total_expenses': 0,
                'categories': {}
            }
        
        income_transactions = [t for t in transactions if t.get('type') == 'income']
        expense_transactions = [t for t in transactions if t.get('type') == 'expense']
        
        total_income = sum(t['amount'] for t in income_transactions)
        total_expenses = sum(t['amount'] for t in expense_transactions)
        
        # Contar por categoria
        categories = {}
        for transaction in transactions:
            category = transaction.get('category', 'outros')
            if category not in categories:
                categories[category] = {'count': 0, 'total': 0}
            categories[category]['count'] += 1
            categories[category]['total'] += transaction['amount']
        
        return {
            'total_transactions': len(transactions),
            'income_count': len(income_transactions),
            'expense_count': len(expense_transactions),
            'total_income': total_income,
            'total_expenses': total_expenses,
            'net_amount': total_income - total_expenses,
            'categories': categories,
            'date_range': {
                'start': min(t['date'] for t in transactions),
                'end': max(t['date'] for t in transactions)
            }
        }

