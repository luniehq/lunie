#!/bin/sh

# Download the Cosmos SDK.
mkdir --parents $GOPATH/src/github.com/cosmos
cd $GOPATH/src/github.com/cosmos
git clone https://github.com/cosmos/cosmos-sdk
cd cosmos-sdk
git checkout $COMMIT
echo ###############################################################################
echo Installing development tools.
echo ###############################################################################
make get_tools

# Build Gaia for each platform.

export GOOS
platforms="darwin linux windows"

for GOOS in $platforms; do
  echo ###############################################################################
  echo Building Cosmos SDK for $GOOS platform.
  echo ###############################################################################
  make get_vendor_deps
  make install
done

# Give the Linux binaries a prefix to make them like the others.
mkdir --parents $TARGET/linux_amd64
cp /go/bin/gaia* $TARGET/linux_amd64/

cp --recursive /go/bin/*_amd64 $TARGET/
