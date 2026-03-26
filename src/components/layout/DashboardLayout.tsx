"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from './Navbar'
import { BranchLoader } from '../providers/BranchLoader'
import { TrialBanner } from '@/components/subscription'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Asegurarse de que estamos en el cliente antes de acceder a localStorage
    if (typeof window !== 'undefined') {
      // Verificar si el usuario está autenticado
      const isLoggedIn = localStorage.getItem('auth_token')
      
      if (!isLoggedIn) {
        // Redirigir al login si no está autenticado
        router.push('/login')
      } else {
        setIsLoading(false)
      }
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <BranchLoader />
      <Navbar />
      <div className="md:ml-16 transition-[margin] duration-200 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <TrialBanner />
        </div>
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
