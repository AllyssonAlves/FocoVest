import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { 
  EyeIcon, 
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  university: string
  course: string
  graduationYear: string
  acceptTerms: boolean
}

interface FormErrors {
  [key: string]: string
}

interface PasswordValidation {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
}

export default function ImprovedRegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, isAuthenticated } = useAuth()
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    course: '',
    graduationYear: '',
    acceptTerms: false
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  // Validação de senha em tempo real
  const passwordValidation: PasswordValidation = useMemo(() => {
    const password = formData.password
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password)
    }
  }, [formData.password])

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== ''

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  // Validação de campos
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Nome é obrigatório'
        if (value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres'
        if (value.trim().length > 100) return 'Nome deve ter no máximo 100 caracteres'
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return 'Nome deve conter apenas letras e espaços'
        return ''
      
      case 'email':
        if (!value.trim()) return 'Email é obrigatório'
        if (!/^\S+@\S+\.\S+$/.test(value)) return 'Email deve ter um formato válido'
        if (value.length > 255) return 'Email muito longo'
        return ''
      
      case 'password':
        if (!value) return 'Senha é obrigatória'
        if (!isPasswordValid) return 'Senha não atende aos critérios de segurança'
        return ''
      
      case 'confirmPassword':
        if (!value) return 'Confirmação de senha é obrigatória'
        if (value !== formData.password) return 'Senhas não coincidem'
        return ''
      
      case 'university':
        if (!value && formData.course) return 'Selecione uma universidade se informar o curso'
        return ''
      
      case 'graduationYear':
        if (value) {
          const year = parseInt(value)
          const currentYear = new Date().getFullYear()
          if (year < currentYear || year > currentYear + 10) {
            return `Ano deve estar entre ${currentYear} e ${currentYear + 10}`
          }
        }
        return ''
      
      case 'acceptTerms':
        if (!formData.acceptTerms) return 'Você deve aceitar os termos de uso'
        return ''
      
      default:
        return ''
    }
  }

  // Validar todos os campos
  const validateForm = (): FormErrors => {
    const errors: FormErrors = {}
    Object.keys(formData).forEach(key => {
      const error = validateField(key, (formData as any)[key])
      if (error) errors[key] = error
    })
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Marcar todos os campos como tocados
    setTouchedFields(new Set(Object.keys(formData)))
    
    const errors = validateForm()
    setFormErrors(errors)
    
    if (Object.keys(errors).length > 0) {
      setIsSubmitting(false)
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    try {
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        university: formData.university || undefined,
        course: formData.course.trim() || undefined,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined
      }

      await register(registrationData)
      
      toast.success('Conta criada com sucesso! Bem-vindo ao FocoVest!', {
        duration: 4000,
        icon: '🎉'
      })
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Erro no registro:', error)
      
      // Tratamento específico de erros
      if (error.message.includes('Email já está em uso')) {
        setFormErrors({ email: 'Este email já está em uso' })
        toast.error('Este email já está cadastrado')
      } else if (error.message.includes('rate limit') || error.message.includes('Muitas tentativas')) {
        toast.error('Muitas tentativas de cadastro. Aguarde alguns minutos.')
      } else {
        toast.error(error.message || 'Erro ao criar conta. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Validar campo em tempo real se já foi tocado
    if (touchedFields.has(name)) {
      const error = validateField(name, type === 'checkbox' ? String(checked) : value)
      setFormErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setTouchedFields(prev => new Set(prev).add(name))
    
    const error = validateField(name, value)
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }

  const currentYear = new Date().getFullYear()
  const graduationYears = Array.from({ length: 11 }, (_, i) => currentYear + i)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-lg w-full"
      >
        <div className="card">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <AcademicCapIcon className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Criar Conta
            </h1>
            <p className="text-gray-600">
              Junte-se a milhares de estudantes no FocoVest
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Nome completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="w-4 h-4 inline mr-1" />
                Nome completo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input ${formErrors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Seu nome completo"
                required
                maxLength={100}
              />
              <AnimatePresence>
                {formErrors.name && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-sm mt-1 flex items-center"
                  >
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    {formErrors.name}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input ${formErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="seu@email.com"
                required
                maxLength={255}
              />
              <AnimatePresence>
                {formErrors.email && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-sm mt-1 flex items-center"
                  >
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    {formErrors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <LockClosedIcon className="w-4 h-4 inline mr-1" />
                Senha *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input pr-10 ${formErrors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="••••••••"
                  required
                  maxLength={128}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* Critérios de senha */}
              {formData.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 space-y-1"
                >
                  <div className="text-xs space-y-1">
                    <div className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                      {passwordValidation.minLength ? (
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircleIcon className="w-3 h-3 mr-1" />
                      )}
                      Pelo menos 8 caracteres
                    </div>
                    <div className={`flex items-center ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                      {passwordValidation.hasUppercase ? (
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircleIcon className="w-3 h-3 mr-1" />
                      )}
                      Uma letra maiúscula
                    </div>
                    <div className={`flex items-center ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                      {passwordValidation.hasLowercase ? (
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircleIcon className="w-3 h-3 mr-1" />
                      )}
                      Uma letra minúscula
                    </div>
                    <div className={`flex items-center ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                      {passwordValidation.hasNumber ? (
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircleIcon className="w-3 h-3 mr-1" />
                      )}
                      Um número
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Confirmar senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <LockClosedIcon className="w-4 h-4 inline mr-1" />
                Confirmar senha *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input pr-10 ${formErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : passwordsMatch && formData.confirmPassword ? 'border-green-500 focus:ring-green-500' : ''}`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              <AnimatePresence>
                {formErrors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-sm mt-1 flex items-center"
                  >
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    {formErrors.confirmPassword}
                  </motion.p>
                )}
                {passwordsMatch && formData.confirmPassword && !formErrors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-green-500 text-sm mt-1 flex items-center"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Senhas coincidem
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Universidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AcademicCapIcon className="w-4 h-4 inline mr-1" />
                Universidade de interesse (opcional)
              </label>
              <select
                name="university"
                value={formData.university}
                onChange={handleChange}
                onBlur={handleBlur}
                className="input"
              >
                <option value="">Selecione uma universidade</option>
                <option value="ENEM">ENEM</option>
                <option value="UFC">UFC - Universidade Federal do Ceará</option>
                <option value="UECE">UECE - Universidade Estadual do Ceará</option>
                <option value="UVA">UVA - Universidade Estadual Vale do Acaraú</option>
                <option value="URCA">URCA - Universidade Regional do Cariri</option>
                <option value="IFCE">IFCE - Instituto Federal do Ceará</option>
              </select>
              <AnimatePresence>
                {formErrors.university && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-sm mt-1 flex items-center"
                  >
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    {formErrors.university}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Curso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpenIcon className="w-4 h-4 inline mr-1" />
                Curso (opcional)
              </label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                onBlur={handleBlur}
                className="input"
                placeholder="Ex: Medicina, Engenharia, Direito..."
                maxLength={100}
              />
            </div>

            {/* Ano de graduação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                Ano de graduação previsto (opcional)
              </label>
              <select
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                onBlur={handleBlur}
                className="input"
              >
                <option value="">Selecione o ano</option>
                {graduationYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <AnimatePresence>
                {formErrors.graduationYear && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-sm mt-1 flex items-center"
                  >
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    {formErrors.graduationYear}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Termos de uso */}
            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className={`mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 ${formErrors.acceptTerms ? 'border-red-500' : ''}`}
                  required
                />
                <span className="ml-2 text-sm text-gray-700">
                  Eu concordo com os{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-700 underline">
                    Termos de Uso
                  </Link>{' '}
                  e{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-700 underline">
                    Política de Privacidade
                  </Link>{' '}
                  *
                </span>
              </label>
              <AnimatePresence>
                {formErrors.acceptTerms && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-sm mt-1 flex items-center"
                  >
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    {formErrors.acceptTerms}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Botão de submissão */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className={`btn-primary w-full py-3 text-lg font-semibold transition-all duration-200 ${
                isSubmitting || isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:transform hover:scale-[1.02]'
              }`}
            >
              {isSubmitting || isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Criando conta...
                </div>
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          {/* Link para login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-600">
              Já tem uma conta?{' '}
              <Link 
                to="/login" 
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                Faça login
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}