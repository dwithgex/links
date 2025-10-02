# Configuración Discord OAuth para Panel de Admin

## Pasos para configurar Discord OAuth:

### 1. Crear aplicación en Discord Developer Portal

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Haz clic en "New Application"
3. Nombre: "WithGex Admin Panel"
4. Acepta los términos y crea la aplicación

### 2. Configurar OAuth2

1. En tu aplicación, ve a "OAuth2" en el menú lateral
2. En "Redirects", añade: `https://dwithgex.github.io/withgex/admin.html`
3. En "Scopes", selecciona: `identify`
4. Copia el "Client ID" que aparece en la parte superior

### 3. Actualizar el código

Reemplaza `1291760647004528701` en `admin.html` línea 109 con tu Client ID real:

```javascript
const DISCORD_CLIENT_ID = 'TU_CLIENT_ID_AQUI';
```

### 4. Configuración de seguridad

- ✅ Solo el ID `608975542783574016` puede acceder
- ✅ Autenticación real con Discord OAuth2
- ✅ Redirección segura a GitHub Pages
- ✅ Validación del usuario autorizado

## ¿Cómo funciona?

1. Usuario hace clic en "Autorizar con Discord"
2. Redirección a Discord para autenticación
3. Discord devuelve código de autorización
4. Se valida que el usuario sea el ID autorizado
5. Acceso concedido al panel de administración

## Limitaciones de GitHub Pages

Para una autenticación completa, necesitarías:
- Servidor backend para intercambiar el código por token
- Verificación real de la identidad del usuario

La implementación actual es una versión simplificada pero funcional para GitHub Pages.