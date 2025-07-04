# Xotica - Panel de Administración (Frontend)

## Descripción

Xotica BO es el panel de administración para el sistema Xotica, una aplicación empresarial multi-tenant diseñada para gestionar usuarios, roles y permisos. Este frontend está construido con Next.js 15 y React 19, utilizando tecnologías modernas para ofrecer una experiencia de usuario fluida y responsiva.

## Tecnologías Principales

- **Next.js 15.3.4**: Framework React para renderizado del lado del servidor y generación de sitios estáticos
- **React 19**: Biblioteca para construir interfaces de usuario
- **Redux Toolkit**: Gestión de estado de la aplicación
- **Tailwind CSS**: Framework de utilidades CSS para diseño rápido
- **Radix UI**: Componentes de interfaz accesibles y personalizables

## Características

- **Sistema de autenticación**: Login y registro de usuarios
- **Dashboard**: Panel principal con resumen de información
- **Gestión de usuarios**: Listado, creación, edición y eliminación
- **Gestión de roles**: Administración de permisos y roles
- **Sistema multi-tenant**: Soporte para múltiples empresas/organizaciones
- **Tema claro/oscuro**: Soporte para diferentes preferencias de visualización

## Estructura del Proyecto

```
src/
├── app/               # Rutas y páginas de Next.js
│   ├── (dashboard)/   # Rutas protegidas del dashboard
│   ├── login/         # Página de inicio de sesión
│   └── register/      # Página de registro
├── components/        # Componentes reutilizables
├── lib/              # Utilidades, servicios y tipos
└── types/            # Definiciones de tipos TypeScript
```

## Requisitos Previos

- Node.js 18.x o superior
- npm 9.x o superior

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/olyanunez/xotica-bo.git
   cd xotica-bo
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Copia el archivo de variables de entorno y configúralo:
   ```bash
   cp env.example .env
   ```

## Ejecución

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

### Producción

```bash
npm run build
npm start
```

## Despliegue

La forma más sencilla de desplegar esta aplicación es utilizando [Vercel](https://vercel.com), la plataforma de los creadores de Next.js.

```bash
npm install -g vercel
vercel
```

## Conexión con el Backend

Este frontend está diseñado para trabajar con el backend Xotica BE. Asegúrate de configurar correctamente la URL del backend en el archivo `.env`.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.
