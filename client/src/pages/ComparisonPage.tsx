import { useState } from 'react'
import UserComparisonComponent from '../components/UserComparisonComponent'
import { motion } from 'framer-motion'
import {
  UserGroupIcon,
  ChartBarIcon,
  AcademicCapIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

export default function ComparisonPage() {
  const [selectedView, setSelectedView] = useState<'full' | 'ranking' | 'metrics'>('full')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Comparação com Outros Usuários
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Veja como seu desempenho se compara com outros estudantes da plataforma. 
              Descubra seus pontos fortes, áreas de melhoria e metas personalizadas.
            </p>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
          >
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <UserGroupIcon className="w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Rankings</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Veja sua posição no ranking geral e da sua universidade
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <ChartBarIcon className="w-8 h-8 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Métricas</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Compare suas métricas com a média dos outros usuários
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <AcademicCapIcon className="w-8 h-8 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Insights</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Receba insights personalizados e metas de melhoria
              </p>
            </div>
          </motion.div>
        </div>

        {/* Filtros de Visualização */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Visualização</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedView('full')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedView === 'full'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Comparação Completa
              </button>
              <button
                onClick={() => setSelectedView('ranking')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedView === 'ranking'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Apenas Rankings
              </button>
              <button
                onClick={() => setSelectedView('metrics')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedView === 'metrics'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Métricas Detalhadas
              </button>
            </div>
          </div>
        </motion.div>

        {/* Dica Importante */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8"
        >
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Como interpretar os dados
              </h4>
              <p className="text-sm text-blue-800">
                Os percentis mostram sua posição relativa: se você está no percentil 75%, 
                significa que está melhor que 75% dos usuários. Rankings são atualizados 
                em tempo real e consideram apenas usuários ativos nos últimos 30 dias.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Componente Principal de Comparação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <UserComparisonComponent />
        </motion.div>

        {/* Footer com informações adicionais */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center text-gray-500 text-sm"
        >
          <p>
            Os dados são atualizados automaticamente a cada hora. 
            Para uma comparação mais precisa, certifique-se de ter completado pelo menos 10 simulados.
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}