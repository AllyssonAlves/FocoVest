import { Link } from 'react-router-dom'
import { HomeIcon, ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <ExclamationTriangleIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Página não encontrada
          </h2>
          <p className="text-gray-600 mb-8">
            Ops! A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 w-full justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <HomeIcon className="h-5 w-5" />
            <span>Voltar ao Início</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center space-x-2 w-full justify-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Voltar</span>
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>💡 Sugestões:</strong>
          </p>
          <ul className="text-blue-700 text-sm mt-2 text-left">
            <li>• Verifique se digitou o endereço corretamente</li>
            <li>• Use o menu de navegação</li>
            <li>• Acesse a página inicial</li>
          </ul>
        </div>

        <div className="mt-6">
          <p className="text-gray-500 text-sm">
            Precisa de ajuda? 
            <Link to="/" className="text-blue-600 hover:text-blue-800 ml-1">
              Entre em contato
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}