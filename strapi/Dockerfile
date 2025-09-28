# Creating multi-stage build for production
FROM node:22-alpine AS build

# Installing libvips-dev for sharp Compatibility
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git > /dev/null 2>&1

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/

COPY package*.json ./

RUN npm install -g node-gyp
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm ci

ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app

COPY . .

RUN npm run build

# Creating final production image
FROM node:22-alpine

RUN apk add --no-cache vips-dev

ARG NODE_ENV=production
ARG PORT=1337
ARG DATABASE_CLIENT
ARG DATABASE_HOST
ARG DATABASE_PORT
ARG DATABASE_NAME
ARG DATABASE_USERNAME
ARG DATABASE_PASSWORD
ARG JWT_SECRET
ARG ADMIN_JWT_SECRET
ARG APP_KEYS

ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
ENV DATABASE_CLIENT=${DATABASE_CLIENT}
ENV DATABASE_HOST=${DATABASE_HOST}
ENV DATABASE_PORT=${DATABASE_PORT}
ENV DATABASE_NAME=${DATABASE_NAME}
ENV DATABASE_USERNAME=${DATABASE_USERNAME}
ENV DATABASE_PASSWORD=${DATABASE_PASSWORD}
ENV JWT_SECRET=${JWT_SECRET}
ENV ADMIN_JWT_SECRET=${ADMIN_JWT_SECRET}
ENV APP_KEYS=${APP_KEYS}

WORKDIR /opt/

COPY --from=build /opt/node_modules ./node_modules

WORKDIR /opt/app

COPY --from=build /opt/app ./

ENV PATH=/opt/node_modules/.bin:$PATH

RUN chown -R node:node /opt/app

USER node

EXPOSE 1103

CMD ["npm", "run", "start"]
