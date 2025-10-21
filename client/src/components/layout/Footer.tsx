import { Link } from 'react-router-dom'
import { Github, Twitter, Instagram, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-bold">
                Foco<span className="text-primary-400">Vest</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              A plataforma que revoluciona a preparação para vestibulares através de competição saudável e gamificação.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white text-sm">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/simulations" className="text-gray-400 hover:text-white text-sm">
                  Simulados
                </Link>
              </li>
              <li>
                <Link to="/ranking" className="text-gray-400 hover:text-white text-sm">
                  Ranking
                </Link>
              </li>
            </ul>
          </div>

          {/* Universities */}
          <div>
            <h3 className="font-semibold mb-4">Universidades</h3>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">UVA</li>
              <li className="text-gray-400 text-sm">UECE</li>
              <li className="text-gray-400 text-sm">UFC</li>
              <li className="text-gray-400 text-sm">URCA</li>
              <li className="text-gray-400 text-sm">IFCE</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <div className="space-y-2">
              {/*<p className="text-gray-400 text-sm">contato@focovest.com.br</p>*/}
              {/*<p className="text-gray-400 text-sm">+55 (85) 99999-45</p>*/}
              
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/focovest.oficial" className="text-gray-400 hover:text-white">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="mailto:contato@focovest.com.br" className="text-gray-400 hover:text-white">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 FocoVest. Todos os direitos reservados.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm">
              Política de Privacidade
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}