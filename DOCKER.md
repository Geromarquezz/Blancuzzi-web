# 🐳 Docker - Guía de Uso

Esta aplicación de gestión de turnos odontológicos está completamente dockerizada con **Backend (Node.js + Express)**, **Frontend (React + Vite)** y **PostgreSQL**.

## 🏥 Sobre la Aplicación

Sistema de gestión de turnos para la Dra. Angelica Blancuzzi con las siguientes características:

- ✅ **Autenticación dual**: Registro tradicional + Google OAuth 2.0
- ✅ **Verificación de email**: Sistema OTP (6 dígitos) con Brevo
- ✅ **Gestión de turnos**: Integración con Google Calendar
- ✅ **Panel de administración**: Control completo de usuarios y turnos
- ✅ **Validación de teléfono**: Requerido para comunicación médica
- ✅ **Políticas de cancelación**: 24 horas de anticipación
- ✅ **Rate limiting**: Protección contra spam y ataques
- ✅ **Roles**: Admin y pacientes con permisos diferenciados

## 📋 Prerrequisitos

- [Docker](https://www.docker.com/get-started) instalado (versión 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) instalado (versión 2.0+)
- Credenciales de Google OAuth 2.0 (para autenticación con Google)
- API Key de Brevo (para emails de verificación)
- Google Calendar API configurada (para gestión de turnos)

## 🚀 Inicio Rápido

### 1️⃣ Configurar Variables de Entorno

La aplicación usa dos archivos docker-compose según el entorno:

```bash
# Para desarrollo local
docker-compose.local.yml  → Backend: localhost:3004, Frontend: localhost:5173

# Para producción
docker-compose.production.yml → Backend: localhost:3004, Frontend: localhost:80
```

#### Backend (.env.dev o .env.prod en /Backend)

```env
# Base de datos
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password_segura
DB_NAME=blancuzzi_db

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro_aqui

# Email (Brevo)
BREVOAPI=tu_api_key_de_brevo
BREVO_SENDER_EMAIL=noreply@tudominio.com
BREVO_SENDER_NAME=Dra. Blancuzzi

# Google OAuth
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3004/api/google-oauth/callback

# Google Calendar
GOOGLE_CALENDAR_ID=tu_calendario@group.calendar.google.com

# Entorno
NODE_ENV=development  # o production
```

#### Frontend (.env.development o .env.production en /Frontend)

```env
# URL del backend
VITE_API_BASE_URL=http://localhost:3004

# Google OAuth (debe coincidir con el backend)
VITE_GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
```

### 2️⃣ Iniciar la Aplicación

#### Desarrollo Local

```bash
# Iniciar en modo desarrollo
docker compose -f docker-compose.local.yml up -d

# Ver logs en tiempo real
docker compose -f docker-compose.local.yml logs -f

# Ver logs de un servicio específico
docker compose -f docker-compose.local.yml logs -f backend
docker compose -f docker-compose.local.yml logs -f frontend
docker compose -f docker-compose.local.yml logs -f postgres
```

#### Producción

```bash
# Iniciar en modo producción
docker compose -f docker-compose.production.yml up -d

# Ver logs
docker compose -f docker-compose.production.yml logs -f
```

### 3️⃣ Acceder a la Aplicación

#### Desarrollo Local
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3004
- **PostgreSQL**: localhost:5432

#### Producción
- **Frontend**: http://localhost (puerto 80)
- **Backend API**: http://localhost:3004
- **PostgreSQL**: localhost:5432

## 🛠️ Comandos Útiles

### Gestión de Servicios

```bash
# === DESARROLLO LOCAL ===

# Detener todos los servicios
docker compose -f docker-compose.local.yml down

# Detener y eliminar volúmenes (⚠️ elimina la BD)
docker compose -f docker-compose.local.yml down -v

# Reiniciar servicios
docker compose -f docker-compose.local.yml restart

# Reiniciar un servicio específico
docker compose -f docker-compose.local.yml restart backend
docker compose -f docker-compose.local.yml restart frontend

# === PRODUCCIÓN ===

# Detener todos los servicios
docker compose -f docker-compose.production.yml down

# Reiniciar servicios
docker compose -f docker-compose.production.yml restart
```

### Reconstruir Imágenes

```bash
# Reconstruir todas las imágenes (desarrollo)
docker compose -f docker-compose.local.yml build

# Reconstruir sin usar caché
docker compose -f docker-compose.local.yml build --no-cache

# Reconstruir un servicio específico
docker compose -f docker-compose.local.yml build backend

# Reconstruir y reiniciar
docker compose -f docker-compose.local.yml up -d --build
```

### Debugging

```bash
# Ver estado de los contenedores
docker compose -f docker-compose.local.yml ps

# Entrar a un contenedor
docker compose -f docker-compose.local.yml exec backend sh
docker compose -f docker-compose.local.yml exec frontend sh
docker compose -f docker-compose.local.yml exec postgres psql -U postgres -d blancuzzi_db

# Ver recursos utilizados
docker stats

# Inspeccionar un servicio
docker compose -f docker-compose.local.yml logs backend --tail=100
```

### Gestión de Base de Datos

```bash
# Acceder a PostgreSQL
docker compose -f docker-compose.local.yml exec postgres psql -U postgres -d blancuzzi_db

# Ver tablas
docker compose -f docker-compose.local.yml exec postgres psql -U postgres -d blancuzzi_db -c "\dt"

# Consultar usuarios
docker compose -f docker-compose.local.yml exec postgres psql -U postgres -d blancuzzi_db -c "SELECT id, name, email, is_verified, phone FROM users;"

# Backup de la base de datos
docker compose -f docker-compose.local.yml exec postgres pg_dump -U postgres blancuzzi_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker compose -f docker-compose.local.yml exec -T postgres psql -U postgres blancuzzi_db < backup.sql

# Ver logs de PostgreSQL
docker compose -f docker-compose.local.yml logs -f postgres

# Reinicializar base de datos (⚠️ elimina todos los datos)
docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up -d postgres
```

## 📁 Estructura Docker

```
.
├── docker-compose.local.yml       # Orquestación desarrollo (Vite dev server)
├── docker-compose.production.yml  # Orquestación producción (Nginx)
├── Backend/
│   ├── Dockerfile                # Imagen Node.js
│   ├── .env.dev                  # Variables desarrollo
│   ├── .env.prod                 # Variables producción
│   ├── .dockerignore             # Archivos a ignorar
│   ├── index.js                  # Entrada del servidor Express
│   ├── Database/
│   │   ├── init-db.sh           # Script de inicialización de BD
│   │   ├── db.sql               # Schema completo
│   │   ├── add-google-oauth.sql # Migración OAuth
│   │   └── insert-test-data.sql # Datos de prueba
│   ├── Controllers/
│   │   ├── auth.controller.js          # Registro/Login/OTP
│   │   ├── googleOAuth.controller.js   # OAuth Google
│   │   ├── users.controller.js         # CRUD usuarios
│   │   ├── turnos.controller.js        # Gestión turnos
│   │   └── calendar.controller.js      # Google Calendar
│   ├── Middleware/
│   │   ├── user.auth.js               # JWT validation
│   │   ├── admin.auth.js              # Admin authorization
│   │   ├── account.verification.js    # Email verification check
│   │   └── rateLimiters.js            # Rate limiting
│   └── routes/
│       ├── auth.routes.js
│       ├── googleOAuth.routes.js
│       ├── users.routes.js
│       ├── turnos.routes.js
│       └── calendar.routes.js
└── Frontend/
    ├── Dockerfile                # Multi-stage build (dev/prod)
    ├── nginx.conf               # Configuración Nginx (producción)
    ├── .env.development         # Variables desarrollo
    ├── .env.production          # Variables producción
    ├── .dockerignore            # Archivos a ignorar
    ├── vite.config.js           # Configuración Vite
    └── src/
        ├── Pages/
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── VerifyAccount.jsx       # Verificación OTP
        │   ├── GoogleAuthSuccess.jsx   # Callback OAuth
        │   ├── CompleteProfile.jsx     # Completar teléfono
        │   ├── Profile.jsx
        │   ├── Turnos.jsx
        │   ├── Admin.jsx
        │   ├── ResetPassword.jsx
        │   └── TermsAndConditions.jsx
        ├── Context/
        │   ├── AuthProvider.jsx        # Autenticación global
        │   └── TurnosProvider.jsx      # Estado de turnos
        └── Components/
            ├── Navbar.jsx
            ├── Hero.jsx
            ├── Footer.jsx
            └── ConfirmDialog.jsx
```

## 🔧 Configuración Avanzada

### Variables de Entorno Importantes

#### Backend
- **JWT_SECRET**: Clave secreta para tokens JWT (mínimo 32 caracteres)
- **BREVOAPI**: API Key de Brevo para envío de emails OTP
- **GOOGLE_CLIENT_ID/SECRET**: Credenciales OAuth 2.0 de Google
- **GOOGLE_CALENDAR_ID**: ID del calendario de Google
- **DB_PASSWORD**: Contraseña segura para PostgreSQL

#### Frontend
- **VITE_API_BASE_URL**: URL del backend (debe coincidir con CORS)
- **VITE_GOOGLE_CLIENT_ID**: Mismo que el backend para OAuth

### Flujos de Autenticación

#### 1. Registro Tradicional
```
Usuario → /register → Backend crea usuario (is_verified=false)
  ↓
Backend genera OTP (6 dígitos) → Envía email con Brevo
  ↓
Usuario → /verify-account → Ingresa OTP
  ↓
Backend valida OTP → Marca is_verified=true → Crea sesión JWT
  ↓
Usuario redirigido a /profile
```

#### 2. Google OAuth
```
Usuario → Click "Continuar con Google" → Google login
  ↓
Google → Callback /api/google-oauth/callback
  ↓
Backend: Usuario existe?
  ├─ NO → Crea usuario (phone='0000000000', is_verified=false)
  │         Genera OTP → Envía email → Crea sesión JWT
  │         Frontend → /verify-account → /complete-profile
  │
  └─ SÍ → is_verified?
           ├─ NO → Genera OTP → Envía email → Frontend /verify-account
           └─ SÍ → phone='0000000000'?
                    ├─ SÍ → Frontend /complete-profile
                    └─ NO → Frontend /profile (completo)
```

#### 3. Verificación de Cuenta
- Todos los usuarios deben verificar su email con OTP
- OTP expira en 10 minutos
- Se puede reenviar OTP con countdown de 30-60 segundos
- Después de verificar, se valida el teléfono

### Middleware Chain

```javascript
// Rutas protegidas
router.post('/agendar-turno',
  userAuth,                  // ✅ Valida JWT, establece req.userId
  requireVerifiedAccount,    // ✅ Verifica is_verified=true en DB
  agendarTurno              // ✅ Ejecuta controlador
)

// Rutas de admin
router.get('/admin/users',
  userAuth,     // ✅ Valida JWT
  adminAuth,    // ✅ Verifica req.isAdmin (userId === 1)
  getUsers      // ✅ Ejecuta controlador
)
```

### Rate Limiting

El backend implementa rate limiting para prevenir abuso:

- **Registro**: 5 intentos por 15 minutos por IP
- **Login**: 10 intentos por 15 minutos por IP
- **OTP**: 3 intentos de envío por 15 minutos por IP
- **API General**: 100 requests por 15 minutos por IP

### Modo Desarrollo vs Producción

| Característica | Desarrollo | Producción |
|---------------|-----------|-----------|
| Frontend Server | Vite Dev (HMR) | Nginx (estático) |
| Puerto Frontend | 5173 | 80 |
| Puerto Backend | 3004 | 3004 |
| Hot Reload | ✅ Sí | ❌ No |
| Optimización | ❌ No | ✅ Build optimizado |
| Source Maps | ✅ Sí | ❌ No |
| CORS | Permisivo | Restrictivo |

### Cambiar Puertos

Edita los archivos docker-compose:

```yaml
# docker-compose.local.yml o docker-compose.production.yml
services:
  frontend:
    ports:
      - "8080:5173"  # Frontend en puerto 8080
  
  backend:
    ports:
      - "4000:3004"  # Backend en puerto 4000
    environment:
      - PORT=3004    # Puerto interno del contenedor
  
  postgres:
    ports:
      - "5433:5432"  # PostgreSQL en puerto 5433
```

### Base de Datos - Esquema

La base de datos incluye las siguientes tablas principales:

```sql
-- Usuarios
users (
  id, name, lastname, email, phone, password,
  is_verified, verify_otp, verify_otp_expire_at,
  google_id, is_blocked, created_at, updated_at
)

-- Turnos
turnos (
  id, user_id, date, hour, state,
  consultation_type, patient_notes,
  google_event_id, createdAt, updatedAt
)

-- Tokens de Google Calendar
google_tokens (
  id, service_name, access_token, refresh_token,
  token_type, expiry_date, scope, updated_at
)
```

### Inicialización de la Base de Datos

El script `init-db.sh` se ejecuta automáticamente en el primer inicio:

1. Crea la base de datos `blancuzzi_db`
2. Ejecuta `db.sql` (schema completo)
3. Ejecuta `add-google-oauth.sql` (columna google_id)
4. Opcionalmente ejecuta `insert-test-data.sql` (datos de prueba)

**Nota**: El script solo se ejecuta una vez. Para reinicializar, elimina el volumen:
```bash
docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up -d
```

## 🐛 Troubleshooting

### Error: Puerto ya en uso

```bash
# Windows
netstat -ano | findstr :3004
netstat -ano | findstr :5173

# Linux/Mac
lsof -i :3004
lsof -i :5173

# Solución: Matar proceso o cambiar puerto en docker-compose
```

### Error: Base de datos no se conecta

```bash
# 1. Verificar que PostgreSQL esté saludable
docker compose -f docker-compose.local.yml ps

# 2. Ver logs de PostgreSQL
docker compose -f docker-compose.local.yml logs postgres

# 3. Verificar conexión desde el backend
docker compose -f docker-compose.local.yml exec backend sh
# Dentro del contenedor:
nc -zv postgres 5432

# 4. Reiniciar PostgreSQL
docker compose -f docker-compose.local.yml restart postgres

# 5. Verificar variables de entorno
docker compose -f docker-compose.local.yml exec backend printenv | grep DB_
```

### Error: Frontend no carga

```bash
# 1. Verificar que el backend esté corriendo
curl http://localhost:3004/api/health

# 2. Ver logs del frontend
docker compose -f docker-compose.local.yml logs frontend

# 3. Verificar variables de entorno
docker compose -f docker-compose.local.yml exec frontend printenv | grep VITE_

# 4. Reconstruir frontend
docker compose -f docker-compose.local.yml build --no-cache frontend
docker compose -f docker-compose.local.yml up -d frontend
```

### Error: CORS (Cross-Origin)

```bash
# Verificar que VITE_API_BASE_URL coincida con la URL del backend
# Frontend .env.development
VITE_API_BASE_URL=http://localhost:3004

# Backend debe permitir esta origen en CORS
# Backend index.js debería tener:
cors({
  origin: 'http://localhost:5173',  // Desarrollo
  credentials: true
})
```

### Error: Google OAuth no funciona

```bash
# 1. Verificar credenciales
docker compose -f docker-compose.local.yml exec backend printenv | grep GOOGLE_

# 2. Verificar Redirect URI en Google Console
# Debe ser: http://localhost:3004/api/google-oauth/callback

# 3. Verificar que el Client ID sea el mismo en frontend y backend

# 4. Ver logs del callback
docker compose -f docker-compose.local.yml logs -f backend | grep oauth
```

### Error: Emails OTP no llegan

```bash
# 1. Verificar API Key de Brevo
docker compose -f docker-compose.local.yml exec backend printenv | grep BREVO

# 2. Ver logs de envío de emails
docker compose -f docker-compose.local.yml logs backend | grep -i "otp\|brevo\|email"

# 3. Verificar cuenta de Brevo (límites, estado)

# 4. Revisar carpeta de spam del usuario
```

### Error: Google Calendar no sincroniza

```bash
# 1. Verificar tokens de Google Calendar
docker compose -f docker-compose.local.yml exec postgres psql -U postgres -d blancuzzi_db -c "SELECT * FROM google_tokens;"

# 2. Verificar que el Calendar ID sea correcto
docker compose -f docker-compose.local.yml exec backend printenv | grep CALENDAR

# 3. Ver logs del backend
docker compose -f docker-compose.local.yml logs backend | grep -i "calendar\|google"

# 4. Re-autenticar Google Calendar desde /admin
```

### Error: Usuario no puede agendar turnos

```bash
# Verificar estado del usuario en la base de datos
docker compose -f docker-compose.local.yml exec postgres psql -U postgres -d blancuzzi_db

# En psql:
SELECT id, name, email, is_verified, phone, is_blocked 
FROM users 
WHERE email = 'usuario@ejemplo.com';

# Posibles causas:
# - is_verified = false → Debe verificar email con OTP
# - phone = '0000000000' → Debe completar teléfono
# - is_blocked = true → Usuario bloqueado por admin
```

### Limpiar todo y empezar de nuevo

```bash
# ⚠️ Esto eliminará TODOS los datos y contenedores

# Detener y eliminar todo
docker compose -f docker-compose.local.yml down -v

# Limpiar imágenes huérfanas y caché
docker system prune -a --volumes

# Reconstruir desde cero
docker compose -f docker-compose.local.yml up -d --build

# Verificar que todo esté corriendo
docker compose -f docker-compose.local.yml ps
docker compose -f docker-compose.local.yml logs -f
```

### Verificar estado de salud de los servicios

```bash
# Ver estado de healthchecks
docker compose -f docker-compose.local.yml ps

# Healthy = ✅ OK
# Unhealthy = ❌ Problema
# Starting = ⏳ Iniciando

# Inspeccionar healthcheck de un servicio
docker inspect --format='{{json .State.Health}}' <container_id> | jq
```

## 📊 Monitoreo

```bash
# Ver recursos en tiempo real (CPU, memoria, red, disco)
docker stats

# Ver logs de todos los servicios
docker compose -f docker-compose.local.yml logs -f

# Ver logs con timestamps
docker compose -f docker-compose.local.yml logs -f -t

# Ver últimas 100 líneas de un servicio
docker compose -f docker-compose.local.yml logs backend --tail=100

# Seguir logs de múltiples servicios
docker compose -f docker-compose.local.yml logs -f backend frontend

# Filtrar logs por palabra clave
docker compose -f docker-compose.local.yml logs backend | grep -i "error\|warning"
docker compose -f docker-compose.local.yml logs backend | grep -i "otp"
docker compose -f docker-compose.local.yml logs backend | grep -i "turno"
```

## 🔒 Seguridad

### Implementaciones de Seguridad

- ✅ **Usuario no-root** en contenedores (node:alpine)
- ✅ **Variables de entorno** para secretos (nunca en código)
- ✅ **JWT con expiración** (7 días)
- ✅ **Rate limiting** en todas las rutas críticas
- ✅ **Validación de entrada** en todos los endpoints
- ✅ **CORS configurado** según entorno
- ✅ **Passwords hasheados** con bcrypt (10 rounds)
- ✅ **HTTP-only cookies** para tokens
- ✅ **Email verification** obligatoria (OTP)
- ✅ **Teléfono validado** para turnos
- ✅ **Middleware de autenticación/autorización**
- ✅ **Red aislada** entre servicios Docker
- ✅ **Volúmenes persistentes** para datos
- ✅ **Healthchecks** para detección temprana de problemas

### Checklist de Seguridad Pre-Producción

- [ ] Cambiar `JWT_SECRET` a valor seguro aleatorio (32+ caracteres)
- [ ] Cambiar `DB_PASSWORD` a contraseña fuerte
- [ ] Configurar HTTPS con certificado SSL/TLS
- [ ] Actualizar CORS a dominios específicos (no `*`)
- [ ] Configurar `sameSite: 'none'` en cookies solo con HTTPS
- [ ] Revisar y ajustar límites de rate limiting
- [ ] Configurar logs en archivo persistente
- [ ] Implementar backup automático de PostgreSQL
- [ ] Configurar firewall para puertos expuestos
- [ ] Revisar permisos de archivos `.env`
- [ ] Implementar monitoreo de errores (Sentry, etc.)
- [ ] Configurar alertas para servicios caídos

### Buenas Prácticas

```bash
# Nunca commitear archivos .env
git add .gitignore
# Verificar que .env esté en .gitignore

# Rotar secretos periódicamente
# JWT_SECRET cada 3-6 meses
# API Keys según políticas del proveedor

# Backups automáticos
# Configurar cron job para pg_dump diario
0 2 * * * docker compose -f docker-compose.production.yml exec postgres pg_dump -U postgres blancuzzi_db > /backups/db_$(date +\%Y\%m\%d).sql
```

## 🚀 Despliegue en Producción

### Preparación

1. **Servidor**: Ubuntu 20.04+ / Debian 11+ con Docker instalado
2. **Dominio**: Configurar DNS A record apuntando al servidor
3. **SSL**: Obtener certificado (Let's Encrypt con Certbot)
4. **Nginx**: Configurar reverse proxy en el host

### Pasos

```bash
# 1. Clonar repositorio en servidor
git clone <repo-url>
cd blancuzzi-web

# 2. Configurar variables de entorno producción
nano Backend/.env.prod
nano Frontend/.env.production

# 3. Construir e iniciar servicios
docker compose -f docker-compose.production.yml up -d --build

# 4. Verificar estado
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs -f

# 5. Configurar Nginx en el host (ejemplo)
sudo nano /etc/nginx/sites-available/blancuzzi

# Contenido ejemplo:
server {
    listen 80;
    server_name tudominio.com;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:3004;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 6. Habilitar sitio y reiniciar Nginx
sudo ln -s /etc/nginx/sites-available/blancuzzi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 7. Configurar SSL con Certbot
sudo certbot --nginx -d tudominio.com
```

### Actualización de Código

```bash
# En el servidor
cd blancuzzi-web
git pull origin main

# Reconstruir y reiniciar
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d

# Verificar logs
docker compose -f docker-compose.production.yml logs -f
```

## 📝 Notas Importantes

### Flujos de Usuario

1. **Registro Tradicional**:
   - Usuario llena formulario → Backend crea cuenta (no verificada)
   - Backend envía OTP por email (Brevo)
   - Usuario verifica OTP → Cuenta activada → Sesión creada
   - Usuario redirigido a perfil

2. **Google OAuth (nuevo)**:
   - Usuario hace login con Google
   - Backend crea cuenta con `phone='0000000000'`, `is_verified=false`
   - Backend envía OTP por email
   - Usuario verifica OTP → Redirigido a completar teléfono
   - Usuario completa teléfono → Cuenta completada

3. **Google OAuth (existente no verificado)**:
   - Usuario hace login con Google
   - Backend detecta cuenta no verificada
   - Backend reenvía OTP por email
   - Usuario verifica OTP → Si falta teléfono → Completar teléfono

4. **Google OAuth (existente verificado)**:
   - Usuario hace login con Google
   - Backend verifica cuenta
   - Si falta teléfono (`'0000000000'`) → Completar teléfono
   - Si todo completo → Directo a perfil

### Consideraciones Técnicas

1. **Verificación de Email**:
   - Todos los usuarios DEBEN verificar su email con OTP
   - Sin verificación, no pueden agendar turnos (middleware `requireVerifiedAccount`)
   - OTP expira en 10 minutos
   - Se puede reenviar OTP con rate limiting (3 intentos/15min)

2. **Teléfono Placeholder**:
   - Usuarios OAuth nuevos: `phone='0000000000'` (10 ceros)
   - Frontend valida si `phone === '0000000000'` → Redirige a `/complete-profile`
   - Al intentar agendar turno, modal obliga a completar teléfono

3. **Roles**:
   - **Admin**: `userId === 1` (primer usuario)
   - **Patient**: Todos los demás usuarios
   - Considerar migrar a campo `role` en DB para flexibilidad

4. **Cancelación de Turnos**:
   - Solo turnos confirmados pueden cancelarse
   - Requiere 24 horas de anticipación
   - Si < 24 horas: usuario debe contactar por WhatsApp

5. **Base de Datos**:
   - El script `init-db.sh` se ejecuta SOLO en el primer inicio
   - Para reinicializar: `docker compose down -v` (elimina volumen)
   - Datos persisten en volumen `postgres_data`

6. **Google Calendar**:
   - Tokens se almacenan en tabla `google_tokens`
   - Auto-refresh cuando expiran
   - Admin debe autenticarse desde `/admin` si tokens faltan

### Archivos Sensibles (NO commitear)

- ❌ `Backend/.env.dev`
- ❌ `Backend/.env.prod`
- ❌ `Frontend/.env.development`
- ❌ `Frontend/.env.production`
- ❌ `Client ID de google auth local.json`
- ✅ Asegurar que estén en `.gitignore`

### Testing Local

```bash
# 1. Iniciar servicios
docker compose -f docker-compose.local.yml up -d

# 2. Verificar servicios saludables
docker compose -f docker-compose.local.yml ps

# 3. Crear usuario de prueba
# Abrir http://localhost:5173/register
# Registrar usuario de prueba

# 4. Verificar email OTP en logs
docker compose -f docker-compose.local.yml logs backend | grep -i "otp"

# 5. Probar flujo OAuth
# Click "Continuar con Google"
# Verificar callback en logs

# 6. Probar agendar turno
# Ir a /turnos
# Seleccionar fecha/hora
# Verificar creación en Google Calendar

# 7. Probar panel admin
# Login con usuario id=1
# Verificar acceso a /admin
```

## 🆘 Soporte y Recursos

### Documentación Oficial

- **Docker**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **Node.js**: https://nodejs.org/docs/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Express**: https://expressjs.com/
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2
- **Google Calendar API**: https://developers.google.com/calendar/api/guides/overview
- **Brevo (Sendinblue)**: https://developers.brevo.com/

### Comandos Rápidos de Referencia

```bash
# Desarrollo - Iniciar
docker compose -f docker-compose.local.yml up -d

# Desarrollo - Ver logs
docker compose -f docker-compose.local.yml logs -f

# Desarrollo - Detener
docker compose -f docker-compose.local.yml down

# Producción - Iniciar
docker compose -f docker-compose.production.yml up -d --build

# Producción - Ver logs
docker compose -f docker-compose.production.yml logs -f

# Producción - Detener
docker compose -f docker-compose.production.yml down

# Reinicializar DB (⚠️ elimina datos)
docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up -d

# Backup DB
docker compose -f docker-compose.local.yml exec postgres pg_dump -U postgres blancuzzi_db > backup.sql

# Restaurar DB
docker compose -f docker-compose.local.yml exec -T postgres psql -U postgres blancuzzi_db < backup.sql

# Verificar salud
docker compose -f docker-compose.local.yml ps

# Limpiar todo (⚠️ elimina TODO)
docker compose -f docker-compose.local.yml down -v
docker system prune -a --volumes
```

### Contacto y Soporte

Si encuentras problemas:

1. **Verifica los logs**: `docker compose logs -f`
2. **Revisa el estado**: `docker compose ps`
3. **Consulta esta documentación**: Sección Troubleshooting
4. **Revisa las variables de entorno**: Archivo `.env`
5. **Reconstruye las imágenes**: `docker compose build --no-cache`

### Checklist de Verificación

- [ ] Docker y Docker Compose instalados
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Credenciales de Google OAuth válidas
- [ ] API Key de Brevo válida
- [ ] Puertos disponibles (5173, 3004, 5432)
- [ ] Permisos de ejecución en `init-db.sh`
- [ ] Red Docker configurada
- [ ] Volúmenes de datos creados

---

**Desarrollado con ❤️ para Dra. Angelica Blancuzzi**

_Sistema de gestión de turnos odontológicos con autenticación dual y verificación de email_
