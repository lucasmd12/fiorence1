import os
from dotenv import load_dotenv

# A função load_dotenv() é ótima para desenvolvimento local.
# Ela carrega as variáveis de um arquivo chamado ".env" na raiz do projeto.
# No Render, as variáveis são injetadas diretamente, então esta linha não terá efeito lá, o que é perfeito.
load_dotenv()

class Config:
    """
    Classe de configuração centralizada para a aplicação.
    Lê as configurações a partir das variáveis de ambiente.
    """
    
    # Chave secreta para sessões e segurança do Flask/Gunicorn
    SECRET_KEY = os.getenv('SECRET_KEY', 'uma-chave-secreta-padrao-para-desenvolvimento')
    
    # --- Conexões de Banco de Dados e Serviços ---
    
    # URI de conexão para o MongoDB (lida do segredo MONGO_URI no Render)
    MONGO_URI = os.getenv('MONGO_URI')
    
    # URL de conexão para o Redis (lida do segredo REDIS_URL no Render)
    REDIS_URL = os.getenv('REDIS_URL')
    
    # --- Configuração do Cloudinary (para armazenamento de imagens/mídia) ---
    
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')
    
    # --- Configuração do Firebase Admin SDK (Backend) ---
    
    # Esta é a única variável que precisamos para o Firebase no backend.
    # O Render criará a variável de ambiente 'FIREBASE_CREDENTIALS_JSON_PATH'
    # apontando para o local do "Secret File" que você subiu.
    # Se o nome do arquivo no Render for "firebase-credentials.json", a variável será esta.
    FIREBASE_CREDENTIALS_PATH = os.getenv('FIREBASE_CREDENTIALS_JSON_PATH')

