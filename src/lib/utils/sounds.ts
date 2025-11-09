/**
 * Utilidad para reproducir sonidos del sistema usando Web Audio API
 * Usado principalmente para feedback sonoro en el POS al escanear códigos de barras
 */

// Cache del AudioContext para reutilizar
let audioContext: AudioContext | null = null;

/**
 * Obtiene o crea el AudioContext
 * Reutiliza la misma instancia para mejor performance
 */
const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

/**
 * Reproduce un beep/tono simple
 * @param frequency - Frecuencia en Hz (más alto = más agudo)
 * @param duration - Duración en milisegundos
 * @param volume - Volumen de 0 a 1 (default: 0.3)
 */
export const playBeep = (
  frequency: number,
  duration: number,
  volume: number = 0.3
): void => {
  try {
    const context = getAudioContext();

    // Crear oscilador (genera el tono)
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    // Conectar: oscilador → gain → salida
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Configurar frecuencia y tipo de onda
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine'; // Onda suave

    // Configurar volumen con fade-out suave
    const now = context.currentTime;
    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      now + duration / 1000
    );

    // Iniciar y detener
    oscillator.start(now);
    oscillator.stop(now + duration / 1000);

    // Limpiar recursos después de terminar
    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
  } catch (error) {
    // Silenciosamente ignorar errores de audio
    // Puede fallar en navegadores sin soporte o con autoplay bloqueado
    console.warn('Error reproduciendo beep:', error);
  }
};

/**
 * Beep de ÉXITO - Producto escaneado y agregado al carrito
 * Tono agudo y corto (800Hz, 100ms)
 */
export const playSuccessBeep = (): void => {
  playBeep(800, 100, 0.25);
};

/**
 * Beep de ERROR - Producto no encontrado o error en escaneo
 * Tono grave y largo (400Hz, 200ms)
 */
export const playErrorBeep = (): void => {
  playBeep(400, 200, 0.3);
};

/**
 * Beep de ADVERTENCIA - Múltiples resultados o situación ambigua
 * Tono medio (600Hz, 150ms)
 */
export const playWarningBeep = (): void => {
  playBeep(600, 150, 0.25);
};

/**
 * Beep doble de confirmación - Para acciones importantes
 * (ej: finalizar venta, abrir caja)
 */
export const playDoubleBeep = (): void => {
  playBeep(700, 80, 0.25);
  setTimeout(() => {
    playBeep(700, 80, 0.25);
  }, 120);
};

/**
 * Inicializa el contexto de audio
 * Debe llamarse después de una interacción del usuario (política de autoplay)
 */
export const initAudioContext = (): void => {
  try {
    const context = getAudioContext();
    // Resume el contexto si está suspendido (política de autoplay)
    if (context.state === 'suspended') {
      context.resume();
    }
  } catch (error) {
    console.warn('No se pudo inicializar el audio:', error);
  }
};

/**
 * Verifica si el audio está disponible
 */
export const isAudioAvailable = (): boolean => {
  return !!(window.AudioContext || (window as any).webkitAudioContext);
};

/**
 * Preferencias de sonido (localStorage)
 */
const SOUND_ENABLED_KEY = 'pos_sound_enabled';

export const isSoundEnabled = (): boolean => {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem(SOUND_ENABLED_KEY);
  return saved !== 'false'; // Habilitado por defecto
};

export const setSoundEnabled = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOUND_ENABLED_KEY, enabled.toString());
};

/**
 * Wrapper que respeta la preferencia del usuario
 */
export const playSuccessBeepIfEnabled = (): void => {
  if (isSoundEnabled()) {
    playSuccessBeep();
  }
};

export const playErrorBeepIfEnabled = (): void => {
  if (isSoundEnabled()) {
    playErrorBeep();
  }
};

export const playWarningBeepIfEnabled = (): void => {
  if (isSoundEnabled()) {
    playWarningBeep();
  }
};

export const playDoubleBeepIfEnabled = (): void => {
  if (isSoundEnabled()) {
    playDoubleBeep();
  }
};
