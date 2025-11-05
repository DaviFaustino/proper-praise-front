FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
ARG ENV_FILE=.env.production
COPY . .
RUN cp $ENV_FILE .env
RUN rm .env.development && rm .env.production
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
COPY --from=build /app/.output ./.output
COPY package*.json ./
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
