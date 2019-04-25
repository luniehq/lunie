#!/bin/bash

PASSWORD=1234567890
ACCOUNT=operator_account
PORT=26656
MAINNODEIP=`nslookup node | awk '/Address \d: (.+)/ { print $3 }'`
MAINACCOUNT=main_account
NETWORK=testnet
REQUEST_FOLDER=/mnt/node/addresses
HOME=/etc/home

echo "Connecting to main node at $MAINNODEIP"

sleep 3s # prevent race

while true; do
    echo "Checking for main node id"
    if [[ -f /mnt/node/id.txt ]]; then
        MAINNODEID=`cat /mnt/node/id.txt`
        break
    else
        sleep 1s
    fi
done

rm -rf ${HOME}

# Initialize local node with a secondary account
gaiad init ${ACCOUNT} --chain-id ${NETWORK} --home ${HOME} 2>/dev/null

echo "Initialized"

rm -f ${HOME}/config/genesis.json
cp /mnt/node/config/genesis.json ${HOME}/config/genesis.json

# boot referring to the remote node
gaiad start --p2p.persistent_peers=${MAINNODEID}@${MAINNODEIP}:${PORT} --home ${HOME} > /dev/null &
sh /etc/nodes/declareValidation.sh $PASSWORD $ACCOUNT $REQUEST_FOLDER $NETWORK $HOME