#!/bin/sh

# Download the Cosmos SDK.
mkdir --parents $GOPATH/src/github.com/cosmos
cd $GOPATH/src/github.com/cosmos
git clone https://github.com/cosmos/cosmos-sdk
cd cosmos-sdk
git checkout $COMMIT
make get_tools

# Build Gaia for each platform.

export GOOS
platforms="darwin linux windows"

for GOOS in $platforms; do
  echo Building Cosmos SDK for $GOOS platform.
  make get_vendor_deps
  make install
done

# Give the Linux binaries a prefix to make them like the others.
mkdir --parents $TARGET/linux_amd64
cp /go/bin/gaia* $TARGET/linux_amd64/

cp --recursive /go/bin/*_amd64 $TARGET/

# Generate config.toml and basecoindversion.txt files for each network.

## Create config.toml file.
gaiad init --name Voyager

### Add seed nodes from
### https://github.com/cosmos/cosmos-sdk/tree/5c8791743411cac58c502f3b18bfe8a1970e830e/cmd/gaia/testnets#add-seed-nodes
sed --expression="s/seeds = \"\"/seeds = \"718145d422a823fd2a4e1e36e91b92bb0c4ddf8e@gaia-7000.coinculture.net:26656,5922bf29b48a18c2300b85cc53f424fce23927ab@67.207.73.206:26656,7c8b8fd03577cd4817f5be1f03d506f879df98d8@gaia-7000-seed1.interblock.io:26656,a28737ff02391a6e00a1d3b79befd57e68e8264c@gaia-7000-seed2.interblock.io:26656,987ffd26640cd03d08ed7e53b24dfaa7956e612d@gaia-7000-seed3.interblock.io:26656\"/" \
  --in-place ~/.gaiad/config/config.toml

version=$(gaiacli version)

## Copy the network configuration files.
mkdir --parents $TARGET/networks
cp --recursive cmd/gaia/testnets/* $TARGET/networks/

for network in $TARGET/networks/*/; do
  ## Copy the config.toml file.
  cp ~/.gaiad/config/config.toml $network/

  ## Create basecoindversion.txt file.
  echo $version > $network/basecoindversion.txt
done
