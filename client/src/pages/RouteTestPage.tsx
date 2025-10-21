import { Link } from 'react-router-dom'
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon
} from '@heroicons/react/24/outline'

export default function RouteTestPage() {
  // Lista completa de rotas para teste
  const publicRoutes = [
    { path: '/', name: 'Homepage', description: 'Página inicial' },
    { path: '/login', name: 'Login', description: 'Página de login' },
    { path: '/register', name: 'Register', description: 'Página de cadastro' },
    { path: '/timer-demo', name: 'Timer Demo', description: 'Demonstração do sistema de timer' },
    { path: '/test', name: 'Test Page', description: 'Página de teste básico' },
    { path: '/api-test', name: 'API Test', description: 'Teste de integração com backend' },
    { path: '/compact-timer', name: 'Compact Timer', description: 'Demonstração do timer compacto' },
    { path: '/integrated-simulation', name: 'Integrated Simulation', description: 'Simulados integrados com backend' }
  ]

  const protectedRoutes = [
    { path: '/dashboard', name: 'Dashboard', description: 'Painel do usuário' },
    { path: '/simulations', name: 'Simulations', description: 'Lista de simulados' },
    { path: '/simulation', name: 'Simulation', description: 'Página de simulado' },
    { path: '/questions', name: 'Questions', description: 'Banco de questões' },
    { path: '/ranking', name: 'Ranking', description: 'Ranking de usuários' },
    { path: '/profile', name: 'Profile', description: 'Perfil do usuário' }
  ]

  const dynamicRoutes = [
    { path: '/integrated-simulation/test123', name: 'Simulation with ID', description: 'Simulado com ID específico' },
    { path: '/simulations/test123/take', name: 'Take Simulation', description: 'Executar simulado específico' },
    { path: '/simulations/test123/results', name: 'Simulation Results', description: 'Resultados do simulado' }
  ]

  const invalidRoutes = [
    { path: '/rota-inexistente', name: '404 Test 1', description: 'Teste de rota inexistente' },
    { path: '/pagina-nao-encontrada', name: '404 Test 2', description: 'Teste de página não encontrada' },
    { path: '/invalid/nested/route', name: '404 Test 3', description: 'Teste de rota aninhada inválida' }
  ]

  const RouteSection = ({ 
    title, 
    routes, 
    icon: Icon, 
    bgColor, 
    textColor 
  }: {
    title: string
    routes: Array<{ path: string; name: string; description: string }>
    icon: any
    bgColor: string
    textColor: string
  }) => (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <Icon className={`h-6 w-6 ${textColor}`} />
        <h2 className={`text-xl font-semibold ${textColor}`}>{title}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((route) => (
          <div key={route.path} className={`${bgColor} rounded-lg p-4 border`}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-gray-800">{route.name}</h3>
              <LinkIcon className="h-4 w-4 text-gray-500 mt-0.5" />
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{route.description}</p>
            
            <div className="space-y-2">
              <div className="text-xs font-mono text-gray-500 bg-gray-100 p-1 rounded">
                {route.path}
              </div>
              
              <Link
                to={route.path}
                className={`block w-full text-center py-2 px-3 rounded transition-colors text-sm font-medium ${
                  bgColor === 'bg-red-50' 
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : bgColor === 'bg-yellow-50'
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Testar Rota
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🧪 Teste Completo de Rotas e Links
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Esta página permite testar todas as rotas do sistema FocoVest, incluindo rotas públicas, 
              protegidas, dinâmicas e tratamento de erros 404.
            </p>
          </div>

          {/* Status Geral */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 Status Geral das Rotas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {publicRoutes.length}
                </div>
                <div className="text-sm text-green-700">Rotas Públicas</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {protectedRoutes.length}
                </div>
                <div className="text-sm text-yellow-700">Rotas Protegidas</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {dynamicRoutes.length}
                </div>
                <div className="text-sm text-blue-700">Rotas Dinâmicas</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {invalidRoutes.length}
                </div>
                <div className="text-sm text-red-700">Testes 404</div>
              </div>
            </div>
          </div>

          {/* Rotas Públicas */}
          <RouteSection
            title="✅ Rotas Públicas (Devem Funcionar)"
            routes={publicRoutes}
            icon={CheckCircleIcon}
            bgColor="bg-green-50"
            textColor="text-green-700"
          />

          {/* Rotas Protegidas */}
          <RouteSection
            title="🔒 Rotas Protegidas (Podem Redirecionar)"
            routes={protectedRoutes}
            icon={ExclamationTriangleIcon}
            bgColor="bg-yellow-50"
            textColor="text-yellow-700"
          />

          {/* Rotas Dinâmicas */}
          <RouteSection
            title="🔗 Rotas Dinâmicas (Com Parâmetros)"
            routes={dynamicRoutes}
            icon={LinkIcon}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
          />

          {/* Testes 404 */}
          <RouteSection
            title="❌ Testes de 404 (Devem Dar Erro)"
            routes={invalidRoutes}
            icon={XCircleIcon}
            bgColor="bg-red-50"
            textColor="text-red-700"
          />

          {/* Instruções */}
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Instruções de Teste</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">🟢 Rotas Públicas:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Devem carregar normalmente</li>
                  <li>• Sem redirecionamento</li>
                  <li>• Interface completa visível</li>
                  <li>• Sem erros no console</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">🟡 Rotas Protegidas:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Podem redirecionar para login</li>
                  <li>• Ou mostrar mensagem de acesso</li>
                  <li>• Comportamento esperado</li>
                  <li>• Verificar ProtectedRoute</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">🔵 Rotas Dinâmicas:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Devem aceitar parâmetros</li>
                  <li>• Processar IDs corretamente</li>
                  <li>• Mostrar página ou erro adequado</li>
                  <li>• useParams() funcionando</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">🔴 Testes 404:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Devem mostrar página de erro</li>
                  <li>• Ou redirecionar para homepage</li>
                  <li>• Não quebrar a aplicação</li>
                  <li>• Handler 404 funcionando</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Voltar */}
          <div className="text-center mt-8">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <span>← Voltar para Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}