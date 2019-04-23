#!/bin/sh

export TAG=`cat ./VERSION`
version="$(pwd)/../../../builds/GaiaVersions/$TAG"
source="$(pwd)/../../../builds/Gaia"
mkdir -p "$version"
rm -rf "$source"

unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     export PLATFORM=linux;;
    Darwin*)    export PLATFORM=darwin;;
    CYGWIN*)    export PLATFORM=windows;;
    MINGW*)    export PLATFORM=windows;;
    *)          echo "UNKNOWN machine:${unameOut}"
esac

if [[ -f "$version/${PLATFORM}_amd64/gaiad" ]]; then
    echo "Already built $TAG for $PLATFORM"
else
    echo "Building new version: $TAG for $PLATFORM "

    export TARGET=/mnt

    docker run \
      --interactive \
      --env TAG \
      --env TARGET \
      --env PLATFORM \
      --mount type=bind,source="$version",target="$TARGET" \
      --rm \
      golang:1.11.5 < build.sh
fi

ln -s ${version} ${source}
