"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Navbar from './Navbar'
import { BranchLoader } from '../providers/BranchLoader'
import { TrialBanner, ExpiredScreen } from '@/components/subscription'
import { useSubscription } from '@/lib/hooks/useSubscription'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { subscription, loading: subLoading, error: subError } = useSubscription()
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

  const blockedStatuses = ['EXPIRED', 'SUSPENDED', 'CANCELLED']
  const isSubscriptionBlocked = (!subLoading && subscription && blockedStatuses.includes(subscription.status)) ||
    (!subLoading && !subscription && subError)
  const allowedPaths = ['/settings/billing', '/settings/subscription']
  const isOnAllowedPath = allowedPaths.some((p) => pathname.startsWith(p))
  const hideChrome = isSubscriptionBlocked && isOnAllowedPath

  return (
    <>
      <ExpiredScreen />
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
        <BranchLoader />
        {!hideChrome && <Navbar />}
        <div className={`${hideChrome ? '' : 'md:ml-16 pt-16'} transition-[margin] duration-200 overflow-x-hidden`}>
          {!hideChrome && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              <TrialBanner />
            </div>
          )}
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
