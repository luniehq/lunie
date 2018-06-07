#!/bin/sh

# Install Wine so that we can build for the 'win32' platform.
# https://wiki.debian.org/Wine#Installation_on_Debian_Jessie_and_newer

dpkg --add-architecture i386
apt-get update

apt-get install --yes \
  wine \
  wine32 \
  libwine
