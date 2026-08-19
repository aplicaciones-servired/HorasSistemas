FROM node:lts

WORKDIR /app

# Copiar el resto del código de la aplicación
COPY . .

# Instalar dependencias necesarias
RUN npm install

# Construir la aplicación
RUN npm run build

# Exponer el puerto en el que correrá la aplicación
EXPOSE 80

# Comando para iniciar la aplicación
CMD ["npm", "start"]