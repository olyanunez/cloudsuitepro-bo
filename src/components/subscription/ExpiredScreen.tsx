'use client'

import { useSubscription } from '@/lib/hooks/useSubscription'
import { usePathname } from 'next/navigation'
import { AlertCircle, CreditCard, Mail, Phone, MessageCircle, ArrowRight, LogOut } from 'lucide-react'
import Link from 'next/link'

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'oliverync@gmail.com'
const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE || ''
const SUPPORT_WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || ''

function StatusMessage({ status }: { status: string }) {
  switch (status) {
    case 'EXPIRED':
      return (
        <>
          <h1 className="text-2xl font-bold text-gray-900">Tu periodo de prueba ha finalizado</h1>
          <p className="text-gray-600 mt-2 max-w-md mx-auto">
            Para continuar usando CloudSuite Pro, activa tu suscripcion eligiendo una de las opciones de pago disponibles.
          </p>
        </>
      )
    case 'SUSPENDED':
      return (
        <>
          <h1 className="text-2xl font-bold text-gray-900">Tu suscripcion esta suspendida</h1>
          <p className="text-gray-600 mt-2 max-w-md mx-auto">
            Tu suscripcion fue suspendida por falta de pago. Reactiva tu plan para continuar usando la plataforma.
          </p>
        </>
      )
    case 'CANCELLED':
      return (
        <>
          <h1 className="text-2xl font-bold text-gray-900">Tu suscripcion fue cancelada</h1>
          <p className="text-gray-600 mt-2 max-w-md mx-auto">
            Tu suscripcion ha sido cancelada. Contactanos si deseas reactivar tu cuenta.
          </p>
        </>
      )
    default:
      return (
        <>
          <h1 className="text-2xl font-bold text-gray-900">Tu suscripcion no esta activa</h1>
          <p className="text-gray-600 mt-2 max-w-md mx-auto">
            Necesitas una suscripcion activa para usar CloudSuite Pro.
          </p>
        </>
      )
  }
}

export function ExpiredScreen() {
  const { subscription, loading, error } = useSubscription()

  const pathname = usePathname()

  if (loading) return null

  // Allow access to billing/subscription settings so user can configure PayPal
  const allowedPaths = ['/settings/billing', '/settings/subscription']
  if (allowedPaths.some((p) => pathname.startsWith(p))) {
    return null
  }

  const status = subscription?.status
  const blockedStatuses = ['EXPIRED', 'SUSPENDED', 'CANCELLED']

  // Show screen if: status is blocked, OR subscription failed to load (tenant likely suspended)
  const isBlocked = status && blockedStatuses.includes(status)
  const failedToLoad = !loading && !subscription && error

  if (!isBlocked && !failedToLoad) {
    return null
  }

  const displayStatus = status ?? 'SUSPENDED'

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        {/* Status message */}
        <StatusMessage status={displayStatus} />

        {/* Options */}
        <div className="mt-8 space-y-4">
          {/* PayPal option */}
          <Link
            href="/settings/billing"
            className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-amber-700" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Pagar con PayPal</p>
              <p className="text-sm text-gray-500">Configura tu metodo de pago automatico</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </Link>

          {/* Contact options */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-left">
            <p className="font-semibold text-gray-900 mb-3">Pagar por transferencia o efectivo</p>
            <p className="text-sm text-gray-500 mb-4">
              Contactanos y te activamos tu suscripcion manualmente.
            </p>
            <div className="space-y-2">
              {SUPPORT_EMAIL && (
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=Activar suscripcion CloudSuite Pro`}
                  className="flex items-center gap-3 text-sm text-gray-700 hover:text-amber-700 transition-colors"
                >
                  <Mail className="w-4 h-4 text-gray-400" />
                  {SUPPORT_EMAIL}
                </a>
              )}
              {SUPPORT_PHONE && (
                <a
                  href={`tel:${SUPPORT_PHONE}`}
                  className="flex items-center gap-3 text-sm text-gray-700 hover:text-amber-700 transition-colors"
                >
                  <Phone className="w-4 h-4 text-gray-400" />
                  {SUPPORT_PHONE}
                </a>
              )}
              {SUPPORT_WHATSAPP && (
                <a
                  href={`https://wa.me/${SUPPORT_WHATSAPP.replace(/[^0-9]/g, '')}?text=Hola, quiero activar mi suscripcion de CloudSuite Pro`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-gray-700 hover:text-green-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-gray-400" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Plan info */}
        {subscription?.plan && (
          <p className="mt-6 text-xs text-gray-400">
            Plan: {subscription.plan.name} — Tus datos estan seguros y se mantendran disponibles
          </p>
        )}

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.clear()
            window.location.href = '/login'
          }}
          className="mt-4 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesion
        </button>
      </div>
    </div>
  )
}
