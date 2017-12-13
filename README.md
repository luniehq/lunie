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

To run on the default testnet
```bash
$ npm run testnet
```

OR, specify a testnet from the github.com/tendermint/testnets repo
```bash
$ npm run testnet <networkName>
```

If you want to see the UI and work on that only, you can use:
```bash
$ yarn run uionly
```
This will not start the blockchain conenction.

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
open builds/Cosmos-darwin-x64/Cosmos.app
```

When you are testing the build system you can skip the repackaging of the JS files with:
```bash
$ npm run build -- --skip-pack
```

### Build on Windows

- Install [golang](`https://golang.org/dl/`)
- Install [glide](`https://github.com/Masterminds/glide/releases`)

- Install [node](`https://nodejs.org/en/download/`)
- Install Yarn: `$ npm i -g yarn`
- Install Microsoft build tools: `$ npm install --global --production windows-build-tools`
- Set build tools to needed version `yarn config set msvs_version 2015 --global`

- Install [GNU MAKE](`http://gnuwin32.sourceforge.net/packages/make.htm`)
- Install [MinGW64](`https://sourceforge.net/projects/mingw-w64/files/Toolchains%20targetting%20Win32/Personal%20Builds/mingw-builds/installer/mingw-w64-install.exe/download`)
- Add MAKE and MinGW64 to the PATH environment variable ([HOW TO](https://msdn.microsoft.com/de-de/library/windows/desktop/bb776899(v=vs.85).aspx))
    - MAKE should be at `C:\Program Files (x86)\GnuWin32\bin`
    - MinGW64 you have to look up at `C:\Program Files\mingw-w64\{{version}}\mingw64\bin`

- Pack the electron application: `$ npm run build:win32`
- Build the Setup: `$ npm run release:win32`
- The installer will be under `./builds/cosmos/Cosmos-win32`

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
```

To test the running application e2e:

```bash
$ npm run pack
$ npm run test:e2e
```

## Debug

To debug the electron application first build it and then run the node inspector for the build files:

```bash
$ electron --inspect-brk builds/{{your build}}/resources/app/dist/main.js
```

Then attach to the debugger via the posted url in Chrome.


To debug the electron view, set the environment variable `COSMOS_DEVTOOLS` to something truthy like `"true"`.

To see the console output of the view in your terminal, set the environment variable `ELECTRON_ENABLE_LOGGING` to something truthy like `1`.

## Flags

A list of all environment variables and their purpose:

|Variable|Values|default|Purpose|
|--|--|--|--|
|NODE_ENV|'production', 'development'|||
|LOGGING|'true', 'false'|'true'|Disable logging|
|MOCK|'true', 'false'|'true' in development|Mock data to receive from the chain|
|COSMOS_TEST|'true', 'false'|'false'|Disable code that influences unit tests, like logging to files|
|COSMOS_NETWORK|{path to network configuration folder}|'../networks/gaia-1'|Network to connect to|
|COSMOS_UI_ONLY|'true', 'false'|'false'|Ignore spinning up the tendermint binaries|
|COSMOS_HOME|{path to config persistence folder}|'$HOME/cosmos-ui[-dev]'||
|PLATFORM_TARGET|'all', 'win32', 'darwin', 'linux', 'mas'|'all'|Which platform to build for|
|COSMOS_DEVTOOLS|'true', 'false'|'false'|Open the debug panel in the electron view|
|ELECTRON_ENABLE_LOGGING|'true', 'false'|'false'|Redirect the browser view console output to the console|


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

- If your components are not found using a short path, check if the path resolution is applied for webpack (in `webpack.renderer.js > rendererConfig.resolve.alias`) and jest (in `package.json > jest.moduleNameMapper`).
