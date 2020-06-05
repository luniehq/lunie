FROM node:lts-alpine3.11

WORKDIR /var/www/server

COPY ./common ./common

COPY ./lib ./lib

COPY ./data ./data

COPY ./scripts ./scripts

COPY ./cosmos-api-v0-0.1.2 ./cosmos-api-v0-0.1.2

COPY ./cosmos-api-v0-0.2.2 ./cosmos-api-v0-0.2.2

COPY package.json .

COPY config.js .

COPY secrets.js .

COPY index.js .

RUN npm install

CMD npm run start

EXPOSE 4200