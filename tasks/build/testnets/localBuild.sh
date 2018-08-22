#!/bin/sh

if [ ! -f $(pwd)/../../../builds/Gaia/linux_amd64/gaiad ]; then
  printf "Gaia missing; building first.\n"
  (cd ../../.. && yarn build:gaia)
fi
docker create \
  --name=builder \
  --interactive \
  --rm	\
  golang:1.10.2
docker cp "$(pwd)/../../../builds" builder:/go/builds
docker cp build.sh builder:/go/builds/
docker start builder
docker exec builder /go/builds/build.sh
docker cp builder:/go/builds/testnets "$(pwd)/../../../builds/testnets"
docker stop builder
