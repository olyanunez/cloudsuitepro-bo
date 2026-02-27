/**
 * Utilidades para manejo de fechas con NCF
 * Evita problemas de timezone al mostrar fechas que vienen del backend
 */

/**
 * Formatea una fecha ISO para mostrarla sin conversión de timezone
 * Útil para fechas de validUntil/validFrom que deben mostrarse exactamente como están en BD
 * 
 * @param dateString - Fecha en formato ISO (ej: "2026-01-21T00:00:00.000Z")
 * @param locale - Locale para formatear (por defecto 'es-DO')
 * @returns Fecha formateada (ej: "21 ene 2026")
 */
export function formatDateWithoutTimezone(
    dateString: string,
    locale: string = 'es-DO'
): string {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();

    // Crear fecha local con los valores UTC para evitar problemas de timezone
    const localDate = new Date(year, month, day);

    return localDate.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Convierte una fecha ISO a formato YYYY-MM-DD para inputs de fecha
 * Sin conversión de timezone
 * 
 * @param dateString - Fecha en formato ISO
 * @returns Fecha en formato YYYY-MM-DD
 */
export function toDateInputValue(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * Calcula días entre una fecha y hoy
 * @param dateString - Fecha en formato ISO
 * @returns Número de días (positivo si es futuro, negativo si es pasado)
 */
export function daysUntil(dateString: string): number {
    const targetDate = new Date(dateString);
    const now = new Date();

    return Math.ceil(
        (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
}
