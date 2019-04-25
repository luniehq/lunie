#!/bin/bash

PASSWORD=1234567890
ACCOUNT=operator_account
PORT=26656
MAINNODEIP=`host node`
MAINACCOUNT=main_account
NETWORK=testnet
VALIDATOR_AMOUNT=10000000stake
REQUEST_FOLDER=/mnt/node/addresses
HOME=/etc/home

echo MAINNODEIP

sleep 8s # prevent race

idNotFound=true
while ${idNotFound}
do
    echo "Checking for main node id"
    if [[ -f /mnt/node/id.txt ]]; then
        MAINNODEID=`cat /mnt/node/id.txt`
        idNotFound=false
    else
        sleep 1s
    fi
done

echo $MAINNODEID

rm -rf ${HOME}

# Initialize local node with a secondary account
gaiad init ${ACCOUNT} --chain-id ${NETWORK} --home ${HOME}

echo "Initialized"

rm -f ${HOME}/config/genesis.json
cp /mnt/node/config/genesis.json ${HOME}/config/genesis.json

echo "${MAINNODEID}@http://${MAINNODEIP}:${PORT}"

# boot referring to the remote node
gaiad start --p2p.persistent_peers=${MAINNODEID}@http://${MAINNODEIP}:${PORT} --home ${HOME}

# get the key to make my node validator
PUBKEY=$(gaiad tendermint show-validator)
echo ${PASSWORD} | gaiacli keys add ${ACCOUNT} --home ${HOME}
ADDRESS=$(gaiacli keys show ${ACCOUNT} --address)
echo "ADDRESS ${ADDRESS}"
echo ${PUBKEY} > ${REQUEST_FOLDER}/${ADDRESS} # request money from faucet

poor=true
while ${poor}
do
    # query my account to check if I'm still poor
    ACCOUNT_INFO=$(gaiacli query account ${ADDRESS} --chain-id ${NETWORK} --trust-node --home ${HOME})
    if [[ ${ACCOUNT_INFO} == *"steak"* ]]; then
        echo "Address funded, thanks main node!"
        poor=false
    fi
    sleep 3s
done

echo ${PASSWORD} | gaiacli tx staking create-validator --from ${ACCOUNT} --amount=${VALIDATOR_AMOUNT} --pubkey=${PUBKEY} --moniker=${ACCOUNT} --chain-id=${NETWORK} --commission-max-change-rate=0 --commission-max-rate=0 --commission-rate=0 --min-self-delegation=1 --yes  --home ${HOME}
