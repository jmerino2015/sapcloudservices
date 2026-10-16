# Imagen base ligera con Node.js
FROM node:20-alpine

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --omit=dev

# Copiar todo el código del proyecto
COPY . .

# Exponer el puerto
EXPOSE 8080

ENV PORT=8080
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# Comando para iniciar el servidor SAP Fiori Portal
CMD ["node", "server.js"]
