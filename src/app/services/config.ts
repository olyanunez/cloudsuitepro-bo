// Configuración de la API
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.xotica.com',
  ENDPOINTS: {
    USERS: '/users',
    ROLES: '/roles',
  },
  // Para desarrollo, podemos usar un flag para simular la API
  USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK === 'true' || true,
};
