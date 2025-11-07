import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un monto como moneda dominicana (RD$)
 * @param amount - El monto a formatear (puede ser string o number)
 * @returns Monto formateado como RD$1,200.00
 *
 * @example
 * formatCurrency(1200) // "RD$1,200.00"
 * formatCurrency("1200.5") // "RD$1,200.50"
 * formatCurrency(0) // "RD$0.00"
 */
export function formatCurrency(amount: string | number | null | undefined): string {
  // Convertir a número, manejando valores nulos o indefinidos
  const numericAmount = amount ? parseFloat(amount.toString()) : 0;

  // Verificar si es un número válido
  if (isNaN(numericAmount)) {
    return "RD$0.00";
  }

  // Formatear con separadores de miles y dos decimales
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}
