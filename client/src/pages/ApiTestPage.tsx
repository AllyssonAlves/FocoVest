import { useState, useEffect } from 'react'

interface Question {
  _id: string
  questionText: string
  subject: string
  university: string
  difficulty: string
}

interface Simulation {
  _id: string
  title: string
  description?: string
  category: string
  questionsCount: number
}

export default function ApiTestPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Testar API de questões
        const questionsResponse = await fetch('http://localhost:5000/api/questions')
        if (!questionsResponse.ok) throw new Error('Erro ao buscar questões')
        const questionsData = await questionsResponse.json()
        setQuestions(questionsData.data?.questions || [])

        // Testar API de simulações
        const simulationsResponse = await fetch('http://localhost:5000/api/simulations')
        if (!simulationsResponse.ok) throw new Error('Erro ao buscar simulações')
        const simulationsData = await simulationsResponse.json()
        setSimulations(simulationsData.data?.simulations || [])

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados da API...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Erro na Integração</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        🧪 Teste de Integração Frontend-Backend
      </h1>

      {/* Status da Conexão */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
        <h2 className="text-lg font-semibold text-green-800 mb-2">
          ✅ Conexão com Backend: Funcionando
        </h2>
        <p className="text-green-700">
          APIs respondendo corretamente. Dados carregados com sucesso!
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">📚 Questões Carregadas</h3>
          <p className="text-3xl font-bold text-blue-600">{questions.length}</p>
          <p className="text-gray-600">questões disponíveis no banco</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">🎯 Simulados Carregados</h3>
          <p className="text-3xl font-bold text-green-600">{simulations.length}</p>
          <p className="text-gray-600">simulados disponíveis</p>
        </div>
      </div>

      {/* Amostra de Questões */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">📋 Amostra de Questões (5 primeiras)</h2>
        <div className="space-y-4">
          {questions.slice(0, 5).map((question, index) => (
            <div key={question._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-gray-800">Questão #{index + 1}</h3>
                <div className="flex space-x-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {question.subject}
                  </span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {question.university}
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                    {question.difficulty}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 line-clamp-2">{question.questionText}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Amostra de Simulados */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">🎮 Simulados Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {simulations.map((simulation) => (
            <div key={simulation._id} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{simulation.title}</h3>
              {simulation.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{simulation.description}</p>
              )}
              <div className="flex justify-between items-center">
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                  {simulation.category}
                </span>
                <span className="text-sm text-gray-600">
                  {simulation.questionsCount} questões
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Informações Técnicas */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔧 Informações Técnicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Endpoints Testados:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ GET /api/questions</li>
              <li>✅ GET /api/simulations</li>
              <li>✅ CORS configurado</li>
              <li>✅ JSON parsing funcionando</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Funcionalidades Verificadas:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Fetch API funcionando</li>
              <li>✅ Error handling implementado</li>
              <li>✅ Loading states funcionais</li>
              <li>✅ Tipagem TypeScript</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}