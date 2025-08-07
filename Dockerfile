FROM node:22.14 AS builder
WORKDIR /app
ARG ENV_FILE=.env.production
COPY . .
RUN cp $ENV_FILE .env
RUN rm .env.development && rm .env.production
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist/ /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
