FROM node:lts-alpine3.11

WORKDIR /var/www/server

COPY ../api/common ./api/common

COPY ../api/lib ./api/lib

COPY ../api/data ./api/data

COPY ../api/scripts ./api/scripts

COPY ../api/package.json ./api

COPY ../api/config.js ./api

COPY ../api/secrets.js .

COPY . .

RUN npm install

CMD npm run start

EXPOSE 4200