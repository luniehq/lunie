# cosmos-ui

> Human interface to Cosmos. Links to binary downloads coming soon.

## Warning

This is still alpha-level software as of September 2017. Do not enter in your Cosmos fundraiser seed.

## Development

To run the dev build, you will need the `gaia` binary installed:
```golang
go get github.com/cosmos/gaia
cd $GOPATH/src/github.com/cosmos/gaia
git checkout feature/delegation
glide install
make install
```

# run on the default testnet
npm run testnet

# OR, specify a testnet from the github.com/tendermint/testnets repo
npm run testnet <networkName>
```

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

To see where you are missing coverage, run a test first and then open an http-server at `test/unit/coverage/lcov-report` to see details for the coverage.
i.e.:

```bash
$ npm i -g http-server
$ http-server test/unit/coverage/lcov-report

## Debug 
 
To debug the electron application first build it and then run the node inspector for the build files: 
 
```bash 
$ electron --inspect-brk builds/{{your build}}/resources/app/dist/main.js 
``` 
 
Then attach to the debugger via the posted url in Chrome.


To debug the electron view, set the environment variable `COSMOS_DEVTOOLS` to something truthy like `"true"`.

To see the console output of the view in your terminal, set the environment variable `ELECTRON_ENABLE_LOGGING` to something truthy like `1`.

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
