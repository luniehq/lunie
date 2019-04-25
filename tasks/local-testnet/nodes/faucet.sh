#!/bin/bash

AMOUNTS=10000000stake
AMOUNTP=5000000photino
# AMOUNTC=123123cococoin

REQUEST_FOLDER=/mnt/node/addresses

# ACCOUNT=$1
# PASSWORD=$2
# NETWORK=$3

echo "Starting Faucet"

while true
do
    # Is anyone asking for money
    LIST=$(ls ${REQUEST_FOLDER})
    if [[ -n "${LIST}" ]];
    then
        echo ${LIST} | while IFS= read -r row || [[ -n "$row" ]]; do
            # for every file in the list pick the address and give money to it, then delete the file
            DESTINATION=$(echo $row | awk '{print $4}')
            if [[ ${#DESTINATION} -eq 45 ]];
            then
                ACCOUNT_INFO=$(gaiacli query account ${DESTINATION} --chain-id ${NETWORK} --trust-node --home .)
                dt=$(date '+%d/%m/%Y %H:%M:%S');
                if [[ ${ACCOUNT_INFO} == *"stake"* ]]; then
                    echo "$dt - $DESTINATION already funded, accounts are only funded once"
                else
                    # work only on stuff that have the right length
                    ADDRESS=$(gaiacli keys show ${ACCOUNT} --home . --address)
                    echo "stakes $AMOUNTS at $DESTINATION"
                    echo ${PASSWORD} | gaiacli tx send ${DESTINATION} ${AMOUNTS} --home . --from ${ADDRESS} --chain-id=${NETWORK} --yes
                    #sleep 5s # TODO: should be smarter, check if block was created or not
                    #echo "photino $AMOUNTP at $DESTINATION"
                    #echo ${PASSWORD} | gaiacli tx send ${DESTINATION} ${AMOUNTP} --home . --from ${ADDRESS} --chain-id=${NETWORK} --yes
                    # echo ${PASSWORD} | gaiacli tx send ${DESTINATION} ${AMOUNTC} --home . --from ${ADDRESS} --chain-id=${NETWORK}
                    echo "$dt - $DESTINATION funded, enjoy!"
                fi
            fi
            # Remove this address from the ones that needs money
            rm ${REQUEST_FOLDER}/${DESTINATION}
        done
    fi
    sleep 5s
done
