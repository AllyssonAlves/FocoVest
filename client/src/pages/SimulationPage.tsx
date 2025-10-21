export default function SimulationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Simulados</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-2">Simulado ENEM Completo</h3>
          <p className="text-gray-600 mb-4">180 questões • 5h 30min</p>
          <button className="btn-primary w-full">Iniciar Simulado</button>
        </div>
        
        <div className="card hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-2">Matemática - UFC</h3>
          <p className="text-gray-600 mb-4">20 questões • 40min</p>
          <button className="btn-primary w-full">Iniciar Simulado</button>
        </div>
        
        <div className="card hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-2">Português - UECE</h3>
          <p className="text-gray-600 mb-4">15 questões • 30min</p>
          <button className="btn-primary w-full">Iniciar Simulado</button>
        </div>
      </div>
    </div>
  )
}