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
./gaiad add-genesis-account $(./gaiacli keys show ${ACCOUNT} --home . --address) 1000000000000000000000stake,100000000000000000000photino,123123123123123123cococoin --home .

echo ${PASSWORD} | ./gaiad gentx --name ${ACCOUNT} --home . --home-client .
./gaiad collect-gentxs --home .

sed -i .bak -e 's/\"inflation\".*$/\"inflation\":\ \"0.000000001300000000\",/' -e 's/\"inflation_max\".*$/\"inflation_max\":\ \"0.000000002000000000\",/' -e 's/\"inflation_min\".*$/\"inflation_min\":\ \"0.000000000700000000\",/' -e 's/\"goal_bonded\".*$/\"goal_bonded\":\ \"0.000000006700000000\",/' ./genesis.json

# Make our genesis avaialable to the secondary nodes
aws s3 cp config/genesis.json s3://cosmos-gaia/genesis.json

# boot proper nodes in reachable detached sessions
screen -dmS gaia ./gaiad start --home .
screen -dmS rest ./gaiacli rest-server --laddr tcp://0.0.0.0:${API_PORT} --home . --node http://localhost:${PORT} --chain-id ${NETWORK} --trust-node true
screen -dmSL faucet ./faucet.sh ${ACCOUNT} ${PASSWORD} ${NETWORK}

echo ${NODEID}
