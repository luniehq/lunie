#!/bin/bash

PASSWORD=$1
ACCOUNT=$2
REQUEST_FOLDER=$3
NETWORK=$4
HOME=$5
VALIDATOR_AMOUNT=10000000stake

# get the key to make my node validator
PUBKEY=$(gaiad tendermint show-validator)
echo ${PASSWORD} | gaiacli keys add ${ACCOUNT} --home ${HOME}
ADDRESS=$(gaiacli keys show ${ACCOUNT} --address --home ${HOME})
echo "Requesting funds for address: ${ADDRESS}"
echo ${PUBKEY} > ${REQUEST_FOLDER}/${ADDRESS} # request money from faucet

poor=true
while ${poor}
do
    echo "Waiting for funds to declare node to be a validator"
    # query my account to check if I'm still poor
    ACCOUNT_INFO=$(gaiacli query account ${ADDRESS} --chain-id ${NETWORK} --trust-node --home ${HOME})
    if [ -z "${$ACCOUNT_INFO##*steak*}" ]; then
        echo "Address funded, thanks main node!"
        poor=false
    fi
    sleep 3s
done

echo ${PASSWORD} | gaiacli tx staking create-validator --from ${ACCOUNT} --amount ${VALIDATOR_AMOUNT} --pubkey ${PUBKEY} --moniker ${ACCOUNT} --chain-id ${NETWORK} --commission-max-change-rate=0 --commission-max-rate=0 --commission-rate=0 --min-self-delegation=1 --yes --home ${HOME}