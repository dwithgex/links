# 🔗 WithGexLink - Gestor de Enlaces con Analytics

Una aplicación web moderna para gestionar enlaces con analytics integrado.

## 🌟 Características

- ✨ Interfaz moderna y responsive
- 📊 Analytics en tiempo real de clicks y visitas
- 🔐 Panel de administración protegido
- 🎨 UI/UX con componentes de shadcn/ui
- ⚡ Construido con React, TypeScript y Express

## 🚀 Demo

[Ver Demo en Vivo](https://tu-app.vercel.app)

## 🛠️ Tecnologías

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, SQLite
- **UI**: shadcn/ui, Radix UI
- **Analytics**: Drizzle ORM
- **Hosting**: Vercel/Netlify compatible

## 📦 Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/WithGexLink.git
   cd WithGexLink
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` con tus valores:
   ```env
   ADMIN_PASSWORD=tu_contraseña_secreta
   SESSION_SECRET=tu_secreto_aleatorio_muy_largo
   NODE_ENV=development
   ```

4. **Configura la base de datos**
   ```bash
   npm run db:push
   ```

5. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

## 🎯 Uso

### Para Usuarios
- Visita la página principal para ver los enlaces disponibles
- Haz click en cualquier enlace para ser redirigido

### Para Administradores
1. Ve a `/admin` para acceder al panel
2. Usa las credenciales configuradas en `.env`
3. Visualiza analytics de clicks y visitas
4. Administra los enlaces y estadísticas

## 🚀 Deploy en Vercel

1. **Sube tu código a GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Conecta con Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub
   - Configura las variables de entorno en Vercel:
     - `ADMIN_PASSWORD`
     - `SESSION_SECRET`
     - `NODE_ENV=production`

3. **Deploy automático**
   - Cada push a main desplegará automáticamente

## 🔒 Seguridad

- El panel de administración está protegido por autenticación
- Las credenciales se configuran mediante variables de entorno
- Las sesiones son seguras con cookies httpOnly
- La base de datos local no se sube a GitHub

## 📊 API Endpoints

### Públicos
- `POST /api/track/visit` - Registra una visita
- `POST /api/track/click` - Registra un click

### Protegidos (requieren autenticación)
- `GET /api/analytics/stats` - Estadísticas generales
- `GET /api/analytics/clicks` - Historial de clicks
- `GET /api/analytics/visits` - Historial de visitas

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 💬 Soporte

¿Tienes alguna pregunta? Abre un [issue](https://github.com/tu-usuario/WithGexLink/issues) en GitHub.

---

⭐ ¡Dale una estrella al proyecto si te resulta útil!

© 2025 WithGex - Powered by Global Tools AI
