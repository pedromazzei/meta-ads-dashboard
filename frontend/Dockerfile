# Frontend Dockerfile - Meta Ads Dashboard
# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build do React
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copiar build do React para o Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuração customizada do Nginx (opcional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Nginx inicia automaticamente
CMD ["nginx", "-g", "daemon off;"]
