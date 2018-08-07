#!/bin/sh

if [ ! -f $(pwd)/../../../builds/gaia/linux_amd64/gaiad ]; then
  printf "Gaia missing; building first.\n"
  (cd ../../.. && yarn build:gaia)
fi

docker run \
  --interactive \
  --mount type=bind,source="$(pwd)/../../../builds",target=/go/builds \
  --rm \
  golang:1.10.2 < build.sh
