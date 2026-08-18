# Base de Node.js versiÃ³n 18
FROM node:18-alpine

# Cambiar a la carpeta de la aplicaciÃ³n
WORKDIR /app

# Copiar package.json y package-lock.json primero (para cachear capas)
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para compilar TypeScript)
RUN npm ci

# Copiar el resto del código
COPY . .

# Compilar TypeScript
RUN npm run build

# Limpiar dependencias de desarrollo para reducir tamaño de imagen
RUN npm prune --omit=dev

# Exponer el puerto
EXPOSE 3000

# Comando para ejecutar la aplicaciÃ³n
CMD ["node", "./dist/index.js"]