# #!/bin/bash

PASSWORD=1234567890
ACCOUNT=main_account
PORT=26657
API_PORT=9070
NETWORK=testnet
HOME=/var/node

# clean up
rm -rf ${HOME}

# Initialize local node with an account name and a chain
gaiad init ${ACCOUNT} --home ${HOME} --chain-id ${NETWORK} 2> /dev/null
NODEID=$(gaiad tendermint show-node-id --home ${HOME})

# Create our main account and add it to the genesis with a lot of money
echo ${PASSWORD} | gaiacli keys add ${ACCOUNT} --home ${HOME} &> /dev/null
gaiad add-genesis-account $(gaiacli keys show ${ACCOUNT} --home ${HOME} --address) 1000000000000000000000stake,100000000000000000000photino --home ${HOME} > /dev/null

echo ${PASSWORD} | gaiad gentx --name ${ACCOUNT} --home ${HOME} --home-client ${HOME} &>/dev/null
gaiad collect-gentxs --home ${HOME} &>/dev/null

sed -i -e 's/\"inflation\".*$/\"inflation\":\ \"0.000000001300000000\",/' -e 's/\"inflation_max\".*$/\"inflation_max\":\ \"0.000000002000000000\",/' -e 's/\"inflation_min\".*$/\"inflation_min\":\ \"0.000000000700000000\",/' -e 's/\"goal_bonded\".*$/\"goal_bonded\":\ \"0.000000006700000000\",/' ${HOME}/config/genesis.json
sed -i -e 's/max_subscriptions_per_client = .*$/max_subscriptions_per_client = 10/' ${HOME}/config/config.toml

# safe node id for other nodes to connect to it
echo ${NODEID} >> ${HOME}/id.txt

gaiad start --home ${HOME} --rpc.laddr tcp://0.0.0.0:26657 > /dev/null & (
  sleep 3s &&
  (
    gaiacli rest-server --home ${HOME} --chain-id ${NETWORK} --trust-node true --laddr tcp://0.0.0.0:${API_PORT} &
    sh /etc/nodes/faucet.sh $HOME &

    counter=1
    max=$1
    echo Starting $max nodes
    while [ "$counter" -lt "$max" ]
    do
      sh /etc/nodes/secondary.sh "${HOME}" "$counter" &
      counter=`expr "$counter" + 1`
    done
    sh /etc/nodes/secondary.sh "${HOME}" "$counter"
    wait
  )
)