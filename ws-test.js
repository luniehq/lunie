const Tendermint = require('./api/lib/subscription/tendermint.js')


const client = new Tendermint('akash-testnet', 'ws://akash-rpc.vitwit.com:26657/websocket')

client.subscribe(
    {
        "query": "slash.reason = 'missing_signature'"
    },
    (response) => {
        console.log(JSON.stringify(response, null, 2))
    }
)