FROM node:lts-alpine3.11

WORKDIR /var/www/server

COPY package.json .

RUN npm install

COPY ./common ./common

COPY ./lib ./lib

COPY ./data ./data

COPY ./scripts ./scripts

COPY config.js .

COPY secrets.js .

COPY index.js .

CMD npm run start

EXPOSE 4200