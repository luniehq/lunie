#!/bin/bash

PASSWORD=1234567890
ACCOUNT=main_account
PORT=26657
API_PORT=8080
NETWORK=testnet

./gaiad init --home . --moniker ${ACCOUNT} --chain-id ${NETWORK}
NODEID=$(./gaiad tendermint show-node-id --home .)
echo ${PASSWORD} | ./gaiacli keys add ${ACCOUNT} --home . > main_node.log
./gaiad add-genesis-account $(./gaiacli keys show ${ACCOUNT} --home . --address) 150000stake,100000photino,123cococoin --home .

echo ${PASSWORD} | ./gaiad gentx --name ${ACCOUNT} --home . --home-client .
./gaiad collect-gentxs --home .

aws s3 cp config/genesis.json s3://cosmos-gaia/genesis.json

screen -dmS gaia ./gaiad start --home .
screen -dmS rest ./gaiacli rest-server --laddr tcp://0.0.0.0:${API_PORT} --home . --node http://localhost:${PORT} --chain-id ${NETWORK} --trust-node true

ADDRESS=$(./gaiacli keys show ${ACCOUNT} --home . --address)

while true
do
    aws s3 ls s3://cosmos-gaia/addresses/ | while IFS= read -r row || [[ -n "$row" ]]; do
        DESTINATION=$(echo $row | awk '{print $4}')
        echo ${PASSWORD} | ./gaiacli tx send --home . --from ${ADDRESS} --amount=100stake  --to=${DESTINATION} --chain-id=${NETWORK}
        aws s3 rm s3://cosmos-gaia/addresses/${DESTINATION}
    done
done