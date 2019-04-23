NETWORK=testnet
PORT=1317

gaiacli rest-server --laddr tcp://0.0.0.0:${API_PORT} --home . --node http://localhost:${PORT} --chain-id ${NETWORK} --trust-node true