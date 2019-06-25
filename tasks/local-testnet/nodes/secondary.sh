#!/bin/bash

MAINNODEHOME=$1
NUMBER=$2
PASSWORD=1234567890
ACCOUNT=operator_account_$NUMBER
MAINNODEPORT=26656
STARTPORT=$((3*$NUMBER+$MAINNODEPORT))
MAINNODEIP=localhost
MAINACCOUNT=main_account
NETWORK=testnet
REQUEST_FOLDER=/var/addresses
HOME=/var/nodes/$NUMBER
MAINNODEID=`cat $MAINNODEHOME/id.txt`

# clean up
rm -rf ${HOME}

echo "Starting secondary node $ACCOUNT"

# Initialize local node with a secondary account
gaiad init ${ACCOUNT} --chain-id ${NETWORK} --home ${HOME} &> /dev/null

# echo "Initialized"

rm -f ${HOME}/config/genesis.json
cp $MAINNODEHOME/config/genesis.json ${HOME}/config/genesis.json

sed -i -e 's/index_all_tags = .*$/index_all_tags = false/' ${HOME}/config/config.toml

# boot referring to the remote node
gaiad start --p2p.persistent_peers=${MAINNODEID}@${MAINNODEIP}:${MAINNODEPORT} --p2p.laddr=tcp://0.0.0.0:${STARTPORT} --address=tcp://0.0.0.0:$(($STARTPORT + 1)) --rpc.laddr=tcp://0.0.0.0:$(($STARTPORT + 2)) --home ${HOME} > /dev/null &
sh /etc/nodes/declareValidation.sh $PASSWORD $ACCOUNT $REQUEST_FOLDER $NETWORK $HOME
wait