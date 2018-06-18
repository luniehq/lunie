#!/bin/sh

mkdir --parents $GOPATH/src/github.com/cosmos
cd $GOPATH/src/github.com/cosmos
git clone https://github.com/cosmos/cosmos-sdk
cd cosmos-sdk
git checkout $COMMIT
make get_tools
export GOOS

for GOOS in darwin linux windows; do
  echo Building Cosmos SDK for $GOOS platform.
  make get_vendor_deps
  make install
done

mkdir --parents $TARGET/linux_amd64
cp /go/bin/gaia* $TARGET/linux_amd64/
cp --recursive /go/bin/*_amd64 $TARGET/
