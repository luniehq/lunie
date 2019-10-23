FROM keymetrics/pm2:latest-alpine

WORKDIR /var/www/server

RUN "node install"

COPY ./node_modules ./node_modules

COPY ./lib ./lib

COPY ./data ./data

COPY package.json .

COPY config.js .

COPY pm2.json .

COPY index.js .

CMD [ "pm2-runtime", "start", "pm2.json", "--format"]

EXPOSE 4200