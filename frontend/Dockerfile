# Stage 1: build Angular
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run tw:build && npx ng build --configuration production

# Stage 2: serve with Nginx
FROM nginx:1.27-alpine
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
