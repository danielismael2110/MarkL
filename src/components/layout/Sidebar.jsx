import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext' 
import './css/sidebar.css'
const Sidebar = ({ isOpen, onClose, menuItems, user, profile, onSignOut }) => {
  const location = useLocation()
  const { darkMode } = useTheme() 
  return (
    <>
      {}
      {isOpen && (
        <div className={`fixed inset-0 flex z-40 lg:hidden ${darkMode ? 'dark-mode' : ''}`}>
          <div className="fixed inset-0">
            <div 
              className={`absolute inset-0 ${darkMode ? 'bg-gray-900 opacity-90' : 'bg-gray-600 opacity-75'}`} 
              onClick={onClose}
            ></div>
          </div>
          
          {}
          <div className={`relative flex-1 flex flex-col max-w-xs w-full ${
            darkMode ? 'bg-gray-800' : 'bg-blue-800'
          }`}>
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className={`ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset ${
                  darkMode ? 'focus:ring-gray-400' : 'focus:ring-white'
                }`}
                onClick={onClose}
              >
                <span className="sr-only">Cerrar sidebar</span>
                <svg className={`h-6 w-6 ${darkMode ? 'text-gray-300' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-white'}`}>
                  MarkLicor Admin
                </h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition ${
                      location.pathname === item.path
                        ? darkMode 
                          ? 'bg-gray-700 text-white' 
                          : 'bg-blue-900 text-white'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }`}
                    onClick={onClose}
                  >
                    <span className="mr-4 text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            
            {user && (
              <div className={`flex-shrink-0 flex border-t p-4 ${
                darkMode ? 'border-gray-700' : 'border-blue-700'
              }`}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                      darkMode ? 'bg-gray-600 text-gray-100' : 'bg-blue-600 text-white'
                    }`}>
                      {profile?.nombre_completo?.charAt(0) || 'U'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      darkMode ? 'text-gray-100' : 'text-white'
                    }`}>
                      {profile?.nombre_completo}
                    </p>
                    <button
                      onClick={onSignOut}
                      className={`text-xs font-medium hover:text-white ${
                        darkMode ? 'text-gray-400' : 'text-blue-200'
                      }`}
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0 w-14">
            {}
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar