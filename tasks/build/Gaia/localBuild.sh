#!/bin/sh

. ./COMMIT.sh
version="$(pwd)/../../../builds/GaiaVersions/$COMMIT"
source="$(pwd)/../../../builds/Gaia"
mkdir -p "$version"
rm -rf "$source"

unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     export PLATFORM=linux;;
    Darwin*)    export PLATFORM=darwin;;
    CYGWIN*)    export PLATFORM=windows;;
    *)          echo "UNKNOWN machine:${unameOut}"
esac

if [[ -f "$version/${PLATFORM}_amd64/gaiad" ]]; then
    echo "Already built $COMMIT for $PLATFORM"
else
    echo "Building new version: $COMMIT for $PLATFORM "

    export TARGET=/mnt

    docker run \
      --interactive \
      --env COMMIT \
      --env TARGET \
      --env PLATFORM \
      --mount type=bind,source="$version",target="$TARGET" \
      --rm \
      golang:1.11.5 < build.sh
fi

ln -s ${version} ${source}
