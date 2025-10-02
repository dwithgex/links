# 🔧 Solución al error "redirect_url de OAuth2 no válido"

## ❌ **Error actual:**
```
redirect_url de OAuth2 no válido
```

## ✅ **Solución paso a paso:**

### 1. **Ve a Discord Developer Portal**
🔗 [https://discord.com/developers/applications](https://discord.com/developers/applications)

### 2. **Selecciona tu aplicación**
- Busca la aplicación que creaste
- Haz click en ella para abrirla

### 3. **Ve a OAuth2 → General**
- En el menú lateral izquierdo, haz click en **"OAuth2"**
- Luego haz click en **"General"**

### 4. **Configura las Redirects URLs**
En la sección **"Redirects"**:

**❌ ELIMINA cualquier URL incorrecta como:**
- `http://localhost:3000/auth/discord/callback`
- Cualquier otra URL que no sea la correcta

**✅ AGREGA exactamente esta URL:**
```
http://localhost:3001/auth/discord/callback
```

### 5. **Guarda los cambios**
- Haz click en **"Save Changes"** o **"Guardar cambios"**
- Espera la confirmación

### 6. **Verifica las credenciales**
Asegúrate de que tienes:
- **Client ID:** `1262519598025150524` ✅
- **Client Secret:** `qg76310BrlEwL7KccqRim6e2EsBb5s0z` ✅

## 🆕 **Nueva funcionalidad:**
- ✅ El enlace de Discord ahora se abre en **nueva pestaña**
- ✅ La página principal se recarga automáticamente tras la autenticación

## 🔍 **URLs exactas que debes configurar:**

### **Para desarrollo (localhost):**
```
http://localhost:3001/auth/discord/callback
```

### **Para producción (cuando subas a GitHub):**
```
https://tu-dominio.vercel.app/auth/discord/callback
```

## ⚠️ **Importante:**
1. **NO incluyas** espacios antes o después de la URL
2. **USA exactamente** el puerto `:3001` (no 3000)
3. **NO olvides** el `/auth/discord/callback` al final
4. **GUARDA** los cambios en Discord

## 🧪 **Para probar:**
1. Actualiza las URLs en Discord Developer Portal
2. Ve a: http://localhost:3001/admin
3. Haz click en "Autorizar con Discord"
4. Se abrirá una nueva pestaña con Discord
5. Autoriza la aplicación
6. La ventana se cerrará y serás redirigido al dashboard

¿Sigue sin funcionar? Revisa que:
- ✅ La URL esté escrita exactamente igual
- ✅ No haya espacios extra
- ✅ Hayas guardado los cambios
- ✅ Estés usando el puerto 3001