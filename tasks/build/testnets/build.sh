#!/bin/sh

echo ###############################################################################
echo Copying testnet configuration files...
echo ###############################################################################

# Generate config.toml for each network.

## Create config.toml file.
builds/Gaia/linux_amd64/gaiad init --name Voyager

### Add seed node.
sed \
  --expression="s/seeds = \"\"/seeds = \"gaia-seeds.interblock.io\"/" \
  --in-place \
  ~/.gaiad/config/config.toml

# Download the testnet configuration files
rm --force --recursive builds/testnets
git clone https://github.com/cosmos/testnets builds/testnets

for network in builds/testnets/*/; do
  cp ~/.gaiad/config/config.toml $network/
done
