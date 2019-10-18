FROM node:10-alpine
WORKDIR /app
COPY ./data /app/data
COPY ./lib /app/lib
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
COPY index.js /app/index.js
COPY config.js /app/config.js
RUN npm install
EXPOSE 4000
CMD ["node", "index.js"]
