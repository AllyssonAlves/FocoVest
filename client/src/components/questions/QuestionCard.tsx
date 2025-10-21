import { useState } from 'react'
import { Question, Alternative } from '../../types/question'

interface QuestionCardProps {
  question: Question
  showAnswer?: boolean
  selectedAnswer?: string
  onAnswerSelect?: (letter: string) => void
  showExplanation?: boolean
  isAnswered?: boolean
}

export default function QuestionCard({
  question,
  showAnswer = false,
  selectedAnswer,
  onAnswerSelect,
  showExplanation = false,
  isAnswered = false
}: QuestionCardProps) {
  const [userAnswer, setUserAnswer] = useState<string | null>(selectedAnswer || null)

  const handleAnswerClick = (letter: string) => {
    if (isAnswered) return

    setUserAnswer(letter)
    onAnswerSelect?.(letter)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil'
      case 'medium': return 'Médio'
      case 'hard': return 'Difícil'
      default: return difficulty
    }
  }

  const getAlternativeStyle = (alternative: Alternative) => {
    if (!isAnswered && !showAnswer) {
      return userAnswer === alternative.letter
        ? 'bg-primary-50 border-primary-500 text-primary-700'
        : 'bg-white border-gray-200 hover:bg-gray-50'
    }

    // Mostrar resposta após submissão
    if (showAnswer && alternative.isCorrect) {
      return 'bg-green-100 border-green-500 text-green-700'
    }

    if (userAnswer === alternative.letter && !alternative.isCorrect) {
      return 'bg-red-100 border-red-500 text-red-700'
    }

    return 'bg-white border-gray-200'
  }

  return (
    <div className="card space-y-6">
      {/* Cabeçalho da questão */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600">
            {question.university} • {question.examYear}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
            {getDifficultyLabel(question.difficulty)}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {question.subject}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {question.title}
        </h3>
      </div>

      {/* Enunciado */}
      <div className="prose prose-sm max-w-none">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {question.statement}
        </p>
      </div>

      {/* Alternativas */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Alternativas:</h4>
        <div className="space-y-2">
          {question.alternatives.map((alternative) => (
            <button
              key={alternative.letter}
              onClick={() => handleAnswerClick(alternative.letter)}
              disabled={isAnswered}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${getAlternativeStyle(alternative)} ${
                isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                  {alternative.letter}
                </span>
                <span className="text-sm leading-relaxed">
                  {alternative.text}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Explicação */}
      {showExplanation && question.explanation && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Explicação:</h4>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {question.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Tópicos */}
      {question.topics.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Tópicos:</h4>
          <div className="flex flex-wrap gap-2">
            {question.topics.map((topic, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}