FROM node:9.11.1

COPY installWine.sh /
RUN /installWine.sh
RUN mkdir --parents /usr/src/app
WORKDIR /usr/src/app
COPY entrypoint.sh /
ENTRYPOINT [ "/entrypoint.sh" ]
