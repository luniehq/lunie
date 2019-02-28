#!/bin/bash

PASSWORD=1234567890
ACCOUNT=main_account
PORT=26657
API_PORT=8080
NETWORK=testnet

# first of all remove old genesis, we do not want other node to boot with the wrong stuff
aws s3 rm s3://cosmos-gaia/genesis.json

# Initialize local node with an account name and a chain
./gaiad init ${ACCOUNT} --home . --chain-id ${NETWORK}
NODEID=$(./gaiad tendermint show-node-id --home .)

# Create our main account and add it to the genesis with a lot of money
echo ${PASSWORD} | ./gaiacli keys add ${ACCOUNT} --home . > account_address.log
./gaiad add-genesis-account $(./gaiacli keys show ${ACCOUNT} --home . --address) 100000000000000000stake,999000000000photino,123123123123cococoin --home .

echo ${PASSWORD} | ./gaiad gentx --name ${ACCOUNT} --home . --home-client .
./gaiad collect-gentxs --home .

# Make our genesis avaialable to the secondary nodes
aws s3 cp config/genesis.json s3://cosmos-gaia/genesis.json

# boot proper nodes in reachable detached sessions
screen -dmS gaia ./gaiad start --home .
screen -dmS rest ./gaiacli rest-server --laddr tcp://0.0.0.0:${API_PORT} --home . --node http://localhost:${PORT} --chain-id ${NETWORK} --trust-node true
screen -dmS faucet ./faucet.sh ${ACCOUNT} ${PASSWORD} ${NETWORK}

echo ${NODEID}
