FROM keymetrics/pm2:latest-alpine

WORKDIR /var/www/server

COPY ./lib ./lib

COPY ./data ./data

COPY ./cosmos-api-v0-0.1.2 ./cosmos-api-v0-0.1.2

COPY ./cosmos-api-v0-0.2.2 ./cosmos-api-v0-0.2.2

COPY package.json .

COPY config.js .

COPY pm2.json .

COPY index.js .

RUN npm install

CMD [ "pm2-runtime", "start", "pm2.json", "--format"]

EXPOSE 4200