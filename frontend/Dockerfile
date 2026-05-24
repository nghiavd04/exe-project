FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

FROM caddy:2-alpine

WORKDIR /srv

COPY --from=builder /app/dist .

COPY Caddyfile /etc/caddy/Caddyfile

ENV PORT=80
ENV API_URL=/api

EXPOSE ${PORT}

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]