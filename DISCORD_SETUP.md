# 🔐 Configuración de Discord OAuth

Para configurar la autenticación con Discord, necesitas crear una aplicación en Discord Developer Portal:

## 📝 Pasos para configurar Discord OAuth:

### 1. **Crear aplicación en Discord**
1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Haz click en "New Application"
3. Dale un nombre a tu aplicación (ej: "WithGexLink Admin")
4. Acepta los términos y crea la aplicación

### 2. **Configurar OAuth2**
1. En el menú lateral, ve a **"OAuth2"** → **"General"**
2. Copia el **Client ID** y **Client Secret**
3. En **"Redirects"**, agrega: `http://localhost:3001/auth/discord/callback`
4. Para producción, agrega también: `https://tu-dominio.com/auth/discord/callback`

### 3. **Actualizar variables de entorno**
Edita tu archivo `.env` y reemplaza:

```env
# Discord OAuth (OBLIGATORIO para acceso al panel)
DISCORD_CLIENT_ID=tu_client_id_aqui
DISCORD_CLIENT_SECRET=tu_client_secret_aqui
DISCORD_REDIRECT_URI=http://localhost:3001/auth/discord/callback
AUTHORIZED_DISCORD_ID=608975542783574016
```

### 4. **Obtener tu Discord ID**
1. Abre Discord
2. Ve a **Configuración de Usuario** → **Avanzado**
3. Activa **"Modo desarrollador"**
4. Haz click derecho en tu perfil → **"Copiar ID"**
5. Reemplaza `608975542783574016` con tu ID real

### 5. **Reiniciar el servidor**
```bash
# Detener el servidor actual (Ctrl+C)
# Luego reiniciar:
npx tsx --env-file=.env server/index.ts
```

## 🎯 **Cómo funciona:**

1. **Usuario va a:** `/admin`
2. **Ve botón:** "Autorizar con Discord"
3. **Hace click:** Se redirige a Discord
4. **Autoriza:** Discord redirige de vuelta
5. **Sistema verifica:** Si el Discord ID coincide con `AUTHORIZED_DISCORD_ID`
6. **Si coincide:** Acceso concedido al dashboard
7. **Si no coincide:** Acceso denegado

## ⚠️ **Importante:**
- Solo el usuario con el Discord ID especificado puede acceder
- Las credenciales de Discord nunca se almacenan en el código
- La autenticación es segura usando OAuth2
- Funciona tanto en local como en producción

## 🔧 **Para GitHub/Producción:**
Cuando subas a GitHub, asegúrate de:
1. **NO** subir el archivo `.env`
2. Configurar las variables de entorno en Vercel/Netlify
3. Actualizar `DISCORD_REDIRECT_URI` con tu dominio real