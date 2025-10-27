import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BookOpenIcon, 
  ClockIcon, 
  AcademicCapIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  TagIcon,
  EyeIcon,
  FaceFrownIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline'
import {
  StarIcon as StarIconSolid,
  FireIcon as FireIconSolid
} from '@heroicons/react/24/solid'

// API service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const fetchSimulations = async () => {
  try {
    console.log('🔄 Buscando simulações da API...')
    console.log('📡 URL da API:', `${API_BASE_URL}/simulations`)
    
    // Timeout controller para evitar requests longos
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos

    const response = await fetch(`${API_BASE_URL}/simulations`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    clearTimeout(timeoutId)
    
    console.log('📊 Status da resposta:', response.status)
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('📦 Resposta da API:', data)
    console.log('📋 Simulações encontradas:', data.simulations?.length || 0)
    return data.simulations || []
  } catch (error) {
    console.error('❌ Erro ao buscar simulações:', error)
    
    // Fallback com dados de exemplo enquanto debugamos
    console.log('🔄 Usando dados de fallback...')
    return [
      {
        _id: '1',
        title: 'Simulado Geral - Vestibular UFC 2024',
        description: 'Simulado completo com questões das principais matérias cobradas no vestibular da UFC',
        settings: {
          timeLimit: 180,
          questionsCount: 30,
          subjects: ['Geral'],
          universities: ['UFC'],
          difficulty: ['medium']
        },
        category: 'vestibular',
        status: 'active',
        tags: ['vestibular', 'ufc', 'geral'],
        isPublic: true,
        createdAt: '2024-02-01',
        estimatedDuration: 180
      },
      {
        _id: '2',
        title: 'Matemática Intensivo - UECE',
        description: 'Foque nas questões de matemática mais difíceis da UECE',
        settings: {
          timeLimit: 90,
          questionsCount: 15,
          subjects: ['Matemática'],
          universities: ['UECE'],
          difficulty: ['hard']
        },
        category: 'especifico',
        status: 'active',
        tags: ['matemática', 'uece', 'difícil'],
        isPublic: true,
        createdAt: '2024-02-05',
        estimatedDuration: 90
      },
      {
        _id: '3',
        title: 'ENEM Completo 2023',
        description: 'Simulado completo do ENEM com 180 questões de todas as áreas do conhecimento',
        settings: {
          timeLimit: 330,
          questionsCount: 180,
          subjects: ['Linguagens', 'Matemática', 'Ciências Humanas', 'Ciências da Natureza'],
          universities: ['ENEM'],
          difficulty: ['medium']
        },
        category: 'nacional',
        status: 'active',
        tags: ['enem', 'completo', 'nacional'],
        isPublic: true,
        createdAt: '2024-03-01',
        estimatedDuration: 330
      },
      {
        _id: '4',
        title: 'ENEM Express - Revisão Rápida',
        description: 'Simulado rápido do ENEM com 45 questões para revisão eficiente',
        settings: {
          timeLimit: 90,
          questionsCount: 45,
          subjects: ['Geral'],
          universities: ['ENEM'],
          difficulty: ['medium']
        },
        category: 'revisao',
        status: 'active',
        tags: ['enem', 'revisão', 'rápido'],
        isPublic: true,
        createdAt: '2024-03-02',
        estimatedDuration: 90
      }
    ]
  }
}

// Tipos para dados do backend
interface SimulationData {
  _id: string
  title: string
  description: string
  settings: {
    subjects?: string[]
    universities?: string[]
    difficulty?: string[]
    timeLimit: number
    questionsCount: number
  }
  category: string
  status: string
  tags: string[]
  isPublic: boolean
  createdAt: string
  estimatedDuration: number
}

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

// Função utilitária para formatar número de questões
const formatQuestions = (count?: number): string => {
  if (!count || isNaN(count) || count <= 0) {
    return 'Questões variáveis'
  }
  return `${count} questão${count > 1 ? 'ões' : ''}`
}

