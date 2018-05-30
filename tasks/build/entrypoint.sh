#!/bin/sh
set -o errexit
set -o xtrace

# Cosmos SDK

cd $GOPATH/src/github.com/cosmos
git clone https://github.com/cosmos/cosmos-sdk
cd cosmos-sdk
git checkout $SDK_COMMIT
export GOOS

for GOOS in darwin linux windows; do
  echo Building Cosmos SDK for platform \"$GOOS\".
  make get_vendor_deps
  make install
done

# Voyager

cd /usr/src/app
git clone /mnt/.git .
git checkout $COMMIT
ln --symbolic /mnt/builds
yarn install

for platform in darwin linux win32; do
  node tasks/build/buildPlatform.js --platform=$platform "$@"
done
