#!/bin/sh

. ./COMMIT.sh
version="$(pwd)/../../../builds/GaiaVersions/$COMMIT"
source="$(pwd)/../../../builds/Gaia"
mkdir -p "$version"
rm -rf "$source"
if [[ -f "$version/linux/gaiad" ]]; then
    echo "Already built"
else
    echo "building new hash"
    export TARGET=/mnt

    docker run \
      --interactive \
      --env COMMIT \
      --env TARGET \
      --mount type=bind,source="$version",target="$TARGET" \
      --rm \
      golang:1.11.5 < build.sh
fi

ln -s ${version} ${source}
