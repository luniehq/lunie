#!/bin/bash

PASSWORD=1234567890
ACCOUNT=operator_account
PORT=26656
MAINNODEID=d08c69fa85969f3d0173f23aadc40268559d0f66
MAINNODEIP=172.31.35.89
MAINACCOUNT=main_account
NETWORK=testnet

./gaiad init --home . --moniker ${ACCOUNT} --chain-id ${NETWORK}

# GET Genesis file into config/genesis.json
NODEID=$(./gaiad tendermint show-node-id --home .)

screen -dmS gaia ./gaiad start --home . --p2p.laddr=tcp://0.0.0.0:$((PORT)) --address=tcp://0.0.0.0:$((PORT+1)) --rpc.laddr=tcp://0.0.0.0:$((PORT+2)) --p2p.persistent_peers="$MAINNODEID@$MAINNODEIP:$((PORT))"

PUBKEY=$(./gaiad tendermint show-validator --home .)
echo ${PASSWORD} | ./gaiacli keys add ${ACCOUNT} --home . > secondary_node.log
ADDRESS=$(./gaiacli keys show ${ACCOUNT} --home . --address)
echo ${PUBKEY} > ./${ADDRESS}

aws s3 cp ${ADDRESS} s3://cosmos-gaia/addresses/${ADDRESS}

poor=true
while ${poor}
do
    ACCOUNT_INFO=$(./gaiacli query account cosmos1484awfj0nmqtp7fwwsfpf480xwpmj7c4zr3wl8 --chain-id testnet --trust-node --home .)
    if [[ ${ACCOUNT_INFO} == *"auth/Account"* ]]; then
        echo "Address funded, thanks main node!"
        poor=false
    fi
done

echo ${PASSWORD} | ./gaiacli tx staking create-validator --home . --from ${ACCOUNT} --amount=10stake --pubkey=${PUBKEY} --address-delegator=${ADDRESS} --moniker=${ACCOUNT} --chain-id=${NETWORK} --commission-max-change-rate=0 --commission-max-rate=0 --commission-rate=0 --json
