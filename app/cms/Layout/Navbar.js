'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from '../contexts/ThemeContext'

const Navbar = () => {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  // Get page title based on current route
  const getPageTitle = () => {
    const path = pathname.split('/').pop()
    if (!path || path === 'cms') return 'Dashboard'
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ')
  }

  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <nav className={`border-b px-6 py-4 ${
      theme === 'dark' 
        ? 'bg-gray-900 border-gray-800' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div>
          <h1 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{getPageTitle()}</h1>
          <p className={`text-sm mt-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>{getCurrentTime()}</p>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
         

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300'
                : 'text-indigo-600 hover:bg-indigo-500/10 hover:text-indigo-700'
            }`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          

         
        </div>
      </div>
    </nav>
  )
}

export default Navbar

