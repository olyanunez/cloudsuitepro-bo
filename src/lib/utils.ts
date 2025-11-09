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

/**
 * Formatea una fecha a formato legible
 * @param date - La fecha a formatear (string o Date)
 * @returns Fecha formateada como "DD/MM/YYYY HH:mm"
 *
 * @example
 * formatDate("2024-01-15T10:30:00") // "15/01/2024 10:30"
 * formatDate(new Date()) // "15/01/2024 10:30"
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(dateObj);
}
