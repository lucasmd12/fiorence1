// ARQUIVO: src/static/src/components/Sidebar.jsx (MODIFICADO)

import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ArrowUpDown, 
  FolderOpen, 
  BarChart3, 
  Building2, 
  User,
  ChevronLeft,
  ChevronRight,
  Upload,
  LogOut // 1. Importe o ícone de Sair
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'

// 2. Adicione a prop 'onLogout' que vem do App.jsx
const Sidebar = ({ isOpen, setIsOpen, currentContext, setCurrentContext, onLogout }) => {
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/transactions', icon: ArrowUpDown, label: 'Lançamentos' },
    { path: '/import', icon: Upload, label: 'Importação' },
    { path: '/categories', icon: FolderOpen, label: 'Categorias' },
    { path: '/reports', icon: BarChart3, label: 'Relatórios' },
  ]

  const isActive = (path) => location.pathname === path || (path === '/dashboard' && location.pathname === '/')

  return (
    // A div principal agora é um flex container para empurrar o logout para baixo
    <div className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      
      {/* Parte Superior (Logo, Contexto, Navegação) */}
      <div className="flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {isOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CR</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">Contabilidade</span>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isOpen ? (
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Context Indicator */}
        {isOpen && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-sm">
              {currentContext === 'business' ? (
                <>
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-700 dark:text-gray-300">Modo Empresarial</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Modo Pessoal</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${
                  isActive(item.path) 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`} />
                {isOpen && (
                  <span className={`font-medium ${
                    isActive(item.path) 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Parte Inferior (Theme Toggle, Logout, Footer) - mt-auto empurra para baixo */}
      <div className="mt-auto">
        {/* Theme Toggle */}
        <ThemeToggle isOpen={isOpen} />

        {/* 3. Botão de Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onLogout}
            className={`flex items-center w-full space-x-3 px-3 py-2.5 rounded-lg transition-colors text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}
          >
            <LogOut className="w-5 h-5" />
            {isOpen && (
              <span className="font-medium">Sair</span>
            )}
          </button>
        </div>

        {/* Footer */}
        {isOpen && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Fiorence Contabilidade
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar
