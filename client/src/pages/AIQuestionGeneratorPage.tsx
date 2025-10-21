import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  SparklesIcon,
  CpuChipIcon,
  BookOpenIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'

interface GeneratedQuestion {
  question: string
  alternatives: string[]
  correctAnswer: number
  explanation: string
  subject: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  university: string
  confidence: number
  generationMethod: 'template' | 'ai_pattern' | 'hybrid'
  id: string // Adicionar ID único para cada questão
  userAnswer?: number // Resposta do usuário
  isAnswered?: boolean // Se o usuário já respondeu
  showResult?: boolean // Se deve mostrar o resultado
}

export default function AIQuestionGeneratorPage() {
  const { token, isAuthenticated } = useAuth()
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form states
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [selectedUniversity, setSelectedUniversity] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('hybrid')
  const [batchCount, setBatchCount] = useState(5)

  const subjects = ['Matemática', 'Física', 'Química', 'Biologia', 'Português', 'História', 'Geografia']
  const difficulties = [
    { value: 'easy', label: 'Fácil' },
    { value: 'medium', label: 'Médio' },
    { value: 'hard', label: 'Difícil' }
  ]
  const universities = ['UFC', 'UECE', 'UVA', 'URCA', 'ENEM']
  const methods = [
    { value: 'template', label: 'Template', description: 'Baseado em modelos predefinidos' },
    { value: 'ai_pattern', label: 'IA Avançada', description: 'Análise de padrões com IA' },
    { value: 'hybrid', label: 'Híbrido', description: 'Combinação inteligente dos métodos' }
  ]

  const generateSingleQuestion = async () => {
    if (!selectedSubject) {
      setError('Selecione uma matéria')
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (!isAuthenticated || !token) {
        setError('Usuário não autenticado')
        return
      }

      const response = await fetch('/api/ai/generate-question', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: selectedSubject,
          topic: selectedTopic || undefined,
          difficulty: selectedDifficulty || undefined,
          university: selectedUniversity || undefined,
          method: selectedMethod
        })
      })

      const data = await response.json()

      if (data.success) {
        const questionWithId = {
          ...data.data.question,
          id: Date.now().toString() + Math.random().toString(36),
          isAnswered: false,
          showResult: false
        }
        setGeneratedQuestions(prev => [questionWithId, ...prev])
      } else {
        setError(data.message || 'Erro ao gerar questão')
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor')
      console.error('Erro ao gerar questão:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateBatchQuestions = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!isAuthenticated || !token) {
        setError('Usuário não autenticado')
        return
      }

      const response = await fetch('/api/ai/generate-question-batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          count: batchCount,
          subjects: selectedSubject ? [selectedSubject] : undefined,
          difficulties: selectedDifficulty ? [selectedDifficulty] : undefined,
          universities: selectedUniversity ? [selectedUniversity] : undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        const questionsWithIds = data.data.questions.map((question: any) => ({
          ...question,
          id: Date.now().toString() + Math.random().toString(36),
          isAnswered: false,
          showResult: false
        }))
        setGeneratedQuestions(prev => [...questionsWithIds, ...prev])
      } else {
        setError(data.message || 'Erro ao gerar lote de questões')
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor')
      console.error('Erro ao gerar lote:', err)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleAnswerQuestion = (questionId: string, answerIndex: number) => {
    setGeneratedQuestions(prev => 
      prev.map(question => 
        question.id === questionId 
          ? { ...question, userAnswer: answerIndex, isAnswered: true }
          : question
      )
    )
  }

  const handleShowResult = (questionId: string) => {
    setGeneratedQuestions(prev => 
      prev.map(question => 
        question.id === questionId 
          ? { ...question, showResult: true }
          : question
      )
    )
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'template': return 'text-blue-600 bg-blue-100'
      case 'ai_pattern': return 'text-purple-600 bg-purple-100'
      case 'hybrid': return 'text-indigo-600 bg-indigo-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <CpuChipIcon className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gerador de Questões IA</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Crie questões personalizadas baseadas em padrões de provas anteriores das universidades 
            usando algoritmos avançados de inteligência artificial.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Painel de Controle */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <SparklesIcon className="w-5 h-5 mr-2 text-purple-600" />
                Configurações
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Matéria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matéria *
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma matéria</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                {/* Tópico */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tópico (opcional)
                  </label>
                  <input
                    type="text"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    placeholder="Ex: Função Quadrática"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Dificuldade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dificuldade
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Automática</option>
                    {difficulties.map(diff => (
                      <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                  </select>
                </div>

                {/* Universidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Universidade
                  </label>
                  <select
                    value={selectedUniversity}
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Todas</option>
                    {universities.map(uni => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>

                {/* Método de Geração */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Geração
                  </label>
                  <div className="space-y-2">
                    {methods.map(method => (
                      <label key={method.value} className="flex items-start cursor-pointer">
                        <input
                          type="radio"
                          name="method"
                          value={method.value}
                          checked={selectedMethod === method.value}
                          onChange={(e) => setSelectedMethod(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className="font-medium text-sm">{method.label}</div>
                          <div className="text-xs text-gray-500">{method.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="space-y-3 pt-4 border-t">
                  <button
                    onClick={generateSingleQuestion}
                    disabled={loading || !selectedSubject}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Gerando...' : 'Gerar Uma Questão'}
                  </button>

                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={batchCount}
                      onChange={(e) => setBatchCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                      min="1"
                      max="10"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center"
                    />
                    <button
                      onClick={generateBatchQuestions}
                      disabled={loading}
                      className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Gerar Lote
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lista de Questões Geradas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <BookOpenIcon className="w-5 h-5 mr-2 text-green-600" />
                Questões Geradas ({generatedQuestions.length})
              </h2>
              {generatedQuestions.length > 0 && (
                <button
                  onClick={() => setGeneratedQuestions([])}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Limpar Todas
                </button>
              )}
            </div>

            {generatedQuestions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma questão gerada ainda
                </h3>
                <p className="text-gray-500">
                  Configure os parâmetros e clique em "Gerar Uma Questão" para começar.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {generatedQuestions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    {/* Header da Questão */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty === 'easy' ? 'Fácil' :
                           question.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(question.generationMethod)}`}>
                          {question.generationMethod === 'template' ? 'Template' :
                           question.generationMethod === 'ai_pattern' ? 'IA' : 'Híbrido'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Confiança: {(question.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {question.university} • {question.subject}
                        {question.topic && ` • ${question.topic}`}
                      </div>
                    </div>

                    {/* Pergunta */}
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-900 mb-2">Questão:</h3>
                      <p className="text-gray-700 leading-relaxed">{question.question}</p>
                    </div>

                    {/* Alternativas */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Alternativas:</h4>
                      <div className="space-y-2">
                        {question.alternatives.map((alt, altIndex) => {
                          const isSelected = question.userAnswer === altIndex
                          const isCorrect = altIndex === question.correctAnswer
                          const showAnswer = question.showResult
                          
                          let buttonStyle = 'border-gray-200 bg-white hover:bg-gray-50'
                          
                          if (showAnswer) {
                            if (isCorrect) {
                              buttonStyle = 'border-green-300 bg-green-50 text-green-800'
                            } else if (isSelected && !isCorrect) {
                              buttonStyle = 'border-red-300 bg-red-50 text-red-800'
                            } else {
                              buttonStyle = 'border-gray-200 bg-gray-50'
                            }
                          } else if (isSelected) {
                            buttonStyle = 'border-blue-300 bg-blue-50 text-blue-800'
                          }

                          return (
                            <button
                              key={altIndex}
                              onClick={() => !question.isAnswered && handleAnswerQuestion(question.id, altIndex)}
                              disabled={question.isAnswered}
                              className={`w-full flex items-center p-3 rounded-md border transition-colors ${buttonStyle} ${
                                question.isAnswered ? 'cursor-default' : 'cursor-pointer'
                              }`}
                            >
                              {showAnswer && isCorrect ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                              ) : showAnswer && isSelected && !isCorrect ? (
                                <XCircleIcon className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                              ) : (
                                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0 ${
                                  isSelected && !showAnswer ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                }`}>
                                  {isSelected && !showAnswer && (
                                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                  )}
                                </div>
                              )}
                              <span className="font-medium mr-3">
                                {String.fromCharCode(65 + altIndex)})
                              </span>
                              <span className={showAnswer && isCorrect ? 'font-medium' : ''}>
                                {alt}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Botão para mostrar resultado */}
                    {question.isAnswered && !question.showResult && (
                      <div className="flex justify-center mb-4">
                        <button
                          onClick={() => handleShowResult(question.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                        >
                          Ver Resultado e Explicação
                        </button>
                      </div>
                    )}

                    {/* Resultado e Explicação (só aparece após o aluno ver o resultado) */}
                    {question.showResult && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pt-4 border-t border-gray-200"
                      >
                        {/* Status da resposta */}
                        <div className={`p-3 rounded-md mb-4 ${
                          question.userAnswer === question.correctAnswer
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          <div className="flex items-center">
                            {question.userAnswer === question.correctAnswer ? (
                              <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                            ) : (
                              <XCircleIcon className="w-5 h-5 text-red-600 mr-2" />
                            )}
                            <span className={`font-medium ${
                              question.userAnswer === question.correctAnswer
                                ? 'text-green-800'
                                : 'text-red-800'
                            }`}>
                              {question.userAnswer === question.correctAnswer
                                ? 'Parabéns! Resposta correta!'
                                : `Resposta incorreta. A alternativa correta é ${String.fromCharCode(65 + question.correctAnswer)}.`
                              }
                            </span>
                          </div>
                        </div>

                        {/* Explicação */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Explicação:</h4>
                          <p className="text-sm text-gray-600">{question.explanation}</p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}