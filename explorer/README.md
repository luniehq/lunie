# Cosmos Network Monitor

> Graphical interface to view testnets on the Cosmos Network.

## Build Setup

``` bash
# install dependencies
yarn

# serve with hot reload at localhost:8080
yarn dev

# build for production with minification
yarn build
```

## Change Watched Node

In `./src/store/modules/blockchain.js` change the `url` line to the Tendermint RPC of your choice.

## Run the built version locally

1. Extract the zip
2. Enter the folder in your terminal
3. Run `python -m SimpleHTTPServer 8080` (python 2) or  `python3 -m http.server 8080` (python 3)
4. Visit `localhost:8080` in your browser
5. Done!
