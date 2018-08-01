#!/bin/sh

echo ###############################################################################
echo Copying test net configuration files.
echo ###############################################################################

# Generate config.toml and basecoindversion.txt files for each network.

## Create config.toml file.
$TARGET/linux_amd64/gaiad init --name Voyager &>/dev/null

### Add seed nodes from
### https://github.com/cosmos/cosmos-sdk/tree/5c8791743411cac58c502f3b18bfe8a1970e830e/cmd/gaia/testnets#add-seed-nodes
sed --expression="s/seeds = \"\"/seeds = \"718145d422a823fd2a4e1e36e91b92bb0c4ddf8e@gaia-7000.coinculture.net:26656,5922bf29b48a18c2300b85cc53f424fce23927ab@67.207.73.206:26656,7c8b8fd03577cd4817f5be1f03d506f879df98d8@gaia-7000-seed1.interblock.io:26656,a28737ff02391a6e00a1d3b79befd57e68e8264c@gaia-7000-seed2.interblock.io:26656,987ffd26640cd03d08ed7e53b24dfaa7956e612d@gaia-7000-seed3.interblock.io:26656\"/" \
  --in-place ~/.gaiad/config/config.toml

version=$($TARGET/linux_amd64/gaiacli version)

# Download the testnet configuration files
git clone https://github.com/cosmos/testnets ./testnets

## Copy the network configuration files.
mkdir --parents $TARGET/networks
cp --recursive ./testnets/* $TARGET/networks/

for network in $TARGET/networks/*/; do
  ## Copy the config.toml file.
  cp ~/.gaiad/config/config.toml $network/

  ## Create basecoindversion.txt file.
  echo $version > $network/basecoindversion.txt
done