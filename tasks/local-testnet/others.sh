#!/bin/bash

PASSWORD=1234567890
ACCOUNT=operator_account
PORT=26656
# TODO: hardcoded temporary, this will become a parameter coming from the first ECS instance
MAINNODEID=03bd1fd646a9684eb53d40fd342529b5dd9accbf
MAINNODEIP=172.31.35.89
MAINACCOUNT=main_account
NETWORK=testnet
VALIDATOR_AMOUNT=10000000stake

# Initialize local node with a secondary account
./gaiad init ${ACCOUNT} --home . --chain-id ${NETWORK}

GENESIS=`aws s3 ls s3://cosmos-gaia/genesis.json | grep genesis.json`
while [[ -z "$GENESIS" ]]; do
    sleep 3s
    GENESIS=`aws s3 ls s3://cosmos-gaia/genesis.json | grep genesis.json`
done
aws s3 cp s3://cosmos-gaia/genesis.json config/genesis.json

# GET Genesis file into config/genesis.json
NODEID=$(./gaiad tendermint show-node-id --home .)

# boot referring to the remote node
screen -dmSL gaia ./gaiad start --home . --p2p.persistent_peers="$MAINNODEID@$MAINNODEIP:$((PORT))"

# get the key to make my node validator
PUBKEY=$(./gaiad tendermint show-validator --home .)
echo ${PASSWORD} | ./gaiacli keys add ${ACCOUNT} --home . > secondary_node.log
ADDRESS=$(./gaiacli keys show ${ACCOUNT} --home . --address)
echo ${PUBKEY} > ./${ADDRESS}

# ask money by declaring my node
aws s3 cp ${ADDRESS} s3://cosmos-gaia/addresses/${ADDRESS}

poor=true
while ${poor}
do
    # query my account to check if I'm still poor
    ACCOUNT_INFO=$(./gaiacli query account ${ADDRESS} --chain-id ${NETWORK} --trust-node --home .)
    if [[ ${ACCOUNT_INFO} == *"steak"* ]]; then
        echo "Address funded, thanks main node!"
        poor=false
    fi
    sleep 3s
done

echo ${PASSWORD} | ./gaiacli tx staking create-validator --home . --from ${ACCOUNT} --amount=${VALIDATOR_AMOUNT} --pubkey=${PUBKEY} --moniker=${ACCOUNT} --chain-id=${NETWORK} --commission-max-change-rate=0 --commission-max-rate=0 --commission-rate=0 --min-self-delegation=1 --yes
