import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// Tipos
export type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

// Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Provider
interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system',
  storageKey = 'focovest_theme'
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  // Função para detectar preferência do sistema
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  // Função para aplicar o tema
  const applyTheme = (newTheme: Theme) => {
    const root = window.document.documentElement
    
    // Remove classes anteriores
    root.classList.remove('light', 'dark')

    let actualTheme: 'light' | 'dark'
    
    if (newTheme === 'system') {
      actualTheme = getSystemTheme()
    } else {
      actualTheme = newTheme
    }

    // Aplica a nova classe
    root.classList.add(actualTheme)
    setResolvedTheme(actualTheme)
    
    // Salva no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newTheme)
    }
  }

  // Função para definir tema
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    applyTheme(newTheme)
  }

  // Função para alternar tema
  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // Efeito para carregar tema inicial
  useEffect(() => {
    let initialTheme = defaultTheme

    // Tenta carregar do localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(storageKey) as Theme
      if (savedTheme) {
        initialTheme = savedTheme
      }
    }

    setThemeState(initialTheme)
    applyTheme(initialTheme)
  }, [defaultTheme, storageKey])

  // Efeito para monitorar mudanças na preferência do sistema
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = () => {
        const newSystemTheme = getSystemTheme()
        setResolvedTheme(newSystemTheme)
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(newSystemTheme)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook para usar o contexto
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider')
  }
  return context
}

export default ThemeContext