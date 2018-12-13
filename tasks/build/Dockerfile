FROM node:10.13.0

COPY installWine.sh /
RUN /installWine.sh
RUN mkdir --parents /usr/src/app
WORKDIR /usr/src/app
COPY entrypoint.sh /
ENTRYPOINT [ "/entrypoint.sh" ]
