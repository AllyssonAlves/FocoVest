import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BookOpenIcon, 
  ClockIcon, 
  AcademicCapIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  UserGroupIcon,
  TagIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import {
  Simulation,
  SimulationFilters,
  SIMULATION_CATEGORIES,
  SIMULATION_STATUS
} from '@shared/simulation'
import { SUBJECTS, UNIVERSITIES } from '@shared/constants'
import { simulationService } from '../services/simulationService'
import { useAuth } from '../contexts/AuthContext'

// Função utilitária para formatar tempo
const formatTime = (minutes?: number): string => {
  if (!minutes || isNaN(minutes) || minutes <= 0) {
    return 'Tempo livre'
  }
  
  if (minutes < 60) {
    return `${minutes} min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}min`
}

const SimulationsPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Estados principais
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados de filtros
  const [filters, setFilters] = useState<SimulationFilters>({
    page: 1,
    limit: 12
  })
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)

  // Carregar simulados
  const loadSimulations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await simulationService.getSimulations({
        ...filters,
        ...(searchTerm && { search: searchTerm })
      })
      
      setSimulations(response.data)
      setCurrentPage(response.pagination.currentPage)
      setTotalPages(response.pagination.totalPages)
      setHasNext(response.pagination.hasNext)
      setHasPrev(response.pagination.hasPrev)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar simulados')
    } finally {
      setLoading(false)
    }
  }

  // Efeito para carregar simulados quando filtros mudarem
  useEffect(() => {
    loadSimulations()
  }, [filters, searchTerm])

  // Manipuladores de filtros
  const handleFilterChange = (key: keyof SimulationFilters, value: any) => {
    setFilters((prev: SimulationFilters) => ({
      ...prev,
      [key]: value,
      page: 1 // Resetar para primeira página
    }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters((prev: SimulationFilters) => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({ page: 1, limit: 12 })
    setSearchTerm('')
  }

  // Manipuladores de paginação
  const handlePageChange = (page: number) => {
    setFilters((prev: SimulationFilters) => ({ ...prev, page }))
  }

  // Manipuladores de ações dos simulados
  const handleStartSimulation = async (simulationId: string) => {
    try {
      await simulationService.startSimulation(simulationId)
      navigate(`/simulations/${simulationId}/take`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar simulado')
    }
  }

  const handleContinueSimulation = (simulationId: string) => {
    navigate(`/simulations/${simulationId}/take`)
  }

  const handleViewResults = (simulationId: string) => {
    navigate(`/simulations/${simulationId}/results`)
  }

  // Renderizar status do simulado
  const renderSimulationStatus = (simulation: Simulation) => {
    const statusIcons = {
      draft: <TagIcon className="w-4 h-4" />,
      active: <PlayIcon className="w-4 h-4" />,
      paused: <PauseIcon className="w-4 h-4" />,
      completed: <CheckCircleIcon className="w-4 h-4" />
    }

    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-blue-100 text-blue-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800'
    }

    const statusLabels = {
      draft: 'Rascunho',
      active: 'Ativo',
      paused: 'Pausado',
      completed: 'Concluído'
    }

    const status = simulation.status as keyof typeof statusColors
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.draft}`}>
        {statusIcons[status] || statusIcons.draft}
        {statusLabels[status] || statusLabels.draft}
      </span>
    )
  }

  // Renderizar card do simulado
  const renderSimulationCard = (simulation: Simulation) => {
    const isAccessible = simulationService.isSimulationAccessible(simulation, user?._id)
    const canStart = isAccessible && simulation.status === 'draft'
    const canContinue = isAccessible && (simulation.status === 'active' || simulation.status === 'paused')
    const canViewResults = isAccessible && simulation.status === 'completed'

    return (
      <div key={simulation._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border">
        {/* Header do card */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {simulation.title}
            </h3>
            {renderSimulationStatus(simulation)}
          </div>
          
          {simulation.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {simulation.description}
            </p>
          )}

          {/* Metadados */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <BookOpenIcon className="w-4 h-4" />
              {simulation.questions.length} questões
            </span>
            <span className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              {formatTime(simulation.settings.timeLimit)}
            </span>
            <span className="flex items-center gap-1">
              <AcademicCapIcon className="w-4 h-4" />
              {SIMULATION_CATEGORIES.find((c: any) => c.value === simulation.category)?.label}
            </span>
          </div>
        </div>

        {/* Corpo do card */}
        <div className="p-6">
          {/* Tags e universidades */}
          {simulation.tags.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {simulation.tags.slice(0, 3).map((tag: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                    {tag}
                  </span>
                ))}
                {simulation.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded">
                    +{simulation.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Universidades */}
          {simulation.settings.universities && simulation.settings.universities.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Universidades:</p>
              <div className="flex flex-wrap gap-1">
                {simulation.settings.universities.slice(0, 3).map((university: any, index: number) => (
                  <span key={index} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                    {UNIVERSITIES.find((u: any) => u.value === university)?.label || university}
                  </span>
                ))}
                {simulation.settings.universities.length > 3 && (
                  <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded">
                    +{simulation.settings.universities.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Progresso (se aplicável) */}
          {simulation.progress !== undefined && simulation.progress > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Progresso</span>
                <span>{simulation.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${simulation.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Informações adicionais */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <UserGroupIcon className="w-4 h-4" />
              {simulation.isPublic ? 'Público' : 'Privado'}
            </span>
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              {new Date(simulation.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            {canStart && (
              <button
                onClick={() => handleStartSimulation(simulation._id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <PlayIcon className="w-4 h-4" />
                Iniciar
              </button>
            )}
            
            {canContinue && (
              <button
                onClick={() => handleContinueSimulation(simulation._id)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <PlayIcon className="w-4 h-4" />
                Continuar
              </button>
            )}
            
            {canViewResults && (
              <button
                onClick={() => handleViewResults(simulation._id)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircleIcon className="w-4 h-4" />
                Ver Resultado
              </button>
            )}

            {!isAccessible && (
              <button
                disabled
                className="flex-1 bg-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
              >
                Não disponível
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Simulados</h1>
          <p className="text-gray-600 mt-2">
            Teste seus conhecimentos com simulados cronometrados
          </p>
        </div>
        
        <button
          onClick={() => navigate('/simulations/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Criar Simulado
        </button>
      </div>

      {/* Barra de busca e filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              id="search-simulations-old"
              name="searchSimulationsOld"
              placeholder="Buscar simulados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoComplete="off"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon className="w-5 h-5" />
            Filtros
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            Buscar
          </button>
        </form>

        {/* Filtros expandidos */}
        {showFilters && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Categoria */}
              <div>
                <label htmlFor="filter-category-old" className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  id="filter-category-old"
                  name="filterCategoryOld"
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas</option>
                  {SIMULATION_CATEGORIES.map((category: any) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="filter-status-old" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="filter-status-old"
                  name="filterStatusOld"
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  {SIMULATION_STATUS.map((status: any) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Universidades */}
              <div>
                <label htmlFor="filter-universities-old" className="block text-sm font-medium text-gray-700 mb-2">
                  Universidade
                </label>
                <select
                  id="filter-universities-old"
                  name="filterUniversitiesOld"
                  value={filters.universities?.[0] || ''}
                  onChange={(e) => handleFilterChange('universities', e.target.value ? [e.target.value] : undefined)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas</option>
                  {UNIVERSITIES.map((university: any) => (
                    <option key={university.value} value={university.value}>
                      {university.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Matérias */}
              <div>
                <label htmlFor="filter-subjects-old" className="block text-sm font-medium text-gray-700 mb-2">
                  Matéria
                </label>
                <select
                  id="filter-subjects-old"
                  name="filterSubjectsOld"
                  value={filters.subjects?.[0] || ''}
                  onChange={(e) => handleFilterChange('subjects', e.target.value ? [e.target.value] : undefined)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas</option>
                  {SUBJECTS.map((subject: any) => (
                    <option key={subject.value} value={subject.value}>
                      {subject.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo principal */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadSimulations}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      ) : simulations.length === 0 ? (
        <div className="text-center py-12">
          <BookOpenIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Nenhum simulado encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || Object.keys(filters).some(key => filters[key as keyof SimulationFilters] !== undefined && key !== 'page' && key !== 'limit')
              ? 'Tente ajustar os filtros de busca.'
              : 'Crie seu primeiro simulado para começar a estudar.'
            }
          </p>
          <button
            onClick={() => navigate('/simulations/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Criar Primeiro Simulado
          </button>
        </div>
      ) : (
        <>
          {/* Grid de simulados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {simulations.map(renderSimulationCard)}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrev}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Anterior
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => Math.abs(page - currentPage) <= 2)
                .map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 border rounded-md transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNext}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SimulationsPage