const SimulationsPageNew: React.FC = () => {
  const navigate = useNavigate()
  
  // Estados principais
  const [simulations, setSimulations] = useState<SimulationData[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Estados de filtros e busca
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUniversity, setSelectedUniversity] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'difficulty' | 'duration'>('popular')

  // Carregar simulações do backend
  useEffect(() => {
    let isMounted = true // Flag para evitar atualizações se o componente for desmontado

    const loadSimulations = async () => {
      if (!isMounted) return
      
      console.log('🚀 Iniciando carregamento de simulações...')
      setLoading(true)
      
      try {
        const data = await fetchSimulations()
        if (isMounted) {
          console.log('✅ Dados carregados:', data)
          setSimulations(data)
        }
      } catch (error) {
        if (isMounted) {
          console.error('❌ Erro ao carregar simulações:', error)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          console.log('🏁 Loading finalizado')
        }
      }
    }

    loadSimulations()

    // Cleanup function para evitar memory leaks
    return () => {
      isMounted = false
    }
  }, [])

  // Função para filtrar simulações
  const filteredSimulations = simulations.filter(simulation => {
    const matchesSearch = simulation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         simulation.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesUniversity = !selectedUniversity || 
                             simulation.settings.universities?.includes(selectedUniversity)
    
    const matchesCategory = !selectedCategory || simulation.category === selectedCategory

    return matchesSearch && matchesUniversity && matchesCategory
  })

  // Função para ordenar simulações
  const sortedSimulations = [...filteredSimulations].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'duration':
        return a.settings.timeLimit - b.settings.timeLimit
      case 'difficulty':
        // Ordenar por dificuldade (assumindo que hard > medium > easy)
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 }
        const aDiff = a.settings.difficulty?.[0] || 'medium'
        const bDiff = b.settings.difficulty?.[0] || 'medium'
        return (difficultyOrder[bDiff as keyof typeof difficultyOrder] || 2) - 
               (difficultyOrder[aDiff as keyof typeof difficultyOrder] || 2)
      default:
        return 0
    }
  })

  // Função para obter cor da dificuldade
  const getDifficultyColor = (difficulty?: string[]) => {
    const mainDifficulty = difficulty?.[0] || 'medium'
    switch (mainDifficulty) {
      case 'easy':
        return 'text-green-700 bg-green-50'
      case 'medium':
        return 'text-yellow-700 bg-yellow-50'
      case 'hard':
        return 'text-red-700 bg-red-50'
      default:
        return 'text-gray-700 bg-gray-50'
    }
  }

  // Função para renderizar card de simulado
  const renderSimulationCard = (simulation: SimulationData) => (
    <div key={simulation._id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Header do card */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {simulation.settings.universities?.[0] || 'Geral'}
            </span>
            {simulation.category === 'vestibular' && (
              <FireIconSolid className="w-4 h-4 text-orange-500" />
            )}
            {simulation.isPublic && (
              <StarIconSolid className="w-4 h-4 text-yellow-500" />
            )}
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(simulation.settings.difficulty)}`}>
            {simulation.settings.difficulty?.[0]?.charAt(0).toUpperCase() + (simulation.settings.difficulty?.[0]?.slice(1) || 'Médio')}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {simulation.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {simulation.description}
        </p>

        {/* Informações do simulado */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            <span>{formatTime(simulation.settings.timeLimit)}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpenIcon className="w-4 h-4" />
            <span>{formatQuestions(simulation.settings.questionsCount)}</span>
          </div>
          <div className="flex items-center gap-1">
            <TagIcon className="w-4 h-4" />
            <span>{simulation.settings.subjects?.[0] || 'Geral'}</span>
          </div>
        </div>

        {/* Tags */}
        {simulation.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {simulation.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer do card */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/integrated-simulation/${simulation._id}`)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <EyeIcon className="w-4 h-4" />
            Ver Detalhes
          </button>
          <button
            onClick={() => navigate(`/integrated-simulation/${simulation._id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <PlayIcon className="w-4 h-4" />
            Iniciar
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <AcademicCapIcon className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Simulados</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Controles de visualização */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ListBulletIcon className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => navigate('/simulations/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Criar Simulado
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros e busca */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Barra de busca */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="search-simulations"
                name="searchSimulations"
                placeholder="Buscar simulados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoComplete="off"
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-3">
              <select
                id="filter-university"
                name="filterUniversity"
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas Universidades</option>
                <option value="ENEM">ENEM</option>
                <option value="UFC">UFC</option>
                <option value="UECE">UECE</option>
                <option value="UVA">UVA</option>
                <option value="URCA">URCA</option>
                <option value="IFCE">IFCE</option>
              </select>

              <select
                id="filter-category"
                name="filterCategory"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas Categorias</option>
                <option value="geral">Geral</option>
                <option value="especifico">Específico</option>
                <option value="vestibular">Vestibular</option>
                <option value="revisao">Revisão</option>
              </select>

              <select
                id="sort-by"
                name="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="popular">Mais Popular</option>
                <option value="recent">Mais Recente</option>
                <option value="difficulty">Dificuldade</option>
                <option value="duration">Duração</option>
              </select>
            </div>
          </div>
        </div>

        {/* Seção de Simulados em Destaque - apenas quando não há filtros aplicados */}
        {!searchTerm && !selectedUniversity && !selectedCategory && filteredSimulations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Simulados em Destaque</h2>
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setSortBy('popular')
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Ver todos
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSimulations.slice(0, 3).map((simulation) => renderSimulationCard(simulation))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Carregando simulados...</p>
          </div>
        )}

        {/* Lista de simulados */}
        {!loading && (
          <>
            {/* Título da seção de resultados quando há filtros */}
            {(searchTerm || selectedUniversity || selectedCategory) && sortedSimulations.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Resultados da Busca
                </h2>
                <p className="text-gray-600">
                  {sortedSimulations.length} simulado{sortedSimulations.length !== 1 ? 's' : ''} encontrado{sortedSimulations.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
            
            {sortedSimulations.length === 0 ? (
              <div className="text-center py-12">
                <FaceFrownIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum simulado encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Tente ajustar os filtros ou criar um novo simulado.
                </p>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {sortedSimulations.map(renderSimulationCard)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SimulationsPageNew
