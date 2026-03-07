'use client';

import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, CreditCard } from 'lucide-react';
import { getAuthToken } from '@/lib/services/apiService';

// Tipos
interface PayPalSubscriptionButtonProps {
    subscriptionId: number;
    onSuccess?: (subscriptionId: string) => void;
    onError?: (error: any) => void;
    onCancel?: () => void;
}

// Componente interno para manejar PayPal con 3D Secure
function PayPalContent({
    subscriptionId,
    onSuccess,
    onError,
    onCancel,
}: PayPalSubscriptionButtonProps) {
    const [loading, setLoading] = useState(false);
    const [createdPayPalId, setCreatedPayPalId] = useState<string | null>(null);
    const [{ isPending }] = usePayPalScriptReducer();

    const handleCreateSubscription = async (data: any, actions: any) => {
        setLoading(true);
        try {
            const token = getAuthToken();

            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            // Llamar al backend para crear la suscripción de PayPal
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/paypal/create-subscription/${subscriptionId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        returnUrl: `${window.location.origin}/dashboard?subscription=success`,
                        cancelUrl: `${window.location.origin}/dashboard?subscription=cancelled`,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear la suscripción');
            }

            const result = await response.json();
            const paypalSubId = result.paypalSubscriptionId;
            setCreatedPayPalId(paypalSubId);
            return paypalSubId;
        } catch (error: any) {
            console.error('Error creando suscripción:', error);
            toast.error(error.message || 'Error al procesar el pago');
            if (onError) onError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (data: any, actions: any) => {
        try {
            toast.success('¡Suscripción activada exitosamente!');
            if (onSuccess) onSuccess(data.subscriptionID);

            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 2000);
        } catch (error: any) {
            console.error('Error al aprobar suscripción:', error);
            toast.error('Error al activar la suscripción');
            if (onError) onError(error);
        }
    };

    const handleError = (error: any) => {
        console.error('Error en PayPal:', error);
        toast.error('Error al procesar el pago con PayPal');
        if (onError) onError(error);
    };

    const handleCancel = async () => {
        toast.error('Pago cancelado');

        // Limpiar la suscripción de PayPal creada
        if (createdPayPalId) {
            try {
                const token = getAuthToken();
                if (token) {
                    await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/paypal/cancel-subscription/${subscriptionId}`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                }
            } catch (error) {
                console.error('Error limpiando suscripción cancelada:', error);
                // No mostrar error al usuario, es limpieza interna
            }
        }

        if (onCancel) onCancel();
    };

    if (isPending) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                    </div>
                )}

                <PayPalButtons
                    style={{
                        layout: 'vertical',
                        color: 'gold',
                        shape: 'rect',
                        label: 'subscribe',
                        height: 45,
                    }}
                    createSubscription={handleCreateSubscription}
                    onApprove={handleApprove}
                    onError={handleError}
                    onCancel={handleCancel}
                    // Forzar verificación 3D Secure cuando esté disponible
                    forceReRender={[subscriptionId]}
                />
            </div>

            {/* Información sobre métodos de pago */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">
                            Pago con tarjeta incluye verificación de seguridad
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                            Si tu tarjeta requiere verificación adicional (3D Secure),
                            recibirás un código en tu teléfono registrado con tu banco.
                        </p>
                    </div>
                </div>
            </div>

            {/* Información adicional */}
            <div className="mt-4 text-center text-sm text-gray-600">
                <p className="mb-2">💳 Métodos de pago aceptados:</p>
                <ul className="space-y-1 text-xs">
                    <li>✅ Cuenta de PayPal</li>
                    <li>✅ Tarjeta de crédito o débito</li>
                    <li>✅ Verificación 3D Secure (si tu banco lo requiere)</li>
                </ul>
                <p className="mt-3 text-xs text-gray-500">
                    🔒 Transacciones seguras procesadas por PayPal
                </p>
            </div>
        </div>
    );
}

export function PayPalSubscriptionButton({
    subscriptionId,
    onSuccess,
    onError,
    onCancel,
}: PayPalSubscriptionButtonProps) {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    if (!clientId) {
        console.error('NEXT_PUBLIC_PAYPAL_CLIENT_ID no está configurado');
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                Error de configuración: No se pudo cargar el sistema de pagos.
                Por favor contacte a soporte.
            </div>
        );
    }

    return (
        <div className="w-full">
            <PayPalScriptProvider
                options={{
                    clientId: clientId,
                    vault: true,
                    intent: 'subscription',
                    currency: 'USD',
                }}
            >
                <PayPalContent
                    subscriptionId={subscriptionId}
                    onSuccess={onSuccess}
                    onError={onError}
                    onCancel={onCancel}
                />
            </PayPalScriptProvider>
        </div>
    );
}
