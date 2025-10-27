import { useTheme } from '../contexts/ThemeContext'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

interface ThemeToggleProps {
  showLabel?: boolean
  variant?: 'button' | 'dropdown' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function ThemeToggle({ 
  showLabel = false, 
  variant = 'button',
  size = 'md',
  className = ''
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  if (variant === 'icon') {
    return (
      <motion.button
        onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
        className={`
          ${sizeClasses[size]} 
          rounded-lg border border-gray-300 dark:border-gray-600 
          bg-white dark:bg-gray-800 
          text-gray-700 dark:text-gray-200
          hover:bg-gray-50 dark:hover:bg-gray-700
          focus:ring-2 focus:ring-primary-500 focus:border-transparent
          transition-all duration-200
          flex items-center justify-center
          ${className}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={`Alternar para modo ${resolvedTheme === 'light' ? 'escuro' : 'claro'}`}
      >
        {resolvedTheme === 'light' ? (
          <MoonIcon className={iconSizes[size]} />
        ) : (
          <SunIcon className={iconSizes[size]} />
        )}
      </motion.button>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <select
          id="theme-selector"
          name="themeSelector"
          value={theme}
          onChange={(e) => setTheme(e.target.value as any)}
          className="
            block w-full px-3 py-2 border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100
            rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-colors duration-200
          "
        >
          <option value="light">🌞 Claro</option>
          <option value="dark">🌙 Escuro</option>
          <option value="system">💻 Sistema</option>
        </select>
      </div>
    )
  }

  // variant === 'button' (default)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 transition-colors duration-200">
        {[
          { value: 'light', icon: SunIcon, label: 'Claro' },
          { value: 'dark', icon: MoonIcon, label: 'Escuro' },
          { value: 'system', icon: ComputerDesktopIcon, label: 'Sistema' }
        ].map(({ value, icon: Icon, label }) => (
          <motion.button
            key={value}
            onClick={() => setTheme(value as any)}
            className={`
              px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
              flex items-center gap-2
              ${theme === value 
                ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon className="w-4 h-4" />
            {showLabel && <span>{label}</span>}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// Componente simples para casos onde só precisa do ícone
export function ThemeToggleIcon({ className = '' }: { className?: string }) {
  return <ThemeToggle variant="icon" className={className} />
}

// Componente para dropdown
export function ThemeDropdown({ className = '' }: { className?: string }) {
  return <ThemeToggle variant="dropdown" showLabel className={className} />
}