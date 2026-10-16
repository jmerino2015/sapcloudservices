# Image base ligera con Node.js
FROM node:18-alpine

WORKDIR /app

# Copiar archivos del proyecto
COPY . .

# Exponer el puerto 8080 del servidor
EXPOSE 8080

ENV PORT=8080
ENV HOST=0.0.0.0

# Comando para iniciar el servidor SAP Fiori Portal
CMD ["node", "server.js"]
