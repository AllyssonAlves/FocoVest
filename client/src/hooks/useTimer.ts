import { useState, useEffect, useCallback, useRef } from 'react'

export interface TimerConfig {
  initialTime: number // em segundos
  onTimeUp?: () => void
  onTick?: (timeRemaining: number) => void
  warningThreshold?: number // segundos para mostrar aviso (padrão: 300 = 5 minutos)
  criticalThreshold?: number // segundos para alerta crítico (padrão: 60 = 1 minuto)
}

export interface TimerState {
  timeRemaining: number
  isRunning: boolean
  isPaused: boolean
  isFinished: boolean
  isWarning: boolean
  isCritical: boolean
  elapsedTime: number
  startTime: number | null
  pausedTime: number
}

export interface TimerControls {
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  reset: () => void
  addTime: (seconds: number) => void
  setTime: (seconds: number) => void
}

export function useTimer(config: TimerConfig): [TimerState, TimerControls] {
  const {
    initialTime,
    onTimeUp,
    onTick,
    warningThreshold = 300,
    criticalThreshold = 60
  } = config

  const [state, setState] = useState<TimerState>({
    timeRemaining: initialTime,
    isRunning: false,
    isPaused: false,
    isFinished: false,
    isWarning: false,
    isCritical: false,
    elapsedTime: 0,
    startTime: null,
    pausedTime: 0
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const pauseStartRef = useRef<number | null>(null)

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Timer tick
  useEffect(() => {
    if (state.isRunning && !state.isPaused && !state.isFinished) {
      intervalRef.current = setInterval(() => {
        setState(prevState => {
          const newTimeRemaining = Math.max(0, prevState.timeRemaining - 1)
          const elapsedTime = prevState.startTime 
            ? Math.floor((Date.now() - prevState.startTime - prevState.pausedTime) / 1000)
            : 0

          const isWarning = newTimeRemaining <= warningThreshold && newTimeRemaining > criticalThreshold
          const isCritical = newTimeRemaining <= criticalThreshold && newTimeRemaining > 0
          const isFinished = newTimeRemaining === 0

          // Call callbacks
          if (onTick) {
            // Log apenas a cada 10 segundos para reduzir spam
            if (newTimeRemaining % 10 === 0) {
              console.log('⏰ Timer tick:', newTimeRemaining, 'segundos')
            }
            onTick(newTimeRemaining)
          }
          if (isFinished && onTimeUp) onTimeUp()

          return {
            ...prevState,
            timeRemaining: newTimeRemaining,
            elapsedTime,
            isWarning,
            isCritical,
            isFinished,
            isRunning: !isFinished
          }
        })
      }, 1000)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [state.isRunning, state.isPaused, state.isFinished, onTimeUp, onTick, warningThreshold, criticalThreshold])

  const start = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isRunning: true,
      isPaused: false,
      isFinished: false,
      startTime: Date.now(),
      pausedTime: 0
    }))
  }, [])

  const pause = useCallback(() => {
    if (state.isRunning && !state.isPaused) {
      pauseStartRef.current = Date.now()
      setState(prevState => ({
        ...prevState,
        isPaused: true
      }))
    }
  }, [state.isRunning, state.isPaused])

  const resume = useCallback(() => {
    if (state.isPaused && pauseStartRef.current) {
      const pauseDuration = Date.now() - pauseStartRef.current
      setState(prevState => ({
        ...prevState,
        isPaused: false,
        pausedTime: prevState.pausedTime + pauseDuration
      }))
      pauseStartRef.current = null
    }
  }, [state.isPaused])

  const stop = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isRunning: false,
      isPaused: false,
      isFinished: true
    }))
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      timeRemaining: initialTime,
      isRunning: false,
      isPaused: false,
      isFinished: false,
      isWarning: false,
      isCritical: false,
      elapsedTime: 0,
      startTime: null,
      pausedTime: 0
    })
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [initialTime])

  const addTime = useCallback((seconds: number) => {
    setState(prevState => ({
      ...prevState,
      timeRemaining: Math.max(0, prevState.timeRemaining + seconds)
    }))
  }, [])

  const setTime = useCallback((seconds: number) => {
    setState(prevState => ({
      ...prevState,
      timeRemaining: Math.max(0, seconds)
    }))
  }, [])

  const controls: TimerControls = {
    start,
    pause,
    resume,
    stop,
    reset,
    addTime,
    setTime
  }

  return [state, controls]
}

// Utility functions for formatting time
export const formatTime = (seconds: number, includeHours = true): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (includeHours && hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export const formatTimeVerbose = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const parts: string[] = []
  
  if (hours > 0) {
    parts.push(`${hours}h`)
  }
  
  if (minutes > 0) {
    parts.push(`${minutes}m`)
  }
  
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}s`)
  }
  
  return parts.join(' ')
}

// Timer status helpers
export const getTimerStatus = (timeRemaining: number, warningThreshold = 300, criticalThreshold = 60) => {
  if (timeRemaining === 0) return 'finished'
  if (timeRemaining <= criticalThreshold) return 'critical'
  if (timeRemaining <= warningThreshold) return 'warning'
  return 'normal'
}

export const getTimerColor = (status: string) => {
  switch (status) {
    case 'critical':
      return 'red'
    case 'warning':
      return 'yellow'
    case 'finished':
      return 'gray'
    default:
      return 'green'
  }
}