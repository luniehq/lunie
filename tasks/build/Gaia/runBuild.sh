#!/bin/sh

./COMMIT.sh
source=$(pwd)/../../../builds/gaia
mkdir -p $source
export TARGET=/mnt

docker run \
  --interactive \
  --env COMMIT \
  --env TARGET \
  --mount type=bind,source=$source,target=$TARGET \
  --rm \
  golang:1.10.2 < build.sh
