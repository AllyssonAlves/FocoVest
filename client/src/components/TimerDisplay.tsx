import { FC } from 'react'
import {
  ClockIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import { useTimer, TimerConfig, formatTime, getTimerStatus, getTimerColor } from '../hooks/useTimer'

export interface TimerDisplayProps extends TimerConfig {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showControls?: boolean
  showElapsedTime?: boolean
  compact?: boolean
  onStart?: () => void
  onPause?: () => void
  onResume?: () => void
  onStop?: () => void
  onReset?: () => void
}

export const TimerDisplay: FC<TimerDisplayProps> = ({
  className = '',
  size = 'md',
  showControls = true,
  showElapsedTime = false,
  compact = false,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  ...timerConfig
}) => {
  const [timerState, timerControls] = useTimer(timerConfig)

  const status = getTimerStatus(
    timerState.timeRemaining,
    timerConfig.warningThreshold,
    timerConfig.criticalThreshold
  )
  const color = getTimerColor(status)

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'text-sm',
      time: 'text-lg font-mono',
      icon: 'h-4 w-4',
      button: 'p-1',
      spacing: 'space-x-1'
    },
    md: {
      container: 'text-base',
      time: 'text-2xl font-mono',
      icon: 'h-5 w-5',
      button: 'p-2',
      spacing: 'space-x-2'
    },
    lg: {
      container: 'text-lg',
      time: 'text-4xl font-mono',
      icon: 'h-6 w-6',
      button: 'p-3',
      spacing: 'space-x-3'
    },
    xl: {
      container: 'text-xl',
      time: 'text-6xl font-mono',
      icon: 'h-8 w-8',
      button: 'p-4',
      spacing: 'space-x-4'
    }
  }

  const config = sizeConfig[size]

  // Color configurations
  const colorConfig = {
    red: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
      button: 'bg-red-600 hover:bg-red-700'
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-300',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300',
      button: 'bg-green-600 hover:bg-green-700'
    },
    gray: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-300',
      button: 'bg-gray-600 hover:bg-gray-700'
    }
  }

  const colors = colorConfig[color as keyof typeof colorConfig]

  const handleStart = () => {
    timerControls.start()
    onStart?.()
  }

  const handlePause = () => {
    timerControls.pause()
    onPause?.()
  }

  const handleResume = () => {
    timerControls.resume()
    onResume?.()
  }

  const handleStop = () => {
    timerControls.stop()
    onStop?.()
  }

  const handleReset = () => {
    timerControls.reset()
    onReset?.()
  }

  const getStatusIcon = () => {
    if (status === 'critical') {
      return <FireIcon className={`${config.icon} text-red-500 animate-pulse`} />
    }
    if (status === 'warning') {
      return <ExclamationTriangleIcon className={`${config.icon} text-yellow-500`} />
    }
    return <ClockIcon className={`${config.icon}`} />
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center ${config.spacing} px-3 py-1 rounded-lg ${colors.bg} ${colors.border} border ${className}`}>
        {getStatusIcon()}
        <span className={`${config.time} ${colors.text} font-medium`}>
          {formatTime(timerState.timeRemaining, size !== 'sm')}
        </span>
        {showControls && (
          <div className={`flex items-center ${config.spacing}`}>
            {!timerState.isRunning ? (
              <button
                onClick={handleStart}
                className={`${config.button} rounded text-white ${colors.button} transition-colors`}
                title="Iniciar"
              >
                <PlayIcon className={config.icon} />
              </button>
            ) : timerState.isPaused ? (
              <button
                onClick={handleResume}
                className={`${config.button} rounded text-white ${colors.button} transition-colors`}
                title="Continuar"
              >
                <PlayIcon className={config.icon} />
              </button>
            ) : (
              <button
                onClick={handlePause}
                className={`${config.button} rounded text-white ${colors.button} transition-colors`}
                title="Pausar"
              >
                <PauseIcon className={config.icon} />
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`${config.container} ${className}`}>
      {/* Timer Display */}
      <div className={`flex items-center justify-center ${config.spacing} p-6 rounded-lg ${colors.bg} ${colors.border} border`}>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {getStatusIcon()}
            {status === 'critical' && (
              <span className="ml-2 text-sm font-medium text-red-700 animate-pulse">
                TEMPO ESGOTANDO!
              </span>
            )}
            {status === 'warning' && (
              <span className="ml-2 text-sm font-medium text-yellow-700">
                Pouco tempo restante
              </span>
            )}
            {status === 'finished' && (
              <span className="ml-2 text-sm font-medium text-gray-700">
                Tempo esgotado
              </span>
            )}
          </div>
          
          <div className={`${config.time} ${colors.text} font-bold mb-1`}>
            {formatTime(timerState.timeRemaining, size !== 'sm')}
          </div>
          
          {showElapsedTime && (
            <div className="text-sm text-gray-500">
              Decorrido: {formatTime(timerState.elapsedTime, size !== 'sm')}
            </div>
          )}
          
          {timerState.isPaused && (
            <div className="text-sm text-yellow-600 font-medium mt-1">
              PAUSADO
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className={`flex justify-center items-center ${config.spacing} mt-4`}>
          {!timerState.isRunning ? (
            <button
              onClick={handleStart}
              className={`${config.button} rounded-lg text-white ${colors.button} transition-colors flex items-center ${config.spacing}`}
              title="Iniciar cronômetro"
            >
              <PlayIcon className={config.icon} />
              <span>Iniciar</span>
            </button>
          ) : (
            <>
              {timerState.isPaused ? (
                <button
                  onClick={handleResume}
                  className={`${config.button} rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center ${config.spacing}`}
                  title="Continuar cronômetro"
                >
                  <PlayIcon className={config.icon} />
                  <span>Continuar</span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className={`${config.button} rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 transition-colors flex items-center ${config.spacing}`}
                  title="Pausar cronômetro"
                >
                  <PauseIcon className={config.icon} />
                  <span>Pausar</span>
                </button>
              )}
              
              <button
                onClick={handleStop}
                className={`${config.button} rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center ${config.spacing}`}
                title="Parar cronômetro"
              >
                <StopIcon className={config.icon} />
                <span>Parar</span>
              </button>
            </>
          )}
          
          <button
            onClick={handleReset}
            className={`${config.button} rounded-lg text-white bg-gray-600 hover:bg-gray-700 transition-colors flex items-center ${config.spacing}`}
            title="Reiniciar cronômetro"
          >
            <ArrowPathIcon className={config.icon} />
            <span>Reiniciar</span>
          </button>
        </div>
      )}

      {/* Status Messages */}
      {(status === 'warning' || status === 'critical') && (
        <div className={`mt-4 p-3 rounded-lg ${
          status === 'critical' 
            ? 'bg-red-50 border border-red-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className={`flex items-center ${config.spacing} ${
            status === 'critical' ? 'text-red-700' : 'text-yellow-700'
          }`}>
            {status === 'critical' ? (
              <FireIcon className={`${config.icon} animate-pulse`} />
            ) : (
              <ExclamationTriangleIcon className={config.icon} />
            )}
            <span className="text-sm font-medium">
              {status === 'critical' 
                ? `Apenas ${formatTime(timerState.timeRemaining)} restante!`
                : `${formatTime(timerState.timeRemaining)} restante`
              }
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimerDisplay