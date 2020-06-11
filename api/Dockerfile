FROM node:lts-alpine3.11

WORKDIR /var/www/server

COPY ./common ./common

COPY ./lib ./lib

COPY ./data ./data

COPY ./scripts ./scripts

COPY package.json .

COPY config.js .

COPY secrets.js .

COPY index.js .

RUN npm install

CMD npm run start

EXPOSE 4200