import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Trophy, User, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { ThemeToggleIcon } from '../ThemeToggle'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Trophy className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Foco<span className="text-primary-600">Vest</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/simulations"
                  className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  Simulados
                </Link>
                <Link
                  to="/questions"
                  className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  Questões
                </Link>
                <Link
                  to="/ranking"
                  className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  Ranking
                </Link>
                <Link
                  to="/ai"
                  className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  IA
                </Link>
                
                {/* Theme Toggle */}
                <ThemeToggleIcon />
                
                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400">
                    <User className="w-5 h-5" />
                    <span className="font-medium">{user?.name || 'Usuário'}</span>
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border dark:border-gray-700">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-md"
                    >
                      Meu Perfil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-md flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Theme Toggle for non-authenticated users */}
                <ThemeToggleIcon />
                
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="py-4 space-y-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/simulations"
                    className="block text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Simulados
                  </Link>
                  <Link
                    to="/questions"
                    className="block text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Questões
                  </Link>
                  <Link
                    to="/ranking"
                    className="block text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Ranking
                  </Link>
                  <Link
                    to="/ai"
                    className="block text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    IA
                  </Link>
                  <Link
                    to="/profile"
                    className="block text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Meu Perfil
                  </Link>
                  
                  {/* Theme Toggle for Mobile */}
                  <div className="py-2">
                    <span className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Tema</span>
                    <ThemeToggleIcon />
                  </div>
                  
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="block btn-primary text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cadastrar
                  </Link>
                  
                  {/* Theme Toggle for Mobile (non-authenticated) */}
                  <div className="py-2">
                    <span className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Tema</span>
                    <ThemeToggleIcon />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}