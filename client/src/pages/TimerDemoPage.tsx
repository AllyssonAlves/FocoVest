import TimerDisplay from '../components/TimerDisplay'

export default function TimerDemoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Demonstração do Sistema de Cronômetro</h1>
      
      <div className="space-y-12">
        {/* Timer Compact */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Timer Compacto</h2>
          <p className="text-gray-600 mb-6">
            Timer compacto ideal para uso em headers ou barras de status
          </p>
          <div className="bg-white p-6 rounded-lg border">
            <TimerDisplay
              initialTime={120} // 2 minutos
              compact
              size="sm"
              warningThreshold={60}
              criticalThreshold={30}
            />
          </div>
        </section>

        {/* Timer Medium */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Timer Médio</h2>
          <p className="text-gray-600 mb-6">
            Timer padrão com controles completos, ideal para telas de simulado
          </p>
          <div className="bg-white p-6 rounded-lg border">
            <TimerDisplay
              initialTime={600} // 10 minutos
              size="md"
              showElapsedTime
              warningThreshold={180}
              criticalThreshold={60}
              onTimeUp={() => alert('Tempo esgotado!')}
              onTick={(timeRemaining) => {
                if (timeRemaining === 60) {
                  console.log('1 minuto restante!')
                }
              }}
            />
          </div>
        </section>

        {/* Timer Large */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Timer Grande</h2>
          <p className="text-gray-600 mb-6">
            Timer grande para foco total no tempo, ideal para telas dedicadas
          </p>
          <div className="bg-white p-6 rounded-lg border">
            <TimerDisplay
              initialTime={300} // 5 minutos
              size="lg"
              showElapsedTime
              warningThreshold={120}
              criticalThreshold={45}
            />
          </div>
        </section>

        {/* Timer Extra Large */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Timer Extra Grande</h2>
          <p className="text-gray-600 mb-6">
            Timer máximo para apresentações ou situações que requerem máxima visibilidade
          </p>
          <div className="bg-white p-6 rounded-lg border">
            <TimerDisplay
              initialTime={180} // 3 minutos
              size="xl"
              showElapsedTime
              warningThreshold={90}
              criticalThreshold={30}
            />
          </div>
        </section>

        {/* Multiple Timers */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Múltiplos Timers</h2>
          <p className="text-gray-600 mb-6">
            Demonstração de múltiplos timers funcionando independentemente
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Timer 1 - Matemática</h3>
              <TimerDisplay
                initialTime={900} // 15 minutos
                size="sm"
                compact
                warningThreshold={300}
                criticalThreshold={60}
              />
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Timer 2 - Português</h3>
              <TimerDisplay
                initialTime={1200} // 20 minutos
                size="sm"
                compact
                warningThreshold={400}
                criticalThreshold={120}
              />
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Timer 3 - História</h3>
              <TimerDisplay
                initialTime={600} // 10 minutos
                size="sm"
                compact
                warningThreshold={180}
                criticalThreshold={60}
              />
            </div>
          </div>
        </section>

        {/* Timer Features */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Funcionalidades do Timer</h2>
          <div className="bg-white p-6 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Características:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• ⏰ Contagem regressiva precisa</li>
                  <li>• ⏸️ Pausar e retomar</li>
                  <li>• 🔄 Reiniciar timer</li>
                  <li>• ⚠️ Alertas visuais por tempo</li>
                  <li>• 🎨 Diferentes tamanhos e estilos</li>
                  <li>• 📱 Modo compacto para mobile</li>
                  <li>• ⏱️ Tempo decorrido opcional</li>
                  <li>• 🔔 Callbacks personalizáveis</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Estados do Timer:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• 🟢 <span className="font-medium text-green-600">Normal</span>: Tempo suficiente</li>
                  <li>• 🟡 <span className="font-medium text-yellow-600">Aviso</span>: Pouco tempo restante</li>
                  <li>• 🔴 <span className="font-medium text-red-600">Crítico</span>: Tempo esgotando</li>
                  <li>• ⚫ <span className="font-medium text-gray-600">Finalizado</span>: Tempo esgotado</li>
                  <li>• ⏸️ <span className="font-medium text-blue-600">Pausado</span>: Timer pausado</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm">
                <strong>💡 Dica:</strong> O sistema de cronômetro é totalmente customizável e pode ser integrado
                em qualquer parte da aplicação. Use os callbacks para implementar lógicas específicas como
                auto-save, alertas sonoros, ou redirecionamentos automáticos.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}