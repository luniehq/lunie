FROM node:9.4.0

# Install Wine so that we can build for the 'win32' platform.
# https://wiki.debian.org/Wine#Installation_on_Debian_Jessie_and_newer
RUN dpkg --add-architecture i386 \
  && apt-get update \
  && apt-get --yes install \
    wine \
    wine32 \
    libwine

RUN touch /usr/local/bin/gaia
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY entrypoint.sh /
ENTRYPOINT [ "/entrypoint.sh" ]
