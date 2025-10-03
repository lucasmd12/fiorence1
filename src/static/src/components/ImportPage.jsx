import { useNavigate } from 'react-router-dom'
import DocumentUploadImproved from './DocumentUploadImproved'

const ImportPage = ({ context }) => {
  const navigate = useNavigate()

  const handleTransactionsExtracted = () => {
    // Opcional: redirecionar para lançamentos após sucesso
    // navigate('/transactions')
    
    // Ou apenas mostrar mensagem de sucesso e deixar o usuário decidir
    console.log('Transações importadas com sucesso!')
  }

  return (
    <div className="p-6">
      {/* Header da página */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Importação de Documentos</h1>
        <p className="text-gray-600 mt-1">
          Importe extratos bancários, comprovantes e planilhas para extrair transações automaticamente
        </p>
      </div>

      {/* Componente principal de upload */}
      <DocumentUploadImproved 
        context={context} 
        onTransactionsExtracted={handleTransactionsExtracted}
      />

      {/* Dicas de uso */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">Dicas para melhor importação:</h3>
        <ul className="list-disc list-inside space-y-2 text-blue-800">
          <li>Use imagens nítidas e bem iluminadas para melhor reconhecimento de texto</li>
          <li>PDFs de extratos bancários têm a maior precisão na extração</li>
          <li>Planilhas Excel/CSV devem ter colunas organizadas com data, descrição e valor</li>
          <li>Revise sempre as transações antes de salvar para garantir precisão</li>
          <li>Você pode criar novas categorias durante o processo de revisão</li>
        </ul>
      </div>
    </div>
  )
}

export default ImportPage
