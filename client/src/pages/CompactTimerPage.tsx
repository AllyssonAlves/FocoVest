import { useState } from 'react'
import TimerDisplay from '../components/TimerDisplay'
import { 
  ClockIcon, 
  AcademicCapIcon, 
  BookOpenIcon,
  PauseIcon
} from '@heroicons/react/24/outline'

export default function CompactTimerPage() {
  const [isSimulationActive, setIsSimulationActive] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com Timer Compacto */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">FocoVest</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Simulado de Matemática</span>
            </div>
            
            {/* Timer Compacto no Header */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-gray-500" />
                <TimerDisplay
                  initialTime={1800} // 30 minutos
                  compact
                  size="sm"
                  showControls={false}
                  warningThreshold={600} // 10 minutos
                  criticalThreshold={300} // 5 minutos
                  onTimeUp={() => alert('⏰ Tempo do simulado esgotado!')}
                />
              </div>
              <button 
                className="btn-primary px-3 py-1 text-sm"
                onClick={() => setIsSimulationActive(!isSimulationActive)}
              >
                {isSimulationActive ? 'Pausar' : 'Continuar'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          ⏰ Timer Compacto - Casos de Uso Práticos
        </h1>

        {/* Dashboard com Múltiplos Timers Compactos */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">📊 Dashboard de Estudos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card Matemática */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Matemática</h3>
                </div>
                <TimerDisplay
                  initialTime={900} // 15 minutos
                  compact
                  size="sm"
                  showControls={false}
                  warningThreshold={300}
                  criticalThreshold={60}
                />
              </div>
              <p className="text-gray-600 mb-4">Álgebra e Geometria</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>12 questões</span>
                <span>Nível: Médio</span>
              </div>
            </div>

            {/* Card Português */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <BookOpenIcon className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Português</h3>
                </div>
                <TimerDisplay
                  initialTime={1200} // 20 minutos
                  compact
                  size="sm"
                  showControls={false}
                  warningThreshold={400}
                  criticalThreshold={120}
                />
              </div>
              <p className="text-gray-600 mb-4">Interpretação de Texto</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>8 questões</span>
                <span>Nível: Difícil</span>
              </div>
            </div>

            {/* Card História */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">História</h3>
                </div>
                <TimerDisplay
                  initialTime={600} // 10 minutos
                  compact
                  size="sm"
                  showControls={false}
                  warningThreshold={180}
                  criticalThreshold={60}
                />
              </div>
              <p className="text-gray-600 mb-4">Brasil Colônia</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>5 questões</span>
                <span>Nível: Fácil</span>
              </div>
            </div>
          </div>
        </section>

        {/* Barra de Status com Timer */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">📱 Barras de Status</h2>
          
          {/* Barra de Status Simulado */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-800 font-medium">Simulado UFC 2024 em andamento</span>
                <span className="text-blue-600">Questão 15 de 30</span>
              </div>
              <TimerDisplay
                initialTime={2400} // 40 minutos
                compact
                size="sm"
                showControls={false}
                warningThreshold={600}
                criticalThreshold={300}
                className="text-blue-700"
              />
            </div>
          </div>

          {/* Barra de Status Pausa */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <PauseIcon className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-800 font-medium">Simulado pausado</span>
                <span className="text-yellow-600">Clique para continuar</span>
              </div>
              <TimerDisplay
                initialTime={1800}
                compact
                size="sm"
                showControls={false}
                warningThreshold={600}
                criticalThreshold={300}
                className="text-yellow-700"
              />
            </div>
          </div>
        </section>

        {/* Navegação com Timer */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">🧭 Navegação de Questões</h2>
          
          <div className="bg-white rounded-lg shadow">
            {/* Header da Navegação */}
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-gray-800">Questão 8 de 20</h3>
                  <div className="flex space-x-2">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Matemática
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      UFC 2023
                    </span>
                  </div>
                </div>
                <TimerDisplay
                  initialTime={450} // 7.5 minutos para esta questão
                  compact
                  size="sm"
                  showControls={false}
                  warningThreshold={120}
                  criticalThreshold={30}
                />
              </div>
            </div>

            {/* Conteúdo Simulado */}
            <div className="p-6">
              <div className="space-y-4">
                <p className="text-gray-800">
                  Uma função f(x) = ax² + bx + c tem vértice no ponto (2, -1) e passa pelo ponto (0, 3). 
                  Determine o valor de a + b + c.
                </p>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="question" className="text-blue-600" />
                    <span>a) 2</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="question" className="text-blue-600" />
                    <span>b) 4</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="question" className="text-blue-600" />
                    <span>c) 6</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="question" className="text-blue-600" />
                    <span>d) 8</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="question" className="text-blue-600" />
                    <span>e) 10</span>
                  </label>
                </div>

                <div className="flex justify-between pt-4">
                  <button className="btn-secondary">← Anterior</button>
                  <button className="btn-primary">Próxima →</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Widgets Laterais */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">📊 Widgets e Controles</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Widget de Progresso */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Progresso do Estudo</h3>
                <TimerDisplay
                  initialTime={3600} // 1 hora total
                  compact
                  size="sm"
                  showControls={false}
                  showElapsedTime
                  warningThreshold={900}
                  criticalThreshold={300}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Questões Respondidas</span>
                  <span className="font-medium">12/20</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>

            {/* Widget de Controle */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Controles</h3>
                <TimerDisplay
                  initialTime={180} // 3 minutos para decisão
                  compact
                  size="sm"
                  showControls={true}
                  warningThreshold={60}
                  criticalThreshold={20}
                />
              </div>
              
              <div className="flex space-x-2">
                <button className="btn-primary flex-1 text-sm">Finalizar</button>
                <button className="btn-secondary flex-1 text-sm">Salvar</button>
              </div>
            </div>
          </div>
        </section>

        {/* Informações sobre Timer Compacto */}
        <section className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">💡 Sobre o Timer Compacto</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Características:</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 📏 <strong>Tamanho mínimo</strong> - Ocupa pouco espaço</li>
                <li>• 🎨 <strong>Estados visuais</strong> - Verde/Amarelo/Vermelho</li>
                <li>• 🔄 <strong>Atualização em tempo real</strong></li>
                <li>• ⚡ <strong>Performance otimizada</strong></li>
                <li>• 📱 <strong>Mobile-friendly</strong></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Casos de Uso:</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 📊 Headers e barras de status</li>
                <li>• 📋 Cards de dashboards</li>
                <li>• 🎯 Widgets de progresso</li>
                <li>• 📱 Interfaces mobile</li>
                <li>• ⏱️ Timers secundários</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              <strong>💡 Dica de Implementação:</strong> O Timer Compacto é perfeito para situações onde o espaço é limitado
              mas você ainda precisa de feedback visual sobre o tempo. Use `compact={true}` e `size="sm"` para a melhor experiência.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}