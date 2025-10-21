interface PercentileBarProps {
  percentile: number
  label?: string
  value?: number
  className?: string
  showTooltip?: boolean
}

export default function PercentileBar({ 
  percentile, 
  label, 
  value, 
  className = '',
  showTooltip = true 
}: PercentileBarProps) {
  const getColor = (percentile: number) => {
    if (percentile >= 90) return 'from-green-500 to-emerald-500'
    if (percentile >= 75) return 'from-blue-500 to-cyan-500'
    if (percentile >= 50) return 'from-yellow-500 to-amber-500'
    if (percentile >= 25) return 'from-orange-500 to-red-500'
    return 'from-red-500 to-pink-500'
  }

  const getTextColor = (percentile: number) => {
    if (percentile >= 90) return 'text-green-700'
    if (percentile >= 75) return 'text-blue-700'
    if (percentile >= 50) return 'text-yellow-700'
    if (percentile >= 25) return 'text-orange-700'
    return 'text-red-700'
  }

  const getCategory = (percentile: number) => {
    if (percentile >= 90) return 'Excelente'
    if (percentile >= 75) return 'Acima da Média'
    if (percentile >= 50) return 'Média'
    if (percentile >= 25) return 'Abaixo da Média'
    return 'Precisa Melhorar'
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex justify-between items-center mb-2">
        {label && (
          <span className="text-sm font-medium text-gray-700">{label}</span>
        )}
        <div className="flex items-center space-x-2">
          {value !== undefined && (
            <span className="text-sm font-semibold text-gray-900">{value}</span>
          )}
          <span className={`text-sm font-bold ${getTextColor(percentile)}`}>
            {percentile.toFixed(1)}%
          </span>
        </div>
      </div>
      
      <div className="relative">
        {/* Background bar */}
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          {/* Progress bar */}
          <div 
            className={`h-full bg-gradient-to-r ${getColor(percentile)} transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(percentile, 100)}%` }}
          />
        </div>
        
        {/* Percentile marker */}
        <div 
          className="absolute top-0 w-1 h-3 bg-white border-2 border-gray-600 rounded-sm shadow-sm"
          style={{ left: `calc(${Math.min(percentile, 100)}% - 2px)` }}
        />
      </div>

      {/* Category and tooltip */}
      <div className="flex justify-between items-center mt-2">
        <span className={`text-xs font-medium ${getTextColor(percentile)}`}>
          {getCategory(percentile)}
        </span>
        {showTooltip && (
          <span className="text-xs text-gray-500">
            Melhor que {(100 - percentile).toFixed(0)}% dos usuários
          </span>
        )}
      </div>

      {/* Percentile scale indicators */}
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  )
}