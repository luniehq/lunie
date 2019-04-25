# #!/bin/bash

PASSWORD=1234567890
ACCOUNT=main_account
PORT=26657
API_PORT=9070
NETWORK=testnet
HOME=./node
TARGET=/mnt/node

# clean up
rm -rf ${HOME}
rm -f ${TARGET}/id.txt

# Initialize local node with an account name and a chain
gaiad init ${ACCOUNT} --home ${HOME} --chain-id ${NETWORK} >/dev/null
NODEID=$(gaiad tendermint show-node-id --home ${HOME})

# Create our main account and add it to the genesis with a lot of money
echo ${PASSWORD} | gaiacli keys add ${ACCOUNT} --home ${HOME} >/dev/null
gaiad add-genesis-account $(gaiacli keys show ${ACCOUNT} --home ${HOME} --address) 1000000000000000000000stake --home ${HOME} >/dev/null

echo ${PASSWORD} | gaiad gentx --name ${ACCOUNT} --home ${HOME} --home-client ${HOME} >/dev/null
gaiad collect-gentxs --home ${HOME} >/dev/null

sed -i -e 's/\"inflation\".*$/\"inflation\":\ \"0.000000001300000000\",/' -e 's/\"inflation_max\".*$/\"inflation_max\":\ \"0.000000002000000000\",/' -e 's/\"inflation_min\".*$/\"inflation_min\":\ \"0.000000000700000000\",/' -e 's/\"goal_bonded\".*$/\"goal_bonded\":\ \"0.000000006700000000\",/' ${HOME}/config/genesis.json

# safe node id for other nodes to connect to it
echo ${NODEID} >> ${TARGET}/id.txt

cp -a ${HOME}/. ${TARGET}/

gaiad start --home ${HOME} & (
  sleep 3s &&
  (
    echo ${PASSWORD} | gaiacli tx send ${RICH_ADDRESS} 1000000000stake --from ${ACCOUNT} --chain-id ${NETWORK} --yes --home ${HOME} &
    gaiacli rest-server --home ${HOME} --chain-id ${NETWORK} --trust-node true --laddr tcp://0.0.0.0:${API_PORT} &
    sh /etc/nodes/faucet.sh $ACCOUNT $PASSWORD $NETWORK
  )
)