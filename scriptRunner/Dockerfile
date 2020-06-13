FROM node:lts-alpine3.11

WORKDIR /

COPY ./api/common ./api/common

COPY ./api/lib ./api/lib

COPY ./api/data ./api/data

COPY ./api/scripts ./api/scripts

COPY ./api/package.json ./api

COPY ./api/config.js ./api

COPY ./api/secrets.js .

COPY ./scriptRunner ./scriptRunner

RUN cd scriptRunner && npm install

CMD cd scriptRunner && npm run start

EXPOSE 9000 