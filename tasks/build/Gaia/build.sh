#!/bin/sh

# Download the Cosmos SDK.
mkdir --parents $GOPATH/src/github.com/cosmos
cd $GOPATH/src/github.com/cosmos
git clone https://github.com/cosmos/cosmos-sdk
cd cosmos-sdk
git checkout $TAG
echo ###############################################################################
echo Installing development tools.
echo ###############################################################################
make tools

# Build Gaia for each platform.

export GOOS
platforms=${PLATFORM:="darwin linux windows"}

for GOOS in $platforms; do
  echo ###############################################################################
  echo Building Cosmos SDK for $GOOS platform.
  echo ###############################################################################
  make install

  if [ "$GOOS" = "linux" ]; then
    # Give the Linux binaries a prefix to make them like the others.
    mkdir --parents $TARGET/linux_amd64
    cp /go/bin/gaia* $TARGET/linux_amd64/
  fi
done

# copy build files to target dir
if stat -t /go/bin/*_amd64 >/dev/null 2>&1; then
  cp --recursive /go/bin/*_amd64 $TARGET/
fi
