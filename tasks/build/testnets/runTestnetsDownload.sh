#!/bin/sh

source="$(pwd)/../../../builds/Gaia"
mkdir -p "$source"
export TARGET=/mnt

docker run \
  --interactive \
  --env TARGET \
  --mount type=bind,source="$source",target="$TARGET" \
  --rm \
  golang:1.10.2 < testnets.sh
