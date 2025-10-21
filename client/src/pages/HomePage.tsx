import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Trophy, Users, Target, BookOpen } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Foco<span className="text-secondary-400">Vest</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              A plataforma de simulados que te prepara para o ENEM e vestibulares UVA, UECE, UFC, URCA e IFCE
            </p>
            <p className="text-lg mb-10 text-primary-200">
              Compete com outros estudantes, acompanhe seu progresso e conquiste sua vaga na universidade dos seus sonhos!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transform hover:scale-105 transition-transform"
              >
                Começar Agora
              </Link>
              <Link
                to="/login"
                className="btn-secondary px-8 py-4 text-lg font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                Fazer Login
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o FocoVest?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma oferece tudo que você precisa para se preparar da melhor forma
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'Banco de Questões',
                description: 'Milhares de questões atualizadas dos vestibulares mais concorridos'
              },
              {
                icon: Target,
                title: 'Simulados Personalizados',
                description: 'Crie simulados por matéria, universidade ou assunto específico'
              },
              {
                icon: Users,
                title: 'Competição Saudável',
                description: 'Rankings e desafios para estimular seus estudos'
              },
              {
                icon: Trophy,
                title: 'Acompanhamento',
                description: 'Relatórios detalhados do seu progresso e evolução'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                className="card text-center hover:shadow-lg transition-shadow"
              >
                <feature.icon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Universities Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Prepare-se para o ENEM e as melhores universidades
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Questões e simulados focados no ENEM e nos vestibulares mais concorridos do Ceará
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 items-center justify-items-center">
            {['ENEM', 'UVA', 'UECE', 'UFC', 'URCA', 'IFCE'].map((university) => (
              <motion.div
                key={university}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="card w-full aspect-square flex items-center justify-center hover:shadow-lg transition-shadow"
              >
                <span className="text-2xl font-bold text-primary-600">{university}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Pronto para começar sua jornada?
            </h2>
            <p className="text-xl mb-8 text-secondary-100">
              Junte-se a milhares de estudantes que já estão se preparando no FocoVest
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-secondary-600 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all"
            >
              Criar Conta Gratuita
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}