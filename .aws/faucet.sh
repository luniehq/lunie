#!/bin/bash

AMOUNTS=10000000stake
AMOUNTP=5photino
AMOUNTC=1cococoin

ACCOUNT=$1
PASSWORD=$2
NETWORK=$3

while true
do
    # Is anyone asking for money
    LIST=$(aws s3 ls s3://cosmos-gaia/addresses/)
    if [[ -n "${LIST}" ]];
    then
        echo ${LIST} | while IFS= read -r row || [[ -n "$row" ]]; do
            # for every file in the list pick the address and give money to it, then delete the file
            DESTINATION=$(echo $row | awk '{print $4}')
            if [[ ${#DESTINATION} -eq 45 ]];
            then
                # work only on stuff that have the right length
                ADDRESS=$(./gaiacli keys show ${ACCOUNT} --home . --address)
                echo ${PASSWORD} | ./gaiacli tx send ${DESTINATION} ${AMOUNTS} --home . --from ${ADDRESS} --chain-id=${NETWORK}
                echo ${PASSWORD} | ./gaiacli tx send ${DESTINATION} ${AMOUNTP} --home . --from ${ADDRESS} --chain-id=${NETWORK}
                echo ${PASSWORD} | ./gaiacli tx send ${DESTINATION} ${AMOUNTC} --home . --from ${ADDRESS} --chain-id=${NETWORK}
            fi
            # Remove this address from the ones that needs money
            aws s3 rm s3://cosmos-gaia/addresses/${DESTINATION}
        done
    fi
done
