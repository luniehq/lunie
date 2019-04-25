#!/bin/bash

PASSWORD=1234567890
ACCOUNT=operator_account
PORT=26656
MAINNODEIP=node
MAINACCOUNT=main_account
NETWORK=testnet
VALIDATOR_AMOUNT=10000000stake
REQUEST_FOLDER=/mnt/node/addresses

# Initialize local node with a secondary account
gaiad init ${ACCOUNT} --chain-id ${NETWORK}

idNotFound=true
while ${idNotFound}
do
    if [ -f /mnt/node/id.txt ]; then
        MAINNODEID=$(</mnt/node/id.txt)
        idNotFound=false
    else
        sleep 1s
    fi
done

cp -f /mnt/node/config/genesis.json ./config/genesis.json
NODEID=$(gaiad tendermint show-node-id)

# boot referring to the remote node
gaiad start --p2p.persistent_peers="$MAINNODEID@$MAINNODEIP:$((PORT))"

# get the key to make my node validator
PUBKEY=$(gaiad tendermint show-validator)
echo ${PASSWORD} | gaiacli keys add ${ACCOUNT} > secondary_node.log
ADDRESS=$(gaiacli keys show ${ACCOUNT} --address)
echo "ADDRESS ${ADDRESS}"
echo ${PUBKEY} > ./${ADDRESS}

# ask money by declaring my node
cp ./${ADDRESS} ${REQUEST_FOLDER}/${ADDRESS}

poor=true
while ${poor}
do
    # query my account to check if I'm still poor
    ACCOUNT_INFO=$(gaiacli query account ${ADDRESS} --chain-id ${NETWORK} --trust-node)
    if [[ ${ACCOUNT_INFO} == *"steak"* ]]; then
        echo "Address funded, thanks main node!"
        poor=false
    fi
    sleep 3s
done

echo ${PASSWORD} | gaiacli tx staking create-validator --from ${ACCOUNT} --amount=${VALIDATOR_AMOUNT} --pubkey=${PUBKEY} --moniker=${ACCOUNT} --chain-id=${NETWORK} --commission-max-change-rate=0 --commission-max-rate=0 --commission-rate=0 --min-self-delegation=1 --yes
