'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from './Layout/Sidebar'
import Navbar from './Layout/Navbar'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'

function CMSLayoutContent({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme } = useTheme()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('cmsAuth')
      
      // If not authenticated and not on login page, redirect to login
      if (!authStatus && pathname !== '/cms') {
        router.push('/cms')
        setIsLoading(false)
        return
      }
      
      setIsAuthenticated(!!authStatus)
      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
        </div>
      </div>
    )
  }

  // If on login page or not authenticated, don't show sidebar/navbar
  if (pathname === '/cms' || !isAuthenticated) {
    return <>{children}</>
  }

  // Show full layout with sidebar and navbar for authenticated pages
  return (
    <div className={`flex h-screen overflow-hidden ${
      theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'
    }`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto p-6 ${
          theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'
        }`}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default function CMSLayout({ children }) {
  return (
    <ThemeProvider>
      <CMSLayoutContent>{children}</CMSLayoutContent>
    </ThemeProvider>
  )
}

