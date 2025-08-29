import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Transactions from './components/Transactions'
import Categories from './components/Categories'
import Reports from './components/Reports'
import VoiceCommand from './components/VoiceCommand'
import './App.css'

function App() {
  const [currentContext, setCurrentContext] = useState('business') // 'business' or 'personal'
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen}
          currentContext={currentContext}
          setCurrentContext={setCurrentContext}
        />
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Contabilidade Rezende
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Context Switcher */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setCurrentContext('business')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentContext === 'business'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Empresarial
                  </button>
                  <button
                    onClick={() => setCurrentContext('personal')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentContext === 'personal'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Pessoal
                  </button>
                </div>
                
                {/* Voice Command Button */}
                <VoiceCommand context={currentContext} />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard context={currentContext} />} />
              <Route path="/dashboard" element={<Dashboard context={currentContext} />} />
              <Route path="/transactions" element={<Transactions context={currentContext} />} />
              <Route path="/categories" element={<Categories context={currentContext} />} />
              <Route path="/reports" element={<Reports context={currentContext} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App

