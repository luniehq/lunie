#!/bin/bash

PASSWORD=1234567890
ACCOUNT=main_account
PORT=26657
API_PORT=8080
NETWORK=testnet
AMOUNT=100stake

# first of all remove old genesis, we do not want other node to boot with the wrong stuff
aws s3 rm s3://cosmos-gaia/genesis.json

# Initialize local node with an account name and a chain
./gaiad init --home . --moniker ${ACCOUNT} --chain-id ${NETWORK}
NODEID=$(./gaiad tendermint show-node-id --home .)

# Create our main account and add it to the genesis with a lot of money
echo ${PASSWORD} | ./gaiacli keys add ${ACCOUNT} --home . > main_node.log
./gaiad add-genesis-account $(./gaiacli keys show ${ACCOUNT} --home . --address) 150000stake,100000photino,123cococoin --home .

echo ${PASSWORD} | ./gaiad gentx --name ${ACCOUNT} --home . --home-client .
./gaiad collect-gentxs --home .

# Make our genesis avaialable to the secondary nodes
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
        # TODO: SRE team is working on a clean solution.
        # This hacky version is temporary and will be replaced by a stargate running on a separate machine
        # Remove this logic as soon as we put back the deploy-gaia automation

        # Check if a stargate is locally running
        PID=$(lsof -ti tcp:${API_PORT})
        if [[ -n "${PID}" ]];
        then
            # we cannot use gaiacli while the rest server is running, it locks the resources
            kill -9 ${PID}
        fi

        echo ${LIST} | while IFS= read -r row || [[ -n "$row" ]]; do
            # for every file in the list pick the address and give money to it, then delete the file
            DESTINATION=$(echo $row | awk '{print $4}')

            # Just in case we were running this command with rest-server switched on, get again the address
            ADDRESS=$(./gaiacli keys show ${ACCOUNT} --home . --address)
            echo ${PASSWORD} | ./gaiacli tx send --home . --from ${ADDRESS} --amount=${AMOUNT}  --to=${DESTINATION} --chain-id=${NETWORK}

            # Remove this address from the ones that needs money
            aws s3 rm s3://cosmos-gaia/addresses/${DESTINATION}
        done

        #restore the rest server
        screen -dmS rest ./gaiacli rest-server --laddr tcp://0.0.0.0:${API_PORT} --home . --node http://localhost:${PORT} --chain-id ${NETWORK} --trust-node true
    fi
done
