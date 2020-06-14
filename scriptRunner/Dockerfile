FROM node:14

WORKDIR /

ENV NODE_ENV docker

COPY ./api/common ./api/common

COPY ./api/lib ./api/lib

COPY ./api/data ./api/data

COPY ./api/scripts ./api/scripts

COPY ./api/package.json ./api

COPY ./api/config.js ./api

COPY ./api/package.json ./api/package.json

RUN true

COPY ./package.json ./package.json

RUN true

COPY ./api/secrets.js ./api

COPY ./scriptRunner ./scriptRunner

RUN yarn

CMD cd scriptRunner && npm run start

EXPOSE 9000 