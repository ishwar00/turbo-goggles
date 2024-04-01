# syntax=docker/dockerfile:1
ARG NODE_VERSION=20
FROM --platform=linux/amd64 node:${NODE_VERSION}-alpine3.18

WORKDIR /usr/app
COPY . .
RUN npm install
RUN npm run build

ENV NODE_ENV			 production
ENV JWT_TOKEN_SECRET_KEY <jwt-secret-key>
ENV JWT_TOKEN_EXPIRY     1200
ENV APP_HOST             0.0.0.0
ENV APP_PORT             8000
ENV BCRYPT_SALT          <bcryptjs-salt>
ENV DATABASE_URL         <mongodb-connection-string>

EXPOSE 8000
CMD ["npm", "start"]
