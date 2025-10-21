export default function TestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        FocoVest - Teste de Funcionamento
      </h1>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">✅ Sistema Funcionando</h2>
          <p className="text-gray-700 mb-4">
            Se você está vendo esta página, significa que:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>React está carregando corretamente</li>
            <li>Tailwind CSS está aplicado</li>
            <li>O sistema de roteamento funciona</li>
            <li>O módulo compartilhado foi compilado</li>
          </ul>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            🚀 Próximos Passos
          </h3>
          <p className="text-blue-700">
            Agora você pode navegar pelas outras páginas do sistema e testar todas as funcionalidades!
          </p>
        </div>
      </div>
    </div>
  )
}