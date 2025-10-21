import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CpuChipIcon,
  SparklesIcon,
  BookOpenIcon,
  ChartBarIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'
import AIRecommendationsComponent from '../components/AIRecommendationsComponent'
import AIQuestionGeneratorPage from './AIQuestionGeneratorPage'

type AIView = 'recommendations' | 'generator' | 'overview'

export default function AIPage() {
  const [activeView, setActiveView] = useState<AIView>('overview')

  const features = [
    {
      id: 'recommendations',
      title: 'Recomendações Inteligentes',
      description: 'Análise personalizada dos seus padrões de estudo e erro, com sugestões de horários otimizados e matérias prioritárias.',
      icon: <LightBulbIcon className="w-8 h-8" />,
      color: 'blue',
      stats: ['Análise de padrões', 'Horários otimizados', 'Matérias prioritárias']
    },
    {
      id: 'generator',
      title: 'Gerador de Questões',
      description: 'Crie questões personalizadas baseadas em provas anteriores das universidades usando algoritmos avançados de IA.',
      icon: <BookOpenIcon className="w-8 h-8" />,
      color: 'purple',
      stats: ['Templates inteligentes', 'Padrões de IA', 'Múltiplas universidades']
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'from-blue-500 to-cyan-600',
      purple: 'from-purple-500 to-pink-600',
      green: 'from-green-500 to-teal-600'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  if (activeView === 'recommendations') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setActiveView('overview')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <CpuChipIcon className="w-5 h-5" />
                <span className="font-medium">IA FocoVest</span>
              </button>
              <nav className="flex space-x-6">
                <button
                  onClick={() => setActiveView('recommendations')}
                  className="text-blue-600 font-medium border-b-2 border-blue-600 pb-2"
                >
                  Recomendações
                </button>
                <button
                  onClick={() => setActiveView('generator')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Gerador de Questões
                </button>
              </nav>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AIRecommendationsComponent />
        </div>
      </div>
    )
  }

  if (activeView === 'generator') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setActiveView('overview')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <CpuChipIcon className="w-5 h-5" />
                <span className="font-medium">IA FocoVest</span>
              </button>
              <nav className="flex space-x-6">
                <button
                  onClick={() => setActiveView('recommendations')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Recomendações
                </button>
                <button
                  onClick={() => setActiveView('generator')}
                  className="text-blue-600 font-medium border-b-2 border-blue-600 pb-2"
                >
                  Gerador de Questões
                </button>
              </nav>
            </div>
          </div>
        </div>

        <AIQuestionGeneratorPage />
      </div>
    )
  }

  // Overview page
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center space-x-3 mb-6">
                <CpuChipIcon className="w-12 h-12 text-white" />
                <h1 className="text-5xl font-bold text-white">IA FocoVest</h1>
              </div>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Revolucione seus estudos com inteligência artificial avançada. 
                Análises personalizadas, recomendações inteligentes e geração automática de questões.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <SparklesIcon className="w-6 h-6 text-yellow-300" />
                <span className="text-white font-medium">Powered by Advanced AI Algorithms</span>
                <SparklesIcon className="w-6 h-6 text-yellow-300" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Funcionalidades Inteligentes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nossa IA analisa seus padrões de estudo e cria experiências personalizadas 
            para maximizar seu desempenho nos vestibulares.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="relative group cursor-pointer"
              onClick={() => setActiveView(feature.id as AIView)}
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-300 blur-xl group-hover:blur-none">
                <div className={`w-full h-full bg-gradient-to-r ${getColorClasses(feature.color)} rounded-xl opacity-20`}></div>
              </div>
              
              <div className="relative bg-white rounded-xl shadow-lg p-8 border border-gray-100 group-hover:shadow-xl transition-all duration-300 group-hover:border-transparent">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-r ${getColorClasses(feature.color)} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="space-y-2">
                  {feature.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="flex items-center text-sm text-gray-500">
                      <ChartBarIcon className="w-4 h-4 mr-2 text-green-500" />
                      {stat}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <span className="text-sm font-medium text-blue-600 group-hover:text-purple-600 transition-colors">
                    Explorar Funcionalidade →
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Resultados Comprovados
            </h3>
            <p className="text-gray-600">
              Nossa IA tem ajudado milhares de estudantes a alcançar seus objetivos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-sm text-gray-600">Precisão nas Recomendações</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">10k+</div>
              <div className="text-sm text-gray-600">Questões Geradas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
              <div className="text-sm text-gray-600">Melhoria na Performance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Disponibilidade</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}