# cosmos-ui

> Human interface to Cosmos. Links to binary downloads coming soon.

## Warning

This is still alpha-level software as of September 2017. Do not enter in your Cosmos fundraiser seed.

## Development

To run the dev build, first you will need the following binaries installed in your GOPATH: `basecoin`, `baseserver`, and `tendermint`. Download those from `https://tendermint.com/downloads`.

```fish
# check your versions
$ basecoin version
v0.7.0-alpha f40fa5b
$ basecli version
v0.7.0-alpha f40fa5b
$ tendermint version
0.11.0-7682ad9a
```

# on Window set GOPATH in `./env.js`. This file is gitignored.

# run on the default testnet
npm run testnet

# OR, run on a local testnet so you don't have to sync over the network
npm run local

# OR, specify a testnet from the github.com/tendermint/testnets repo
npm run testnet <networkName>
```

This should launch the app, running on a local testnet.

## Production

You can create production builds to get an app which will connect to an actual blockchain network.

First you will need the prerequisite source repositories installed:

```bash
# install go, set $GOPATH
brew install go

# install glide
brew install glide

# install basecoin/baseserver
go get -d github.com/cosmos/cosmos-sdk
cd $GOPATH/src/github.com/cosmos/cosmos-sdk // Windows: cd %GOPATH%/src/github.com/cosmos/cosmos-sdk
git checkout develop
make get_vendor_deps
make install

# install tendermint
go get -d github.com/tendermint/tendermint/cmd/tendermint
cd $GOPATH/src/github.com/tendermint/tendermint // Windows: cd %GOPATH%/src/github.com/tendermint/tendermint
git checkout v0.11.0
make get_vendor_deps
make install
```

Then build and run the app:
```bash
npm run pack && npm run build:darwin
open builds/cosmos-ui-darwin-x64/cosmos-ui.app
```

## Testing

To test you need to first package the web content of the app, as this content can only be used bundled by the electron instance.

```bash
$ npm run pack
$ npm run test
```

## Debug 
 
To debug the electron application first build it and then run the node inspector for the build files: 
 
```bash 
$ electron --inspect-brk builds/{{you build}}/resources/app/dist/main.js 
``` 
 
Then attach to the debugger via the posted url in Chrome.


To debug the electron view, set the environment variable `COSMOS_DEVTOOLS` to sth. truthy like `"true"`.

To see the console output of the view in your terminal, set the environment variable `ELECTRON_ENABLE_LOGGING` to sth. truthy like `1`.


## FAQ

- If tendermint crashes and the log shows "Tendermint state.AppHash does not match AppHash after replay." delete the config folders at $HOME/.cosmos-ui[-dev].

- If you use yarn, the postinstall hook may not execute. In this case you have to execute these script manualy:
```bash
$ cd app
$ yarn
$ cd ..
$ npm run rebuild
```

- If electron shows the error: "A DLL initialization routine has failed." rebuild the electron dependencies.
```bash
$ npm run rebuild
```

- If you have trouble installing dependencies, remove all the lockfiles and try again.

```bash
$ rm -rf app/yarn.lock
$ rm -rf app/package-lock.json
$ rm -rf yarn.lock
$ rm -rf package-lock.json
```