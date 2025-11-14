# Imagen base
FROM node:20-alpine

WORKDIR /app

# Argumento para la URL de la API (se pasa desde docker-compose)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Exponer puerto de desarrollo de Vite
EXPOSE 5173

# Healthcheck para el servidor de desarrollo
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5173/ || exit 1

# Iniciar servidor de desarrollo de Vite con hot-reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
