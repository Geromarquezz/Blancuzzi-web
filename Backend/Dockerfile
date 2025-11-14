# Imagen base
FROM node:20-alpine

WORKDIR /app

# Instalar datos de zona horaria y configurar Buenos Aires
RUN apk add --no-cache tzdata \
  && ln -snf /usr/share/zoneinfo/America/Argentina/Buenos_Aires /etc/localtime \
  && echo "America/Argentina/Buenos_Aires" > /etc/timezone

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo nodemon para desarrollo)
RUN npm install

# Copiar código de la aplicación
COPY . .

# Exponer puerto
EXPOSE 3004

# Variables de entorno por defecto
ENV NODE_ENV=development
ENV PORT=3004
ENV TZ=America/Argentina/Buenos_Aires

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3004/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usar nodemon para hot-reload en desarrollo
CMD ["npx", "nodemon", "index.js"]
