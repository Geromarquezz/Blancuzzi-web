# 🐳 Docker - Guía de Uso

Esta aplicación está completamente dockerizada con **Backend (Node.js)**, **Frontend (React + Vite)** y **PostgreSQL**.

## 📋 Prerrequisitos

- [Docker](https://www.docker.com/get-started) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado

## 🚀 Inicio Rápido

### 1️⃣ Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
# En la raíz del proyecto
cp .env.docker.example .env
```

Edita el archivo `.env` con tus credenciales reales:
- **POSTGRES_PASSWORD**: Contraseña de PostgreSQL
- **JWT_SECRET**: Secret para JWT
- **BREVOAPI**: API Key de Brevo para emails
- **GOOGLE_CLIENT_ID/SECRET**: Credenciales de Google Calendar
- etc.

### 2️⃣ Iniciar la Aplicación

```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 3️⃣ Acceder a la Aplicación

Una vez iniciado, la aplicación estará disponible en:

- **Frontend**: http://localhost (puerto 80)
- **Backend API**: http://localhost:3004
- **PostgreSQL**: localhost:5432

## 🛠️ Comandos Útiles

### Gestión de Servicios

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ elimina la BD)
docker-compose down -v

# Reiniciar servicios
docker-compose restart

# Reiniciar un servicio específico
docker-compose restart backend
```

### Reconstruir Imágenes

```bash
# Reconstruir todas las imágenes
docker-compose build

# Reconstruir sin usar caché
docker-compose build --no-cache

# Reconstruir un servicio específico
docker-compose build backend
```

### Debugging

```bash
# Ver estado de los contenedores
docker-compose ps

# Entrar a un contenedor (bash)
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d blancuzzi_db

# Ver recursos utilizados
docker stats
```

### Gestión de Base de Datos

```bash
# Acceder a PostgreSQL
docker-compose exec postgres psql -U postgres -d blancuzzi_db

# Backup de la base de datos
docker-compose exec postgres pg_dump -U postgres blancuzzi_db > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres blancuzzi_db < backup.sql

# Ver logs de PostgreSQL
docker-compose logs -f postgres
```

## 📁 Estructura Docker

```
.
├── docker-compose.yml          # Orquestación de servicios
├── .env                        # Variables de entorno
├── Backend/
│   ├── Dockerfile             # Imagen del backend
│   ├── .dockerignore          # Archivos a ignorar
│   └── Database/
│       └── init-db.sh         # Script de inicialización de BD
└── Frontend/
    ├── Dockerfile             # Imagen del frontend
    ├── nginx.conf             # Configuración de Nginx
    └── .dockerignore          # Archivos a ignorar
```

## 🔧 Configuración Avanzada

### Cambiar Puertos

Edita el archivo `.env`:

```env
FRONTEND_PORT=8080    # Frontend en puerto 8080
BACKEND_PORT=4000     # Backend en puerto 4000
POSTGRES_PORT=5433    # PostgreSQL en puerto 5433
```

### Modo Desarrollo con Hot Reload

Para desarrollo local sin Docker, usa los comandos normales:

```bash
# Backend
cd Backend
npm run dev

# Frontend
cd Frontend
npm run dev
```

### Producción

El `docker-compose.yml` actual ya está configurado para producción:
- ✅ Optimización de imágenes con multi-stage builds
- ✅ Healthchecks para todos los servicios
- ✅ Restart automático de contenedores
- ✅ Red aislada entre servicios
- ✅ Volúmenes persistentes para la BD

## 🐛 Troubleshooting

### Error: Puerto ya en uso

```bash
# Verificar qué está usando el puerto
netstat -ano | findstr :3004  # Windows
lsof -i :3004                 # Linux/Mac

# Cambiar el puerto en .env
BACKEND_PORT=3001
```

### Error: Base de datos no se conecta

```bash
# Verificar que PostgreSQL esté saludable
docker-compose ps

# Ver logs de PostgreSQL
docker-compose logs postgres

# Reiniciar PostgreSQL
docker-compose restart postgres
```

### Error: Frontend no carga

```bash
# Verificar que el backend esté corriendo
curl http://localhost:3004/api/health

# Reconstruir frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Limpiar todo y empezar de nuevo

```bash
# ⚠️ Esto eliminará TODOS los datos
docker-compose down -v
docker system prune -a --volumes
docker-compose up -d --build
```

## 📊 Monitoreo

```bash
# Ver recursos en tiempo real
docker stats

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs con timestamps
docker-compose logs -f -t
```

## 🔒 Seguridad

- ✅ Usuario no-root en contenedores
- ✅ Variables de entorno para secretos
- ✅ Red aislada entre servicios
- ✅ Healthchecks para detectar problemas
- ✅ Volúmenes para persistencia de datos

## 📝 Notas Importantes

1. **Nunca commitees el archivo `.env`** con credenciales reales
2. El archivo `init-db.sh` solo se ejecuta en el **primer inicio**
3. Los datos de PostgreSQL persisten en el volumen `postgres_data`
4. Para cambios en el código, reconstruye las imágenes con `docker-compose build`

## 🆘 Soporte

Si tienes problemas:
1. Verifica los logs: `docker-compose logs -f`
2. Revisa el estado: `docker-compose ps`
3. Reinicia los servicios: `docker-compose restart`
4. Reconstruye las imágenes: `docker-compose build --no-cache`

---

**Desarrollado con ❤️ para Dra. Angelica Blancuzzi**
