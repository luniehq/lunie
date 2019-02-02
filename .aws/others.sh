#!/bin/bash

PASSWORD=1234567890
ACCOUNT=operator_account
PORT=26656
# TODO: hardcoded temporary, this will become a parameter coming from the first ECS instance
MAINNODEID=d08c69fa85969f3d0173f23aadc40268559d0f66
MAINNODEIP=172.31.35.89
MAINACCOUNT=main_account
NETWORK=testnet
VALIDATOR_AMOUNT=10stake

# Initialize local node with a secondary account
./gaiad init --home . --moniker ${ACCOUNT} --chain-id ${NETWORK}

GENESIS=`aws s3 ls s3://cosmos-gaia/genesis.json | grep genesis.json`
while [[ -z "$GENESIS" ]]; do
    sleep 3s
    ISTHERE=`aws s3 ls s3://cosmos-gaia/genesis.json | grep genesis.json`
done
aws s3 cp s3://cosmos-gaia/genesis.json config/genesis.json

# GET Genesis file into config/genesis.json
NODEID=$(./gaiad tendermint show-node-id --home .)

# boot referring to the remote node
screen -dmS gaia ./gaiad start --home . --p2p.laddr=tcp://0.0.0.0:$((PORT)) --address=tcp://0.0.0.0:$((PORT+1)) --rpc.laddr=tcp://0.0.0.0:$((PORT+2)) --p2p.persistent_peers="$MAINNODEID@$MAINNODEIP:$((PORT))"

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
    if [[ ${ACCOUNT_INFO} == *"auth/Account"* ]]; then
        echo "Address funded, thanks main node!"
        poor=false
    fi
    sleep 3s
done

echo ${PASSWORD} | ./gaiacli tx staking create-validator --home . --from ${ACCOUNT} --amount=${VALIDATOR_AMOUNT} --pubkey=${PUBKEY} --address-delegator=${ADDRESS} --moniker=${ACCOUNT} --chain-id=${NETWORK} --commission-max-change-rate=0 --commission-max-rate=0 --commission-rate=0 --json
