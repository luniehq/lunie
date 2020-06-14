FROM node:14

WORKDIR /

ENV NODE_ENV docker

COPY ./api ./api

COPY ./scriptRunner ./scriptRunner

CMD cd scriptRunner && yarn start

EXPOSE 9000 