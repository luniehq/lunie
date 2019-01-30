#!/bin/bash

PASSWORD=1234567890
ACCOUNT=main_account
PORT=26657
API_PORT=8080
NETWORK=testnet
AMOUNT=100stake

./gaiad init --home . --moniker ${ACCOUNT} --chain-id ${NETWORK}
NODEID=$(./gaiad tendermint show-node-id --home .)
echo ${PASSWORD} | ./gaiacli keys add ${ACCOUNT} --home . > main_node.log
./gaiad add-genesis-account $(./gaiacli keys show ${ACCOUNT} --home . --address) 150000stake,100000photino,123cococoin --home .

echo ${PASSWORD} | ./gaiad gentx --name ${ACCOUNT} --home . --home-client .
./gaiad collect-gentxs --home .

aws s3 cp config/genesis.json s3://cosmos-gaia/genesis.json

# boot proper nodes in reachable detached sessions
screen -dmS gaia ./gaiad start --home .
screen -dmS rest ./gaiacli rest-server --laddr tcp://0.0.0.0:${API_PORT} --home . --node http://localhost:${PORT} --chain-id ${NETWORK} --trust-node true

# get my address to use it as source of richness for others
ADDRESS=$(./gaiacli keys show ${ACCOUNT} --home . --address)

while true
do
    # Is anyone asking for money
    LIST=$(aws s3 ls s3://cosmos-gaia/addresses/)
    if [[ -n "${LIST}" ]];
    then
        PID=$(lsof -ti tcp:${API_PORT})
        if [[ -n "${PID}" ]];
        then
            # we cannot use gaiacli while the rest server is running, it locks the resources
            kill -9 ${PID}
        fi

        echo ${LIST} | while IFS= read -r row || [[ -n "$row" ]]; do
            # for every file in the list pick the address and give money to it, then delete the file
            DESTINATION=$(echo $row | awk '{print $4}')
            # Just in case we were running this command with rest-server switched on
            ADDRESS=$(./gaiacli keys show ${ACCOUNT} --home . --address)
            echo ${PASSWORD} | ./gaiacli tx send --home . --from ${ADDRESS} --amount=${AMOUNT}  --to=${DESTINATION} --chain-id=${NETWORK}
            aws s3 rm s3://cosmos-gaia/addresses/${DESTINATION}
        done

        #restore the server
        screen -dmS rest ./gaiacli rest-server --laddr tcp://0.0.0.0:${API_PORT} --home . --node http://localhost:${PORT} --chain-id ${NETWORK} --trust-node true
    fi
done
