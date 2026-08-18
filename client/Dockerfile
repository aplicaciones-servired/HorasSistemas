FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache openssl
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/key.pem \
      -out /etc/nginx/ssl/cert.pem \
      -subj "/C=CO/ST=Valle/L=Jamundi/O=Servired/OU=IT/CN=localhost"
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5174 5175
CMD ["nginx", "-g", "daemon off;"]
