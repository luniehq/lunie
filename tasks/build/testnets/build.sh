#!/bin/sh

echo ###############################################################################
echo Copying testnet configuration files...
echo ###############################################################################

# Generate config.toml for each network.

## Create config.toml file.  Supply 12345678 as a password for the Voyager
## account.
echo 12345678 | builds/Gaia/linux_amd64/gaiad init --moniker Voyager

### Add seed nodes from
### https://github.com/cosmos/cosmos-sdk/tree/5c8791743411cac58c502f3b18bfe8a1970e830e/cmd/gaia/testnets#add-seed-nodes
sed --expression="s/seeds = \"\"/seeds = \"fc345838736d225bcb8f3f547199c4a780f87847@77.74.192.243:26656, 46ea4e2606764dfa504ef7f3b1f813b166a77a1b@206.189.151.41:26656, cc9ebbac32ba77cbdb1e518b20156bcd34e0877d@103.72.145.36:26656\"/" \
  --in-place ~/.gaiad/config/config.toml

# Download the testnet configuration files
rm --force --recursive builds/testnets
git clone https://github.com/cosmos/testnets builds/testnets

for network in builds/testnets/*/; do
  cp ~/.gaiad/config/config.toml $network/
done
