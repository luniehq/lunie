#!/bin/bash

AMOUNTS=10000000stake
AMOUNTP=5000000photino

REQUEST_FOLDER=/var/addresses

ACCOUNT=main_account
PASSWORD=1234567890
NETWORK=testnet
HOME=/var/nodes/faucet
RICH_ADDRESS=${RICH_ADDRESS:="cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e"}
FIRSTHOME=$1
PORT=26657
MAINNODEIP=localhost
NODE=${MAINNODEIP}:${PORT}

# cleanup
rm -rf ${HOME}
mkdir -p ${HOME}
cp -rf $FIRSTHOME/. $HOME

echo "Starting Faucet"
ADDRESS=$(gaiacli keys show ${ACCOUNT} --home ${HOME} --address)
echo "Faucet account: ${ADDRESS}"
echo "Waiting for funds available"
while true; do
    gaiacli query account ${ADDRESS} --chain-id ${NETWORK} --trust-node --home ${HOME} --node ${NODE} &> /dev/null
    if [ $? -eq 0 ]; then
        break
    fi
done

SEQUENCE=1

echo "Funding rich account ${RICH_ADDRESS}"
echo ${PASSWORD} | gaiacli tx send ${RICH_ADDRESS} 1000000000stake --from ${ACCOUNT} --chain-id ${NETWORK} --yes --home ${HOME} --node ${NODE} --sequence $SEQUENCE &> /dev/null
SEQUENCE=$((SEQUENCE+1))
echo ${PASSWORD} | gaiacli tx send ${RICH_ADDRESS} ${AMOUNTP} --from ${ACCOUNT} --chain-id ${NETWORK} --yes --home ${HOME} --node ${NODE} --sequence $SEQUENCE &> /dev/null
SEQUENCE=$((SEQUENCE+1))

while true; do
    # Is anyone asking for money
    REQUESTS=${REQUEST_FOLDER}/*
    for FILE in $REQUESTS
    do
        DESTINATION=$(basename "$FILE") # remove folder path from file name
        # for every file in the list pick the address and give money to it, then delete the file
        if [[ ${#DESTINATION} -eq 45 ]];
        then
            dt=$(date '+%d/%m/%Y %H:%M:%S');
            gaiacli query account ${DESTINATION} --chain-id ${NETWORK} --trust-node --home ${HOME} --node ${NODE} &> /dev/null
            if [ $? -eq 0 ]; then
                echo "$dt - $DESTINATION already funded, accounts are only funded once"
            else
                # echo "stakes $AMOUNTS at $DESTINATION"
                echo ${PASSWORD} | gaiacli tx send ${DESTINATION} ${AMOUNTS} --home ${HOME} --from ${ACCOUNT} --chain-id=${NETWORK} --yes --node ${NODE} --sequence $SEQUENCE &> /dev/null
                if [ ! $? -eq 0 ]; then
                    echo "!!Funding didn't work!!"
                    continue
                fi
                SEQUENCE=$((SEQUENCE+1))
                # echo "photino $AMOUNTP at $DESTINATION"
                # echo ${PASSWORD} | gaiacli tx send ${DESTINATION} ${AMOUNTP} --home ${HOME} --from ${ADDRESS} --chain-id=${NETWORK} --yes --node ${NODE} --sequence $SEQUENCE
                # SEQUENCE=$((SEQUENCE+1))
                echo "$dt - $DESTINATION funded, enjoy!"
            fi

            # Remove this address from the ones that needs money
            rm ${REQUEST_FOLDER}/${DESTINATION}
        fi
    done
    sleep 1s
done
