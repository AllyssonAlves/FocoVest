import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, isAuthenticated } = useAuth()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    course: ''
  })

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        university: formData.university || undefined,
        course: formData.course || undefined
      }

      await register(registrationData)
      
      toast.success('Conta criada com sucesso! Bem-vindo ao FocoVest!')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full"
      >
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Criar Conta
            </h1>
            <p className="text-gray-600">
              Junte-se a milhares de estudantes no FocoVest
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome completo
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
                minLength={8}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Universidade de interesse
              </label>
              <select 
                name="university"
                value={formData.university}
                onChange={handleChange}
                className="input"
              >
                <option value="">Selecione uma universidade</option>
                <option value="UFC">UFC</option>
                <option value="UECE">UECE</option>
                <option value="UVA">UVA</option>
                <option value="URCA">URCA</option>
                <option value="IFCE">IFCE</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curso (opcional)
              </label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="input"
                placeholder="Ex: Medicina, Engenharia..."
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}