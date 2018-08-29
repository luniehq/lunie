![Cosmos Voyager logo — spaceship blasting off](/app/icons/png/128x128.png)

# Cosmos Voyager

[![CircleCI](https://circleci.com/gh/cosmos/voyager.svg?style=svg)](https://circleci.com/gh/cosmos/voyager)
[![codecov](https://codecov.io/gh/cosmos/voyager/branch/develop/graph/badge.svg)](https://codecov.io/gh/cosmos/voyager)

👋 Welcome to Voyager, the official desktop application for the [Cosmos Network](https://cosmos.network/).

⚠️ This is still alpha-level software. **DO NOT** enter your Cosmos fundraiser seed into Voyager.

💻 Voyager runs on macOS 10.9+, Windows 7+, and Debian-based Linux distros.

🎉 Binary releases are [available here](https://github.com/cosmos/voyager/releases). After downloading and untar/unzip-ing, navigate to the source directory and click on the `Cosmos Voyager` icon to launch Voyager.

---

## Voyager Prerequisites

### Docker

Building Voyager and its dependencies requires [Docker](https://www.docker.com/get-docker) installed.

#### Build Gaia (Cosmos SDK)<a name="build-gaia"></a>

Build the Gaia CLI (`gaiacli`) and full node (`gaiad`), which are part of the
Cosmos SDK, with the following command:

```bash
yarn build:gaia
```

The version built is specified in `tasks/build/Gaia/COMMIT.sh` and the programs
are placed in the `builds/Gaia` directory.

### Testnet Configurations<a name="download-testnets"></a>

To connect to a testnet, Voyager needs the configuration files of those networks in the folder `app/networks/{network_name}`. Gaia has a Git repository that holds the configuration files. Voyager has script to download those configurations for you:

```bash
yarn build:testnets
```

### Check Out Voyager

Voyager requires Node.js `>=9.4.0`. If you have a different version of Node.js installed (e.g. Node.js `8.11 LTS`), you can use `n` to install the correct version. The following command will use `n` to install it alongside your current version of Node.js.

```bash
npm i -g n && n 9.4.0
```

Yarn is a JS package packager we use manage Voyager dependencies. [Download it.](https://yarnpkg.com/lang/en/docs/install)

With Node.js and Yarn installed, you're ready to check out the source code:

```bash
git clone https://github.com/cosmos/voyager.git
cd voyager
yarn install
```

---

## Voyager Development

To run Voyager on the default testnet:

```bash
$ yarn start
```

To run Voyager on a specific testnet, see the [status page](https://github.com/cosmos/cosmos-sdk/blob/develop/cmd/gaia/testnets/STATUS.md) for a list of available testnets.

```bash
$ yarn start <networkName>
```

To run Voyager on a local node:

<!-- This way would be desired but local nodes apparently do not work (do not produce blocks)```bash
# First start a local node using the the configuration provided in Voyager.
$ gaia node start --home=./app/networks/local
# Then start Voyager connecting to your local node.
$ yarn start local
``` -->

First, start a full node following the [testnet instructions](https://cosmos.network/join-testnet).

Then start Voyager pointing at your local node.

```bash
$ COSMOS_NODE=localhost yarn start
```

---

### Building Voyager Binaries

First [Build Gaia](#build-gaia) and [Download the testnet configurations](#download-testnets).

Here's an example build command:

```bash
yarn run build --commit=HEAD --network=gaia-7005
```

You can specify `--help` to see all options with explanations.

When the build is complete, you can find the files in `builds/Voyager`.

To test if your build worked run:

```bash
$ yarn test:exe {path to the unpacked executable}
```

To make an official release, follow the instructions in `docs/release.md`.

---

## Testing

Voyager is using [Jest](https://facebook.github.io/jest) to run unit tests.

```bash
$ yarn test
```

To check test coverage locally run following. It will spin up a webserver and provide you with a link to the coverage report web page.

```bash
$ yarn test:coverage
```

---

## Debug

To debug the electron application, build it and run the node inspector for the built files:

```bash
$ electron --inspect-brk builds/{{your build}}/resources/app/dist/main.js
```

Then attach to the debugger via the posted url in Chrome.

To debug the electron view, set the environment variable `COSMOS_DEVTOOLS` to something truthy like `"true"`. The Chrome DevTools will appear when you start Voyager.

To see the console output of the view in your terminal, set the environment variable `ELECTRON_ENABLE_LOGGING` to something truthy like `1`.

---

## Run a local node

Sometimes you may want to run a local node, i.e. in the case there is no available network. To do so first [Build Gaia](#build-gaia), then use our automatic script or the manual process to set up your node.

### Automatically

You can do the entire process in one command by running:

```bash
$ yarn build:local --overwrite=true
```

(Be careful with the --overwrite flag as it will remove previous local node configurations)

### Manually

You can do the entire process manually by following these steps:

First initialize your node:

```bash
$ builds/Gaia/{OS}/gaiad init --home ~/.gaiad-testnet --name local
```

Write down the 12 word secret phrase to be able to import an account that holds tokens later on.

Copy the configuration files (assuming you are in the Voyager dir):

```bash
$ mkdir builds/testnets/local-testnet
$ cp ~/.gaiad-testnet/config/{genesis.json,config.toml} builds/testnets/local-testnet/
```

Enter your local node as a seed:

```bash
$ sed -i.bak 's/seeds = ""/seeds = "localhost"/g' ./builds/testnets/local-testnet/config.toml
```

Activate TX indexing in your local node:

```bash
$ sed -i.bak 's/index_all_tags = false/index_all_tags = true/g'  ~/.gaiad-testnet/config/config.toml
```

Store the gaia version used in your local testnet:

```bash
$ ./builds/Gaia/{OS}/gaiad version > ./builds/testnets/local-testnet/gaiaversion.txt
```

Start your local node:

```bash
$ ./builds/Gaia/{OS}/gaiad start --home ~/.gaiad-testnet
```

Then run Voyager for your local testnet:

```bash
$ yarn start local-testnet
```

Import the account with the 12 word seed phrase you wrote down earlier.

## Flags

A list of all environment variables and their purpose:

| Variable                | Values                                 | default                          | Purpose                                                                                 |
| ----------------------- | -------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------- |
| NODE_ENV                | 'production', 'development'            |                                  |                                                                                         |
| LOGGING                 | 'true', 'false'                        | 'true'                           | Disable logging                                                                         |
| COSMOS_NETWORK          | {path to network configuration folder} | '../networks/gaia-7001'          | Network to connect to                                                                   |
| COSMOS_HOME             | {path to config persistence folder}    | '$HOME/.cosmos-voyager[-dev]'    |                                                                                         |
| COSMOS_NODE             | {ip of a certain node}                 |                                  | Node to connect to                                                                      |
| COSMOS_DEVTOOLS         | 'true', 'false'                        | 'false'                          | Open the debug panel in the electron view                                               |
| ELECTRON_ENABLE_LOGGING | 'true', 'false'                        | 'false'                          | Redirect the browser view console output to the console                                 |
| PREVIEW                 | 'true', 'false'                        | 'true' if NODE_ENV 'development' | Show/Hide features that are in development                                              |
| COSMOS_E2E_KEEP_OPEN    | 'true', 'false'                        | 'false'                          | Keep the Window open in local E2E test to see the state in which the application broke. |

## FAQ

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

* The version mismatch (`The network you are trying to connect to requires gaia X, but the version Voyager is using is Y.`) is testing the gaia version in `/builds/Gaia/...` against the one specified in the config dir `~/.cosmos-voyager[-dev]/{NETWORK}/gaiaversion.txt`. If you know that you have the correct version, change it in `gaiaversion.txt`.

---

## ✌️
