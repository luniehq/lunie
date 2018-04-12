![the cosmos network](cosmos-github.jpg)

# Cosmos Voyager

[![CircleCI](https://circleci.com/gh/cosmos/voyager.svg?style=svg)](https://circleci.com/gh/cosmos/voyager)
[![codecov](https://codecov.io/gh/cosmos/voyager/branch/develop/graph/badge.svg)](https://codecov.io/gh/cosmos/voyager)

👋 Welcome to Voyager, the official user interface for the [Cosmos Network](https://cosmos.network/).

💻 Voyager is a desktop application built with [Electron](https://github.com/electron/electron). Voyager runs on macOS 10.9+, Windows 7+, and Debian-based Linux distros.

⚠️ This is still alpha-level software. **DO NOT** enter your Cosmos fundraiser seed into Voyager.

🎉 Binary releases are [available here](https://github.com/cosmos/voyager/releases).

---

### Prerequisites

#### Install dependencies

##### On Mac

```bash
# install go, set $GOPATH
brew install go

# install glide for go dependencies
brew install glide

# install yarn for js dependencies
brew install yarn
```

##### On Windows

Install [Go](https://golang.org/dl/)

Install [Glide](https://github.com/Masterminds/glide/releases)

Install [Yarn](https://yarnpkg.com/lang/en/docs/install/#windows)

#### Install Gaia

`gaia` is a prepackaged version of Cosmos SDK and Tendermint. You will need `gaia` installed.

```bash
# install gaia
go get github.com/cosmos/gaia
cd $GOPATH/src/github.com/cosmos/gaia
git checkout v0.5.0
glide install
make install
```

#### Prepare Voyager

```bash
# checkout voyager
cd ~ # or wherever you like to keep your project files
git checkout https://github.com/cosmos/voyager.git
cd voyager

# install js dependencies
yarn
```

---

### Develop

To run Voyager on the default testnet (`gaia-2`):

```bash
$ yarn testnet
```

To run Voyager on a specific testnet from the [testnets](https://github.com/tendermint/testnets) repo:

```bash
$ yarn testnet <networkName>
```

To run Voyager on a local node:

<!-- This way would be desired but local nodes apparently do not work (do not produce blocks)```bash
# First start a local node using the the configuration provided in Voyager.
$ gaia node start --home=./app/networks/local
# Then start Voyager connecting to your local node.
$ yarn testnet local
``` -->

First start a local node following the Gaia [readme](https://github.com/cosmos/gaia).

Then start Voyager pointing at your local node.

```bash
$ COSMOS_NODE=localhost yarn testnet
```

---

### Production

Get the Gaia binary from [GitHub](`https://github.com/cosmos/gaia/releases`).

Building requires that [Docker](https://www.docker.com/get-docker) is installed
on your system.

Execute the following command to see building options.

```shell
yarn run build --help
```

Run the app.

```bash
open builds/Cosmos-{platform}-x64/Cosmos.app
```

When you are testing the build system you can skip the repackaging of the JS files.

```bash
$ yarn run build --platform=darwin --skip-pack
```

To test if your build worked run:

```bash
$ yarn test:exe {path to the build executable}
```

---

### Testing

Voyager is using [Jest](https://facebook.github.io/jest) to run unit tests.

```bash
$ yarn test
```

To check test coverage locally run following. It will spin up a webserver and provide you with a link to the coverage report web page.

```bash
$ yarn test:coverage
```

---

### Debug

To debug the electron application, build it and run the node inspector for the built files:

```bash
$ electron --inspect-brk builds/{{your build}}/resources/app/dist/main.js
```

Then attach to the debugger via the posted url in Chrome.

To debug the electron view, set the environment variable `COSMOS_DEVTOOLS` to something truthy like `"true"`. The Chrome DevTools will appear when you start Voyager.

To see the console output of the view in your terminal, set the environment variable `ELECTRON_ENABLE_LOGGING` to something truthy like `1`.

### Config

The file `config.toml` can be used to define ports, networks and other variables to be available in your build. The file is copied into the production app.

### Flags

A list of all environment variables and their purpose:

| Variable                | Values                                 | default                          | Purpose                                                 |
| ----------------------- | -------------------------------------- | -------------------------------- | ------------------------------------------------------- |
| NODE_ENV                | 'production', 'development'            |                                  |                                                         |
| LOGGING                 | 'true', 'false'                        | 'true'                           | Disable logging                                         |
| COSMOS_NETWORK          | {path to network configuration folder} | '../networks/gaia-1'             | Network to connect to                                   |
| COSMOS_HOME             | {path to config persistence folder}    | '$HOME/voyager[-dev]'            |                                                         |
| COSMOS_NODE             | {ip of a certain node}                 |                                  | Node to connect to                                      |
| COSMOS_DEVTOOLS         | 'true', 'false'                        | 'false'                          | Open the debug panel in the electron view               |
| ELECTRON_ENABLE_LOGGING | 'true', 'false'                        | 'false'                          | Redirect the browser view console output to the console |
| PREVIEW                 | 'true', 'false'                        | 'true' if NODE_ENV 'development' | Show/Hide features that are in development              |

### FAQ

* If tendermint crashes and the log shows `Tendermint state.AppHash does not match AppHash after replay.` delete the config folders at `$HOME/.cosmos-voyager[-dev]`.

* If you use yarn, the post-install hook may not execute. If this happens you'll have to execute the script manually:

```bash
$ cd app
$ yarn
$ cd ..
$ npm run rebuild
```

* If electron shows the error: `A DLL initialization routine has failed.` rebuild the electron dependencies:

```bash
$ npm run rebuild
```

* If you have trouble installing dependencies, remove all the lockfiles and try installing again.

```bash
$ rm -rf app/yarn.lock
$ rm -rf app/package-lock.json
$ rm -rf yarn.lock
$ rm -rf package-lock.json
```

* If your components are not found using a short path, check if the path resolution is applied for Webpack (`webpack.renderer.js > rendererConfig.resolve.alias`) and Jest (`package.json > jest.moduleNameMapper`).

* If starting the development server fails with the error: `Error: listen EADDRINUSE 127.0.0.1:9080`, you have still a development server process running. Kill it with `kill $(lsof -t -i:9080)` on Unix systems. On Windows Powershell first look for the processes with `netstat -a -o -n | Select-String -Pattern "9080"` then kill them with `taskkill /F /PID {PID}`.

- If `yarn test:e2e` outputs an error about ChromeDriver timeout, remove your node_modules folder and reinstall all dependencies.

---

### ✌️
