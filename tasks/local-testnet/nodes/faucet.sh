#!/bin/bash

AMOUNTS=10000000stake
AMOUNTP=5000000photino
# AMOUNTC=123123cococoin

REQUEST_FOLDER=/mnt/node/addresses

ACCOUNT=main_account
PASSWORD=1234567890
NETWORK=testnet
HOME=/etc/home
TARGET=/mnt/node
PORT=26657
MAINNODEIP=`nslookup node | awk '/Address \d: (.+)/ { print $3 }'`
NODE=${MAINNODEIP}:${PORT}

rm -rf ${HOME}

sleep 10s # prevent race

while true; do
    echo "Checking for main node id"
    if [[ -f /mnt/node/id.txt ]]; then
        break
    else
        sleep 1s
    fi
done

cp -rf $TARGET $HOME

echo "Starting Faucet"
gaiacli keys show ${ACCOUNT} --home ${HOME}
ADDRESS=$(gaiacli keys show ${ACCOUNT} --home ${HOME} --address)
echo "Faucet account: ${ADDRESS}"
gaiacli query account ${ADDRESS} --chain-id ${NETWORK} --trust-node --home ${HOME} --node ${NODE}

SEQUENCE=1

echo "Funding rich account ${RICH_ADDRESS}"
echo ${PASSWORD} | gaiacli tx send ${RICH_ADDRESS} 1000000000stake --from ${ACCOUNT} --chain-id ${NETWORK} --yes --home ${HOME} --node ${NODE} --sequence $SEQUENCE
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
            gaiacli query account ${DESTINATION} --chain-id ${NETWORK} --trust-node --home ${HOME} --node ${NODE} 2> /dev/null
            if [ $? -eq 0 ]; then
                echo "$dt - $DESTINATION already funded, accounts are only funded once"
            else
                echo "stakes $AMOUNTS at $DESTINATION"
                echo ${PASSWORD} | gaiacli tx send ${DESTINATION} ${AMOUNTS} --home ${HOME} --from ${ACCOUNT} --chain-id=${NETWORK} --yes --node ${NODE} --sequence $SEQUENCE
                if [ ! $? -eq 0 ]; then
                    echo "!!Funding didn't work!!"
                    continue
                fi
                SEQUENCE=$((SEQUENCE+1))
                #sleep 5s # TODO: should be smarter, check if block was created or not
                #echo "photino $AMOUNTP at $DESTINATION"
                #echo ${PASSWORD} | gaiacli tx send ${DESTINATION} ${AMOUNTP} --home ${HOME} --from ${ADDRESS} --chain-id=${NETWORK} --yes
                # echo ${PASSWORD} | gaiacli tx send ${DESTINATION} ${AMOUNTC} --home ${HOME} --from ${ADDRESS} --chain-id=${NETWORK}
                echo "$dt - $DESTINATION funded, enjoy!"
            fi

            # Remove this address from the ones that needs money
            rm ${REQUEST_FOLDER}/${DESTINATION}
        fi
    done
    sleep 1s
done
