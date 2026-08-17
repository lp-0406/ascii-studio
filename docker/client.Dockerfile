# ---- Build stage ----
FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY client/package*.json ./
RUN npm install --no-audit --no-fund

COPY client ./
RUN npm run build

# ---- Serve stage ----
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80 >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
