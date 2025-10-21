import { useState } from 'react'
import { Question, QuestionFilters, SUBJECTS, UNIVERSITIES, DIFFICULTIES } from '../types/question'
import { questionService } from '../services/questionService'
import QuestionCard from '../components/questions/QuestionCard'
import toast from 'react-hot-toast'

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [filters, setFilters] = useState<QuestionFilters>({
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalQuestions: 0,
    hasNext: false,
    hasPrev: false
  })
  const [searchTerm, setSearchTerm] = useState('')

  // Removido o useEffect que carregava automaticamente
  // useEffect(() => {
  //   loadQuestions()
  // }, [filters])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      setHasSearched(true)
      const response = await questionService.getQuestions(filters)
      setQuestions(response.data)
      setPagination(response.pagination)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar questões')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof QuestionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }))
  }

  const handleSearch = () => {
    handleFilterChange('search', searchTerm)
    loadQuestions()
  }

  const applyFilters = () => {
    loadQuestions()
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    // Recarregar questões após mudança de página
    setTimeout(() => loadQuestions(), 0)
  }

  const clearFilters = () => {
    setFilters({ page: 1, limit: 10 })
    setSearchTerm('')
    setHasSearched(false)
    setQuestions([])
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalQuestions: 0,
      hasNext: false,
      hasPrev: false
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Banco de Questões</h1>
        <p className="text-gray-600">
          Pratique com questões reais dos vestibulares das principais universidades do Ceará
        </p>
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Busca */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Buscar por título, enunciado ou explicação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="btn-primary px-4"
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Matéria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Matéria
            </label>
            <select
              value={filters.subject || ''}
              onChange={(e) => handleFilterChange('subject', e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todas as matérias</option>
              {SUBJECTS.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          {/* Universidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Universidade
            </label>
            <select
              value={filters.university || ''}
              onChange={(e) => handleFilterChange('university', e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todas as universidades</option>
              {UNIVERSITIES.map(university => (
                <option key={university} value={university}>{university}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Dificuldade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dificuldade
            </label>
            <select
              value={filters.difficulty || ''}
              onChange={(e) => handleFilterChange('difficulty', e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todas as dificuldades</option>
              {DIFFICULTIES.map(difficulty => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </option>
              ))}
            </select>
          </div>

          {/* Questões por página */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Por página
            </label>
            <select
              value={filters.limit || 10}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={5}>5 questões</option>
              <option value={10}>10 questões</option>
              <option value={20}>20 questões</option>
              <option value={50}>50 questões</option>
            </select>
          </div>

          {/* Limpar filtros */}
          <div className="flex items-end space-x-2">
            <button
              onClick={clearFilters}
              className="flex-1 btn-secondary"
            >
              Limpar filtros
            </button>
            <button
              onClick={applyFilters}
              className="flex-1 btn-primary"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {hasSearched && (
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            {loading ? (
              'Carregando...'
            ) : (
              `${pagination.totalQuestions} questão${pagination.totalQuestions !== 1 ? 'ões' : ''} encontrada${pagination.totalQuestions !== 1 ? 's' : ''}`
            )}
          </div>
          
          {pagination.totalPages > 1 && (
            <div className="text-sm text-gray-600">
              Página {pagination.currentPage} de {pagination.totalPages}
            </div>
          )}
        </div>
      )}

      {/* Lista de questões */}
      {!hasSearched ? (
        <div className="text-center py-16">
          <div className="text-8xl mb-6">🔍</div>
          <h3 className="text-xl font-medium text-gray-900 mb-3">
            Pronto para praticar?
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Use os filtros acima para encontrar questões específicas por matéria, universidade, dificuldade ou faça uma busca por palavras-chave.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>💡 <strong>Dica:</strong> Selecione uma matéria e clique em "Aplicar Filtros"</p>
            <p>📚 Temos questões de Matemática, Português, Física, Química e mais</p>
            <p>🎯 Questões reais das universidades UFC, UECE, UVA, URCA e IFCE</p>
          </div>
        </div>
      ) : loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Carregando questões...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma questão encontrada
          </h3>
          <p className="text-gray-600 mb-4">
            Tente ajustar os filtros ou fazer uma nova busca
          </p>
          <button onClick={clearFilters} className="btn-primary">
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((question) => (
            <QuestionCard
              key={question._id}
              question={question}
              showAnswer={false}
              showExplanation={false}
            />
          ))}
        </div>
      )}

      {/* Paginação */}
      {hasSearched && pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="inline-flex items-center space-x-1">
            {/* Anterior */}
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>

            {/* Páginas */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = Math.max(1, pagination.currentPage - 2) + i
              if (page > pagination.totalPages) return null
              
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm rounded-md ${
                    page === pagination.currentPage
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              )
            })}

            {/* Próximo */}
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo →
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}