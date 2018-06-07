![Cosmos Voyager logo — spaceship blasting off](/app/icons/png/128x128.png)

# Cosmos Voyager

[![CircleCI](https://circleci.com/gh/cosmos/voyager.svg?style=svg)](https://circleci.com/gh/cosmos/voyager)
[![codecov](https://codecov.io/gh/cosmos/voyager/branch/develop/graph/badge.svg)](https://codecov.io/gh/cosmos/voyager)

👋 Welcome to Voyager, the official desktop application for the [Cosmos Network](https://cosmos.network/).

⚠️ This is still alpha-level software. **DO NOT** enter your Cosmos fundraiser seed into Voyager.

💻 Voyager runs on macOS 10.9+, Windows 7+, and Debian-based Linux distros.

🎉 Binary releases are [available here](https://github.com/cosmos/voyager/releases).

---

## Voyager Prerequisites

#### Build Gaia (Cosmos SDK)

Build the Gaia CLI (`gaiacli`) and full node (`gaiad`), which are part of the
Cosmos SDK, with the following command:

```shell
yarn build:gaia
```

The version built is specified in `tasks/build/Gaia/COMMIT.sh` and the programs
are placed in the `builds/gaia` directory.

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

To run Voyager on the default testnet (`gaia-5001`):

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

First, start a full node following the [testnet instructions](https://cosmos.network/join-testnet).

Then start Voyager pointing at your local node.

```bash
$ COSMOS_NODE=localhost yarn testnet
```

---

### Building Voyager Binaries

Building Voyager requires [Docker](https://www.docker.com/get-docker) installed.

Here's an example build command:

```shell
yarn run build --commit=HEAD --network=app/networks/gaia-5001
```

You can specify `--help` to see all options with explanations.

Run the app.

```bash
open builds/Cosmos-{platform}-x64/Cosmos.app
```

To test if your build worked run:

```bash
$ yarn test:exe {path to the build executable}
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

## Flags

A list of all environment variables and their purpose:

| Variable                | Values                                 | default                          | Purpose                                                                                 |
| ----------------------- | -------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------- |
| NODE_ENV                | 'production', 'development'            |                                  |                                                                                         |
| LOGGING                 | 'true', 'false'                        | 'true'                           | Disable logging                                                                         |
| COSMOS_NETWORK          | {path to network configuration folder} | '../networks/gaia-1'             | Network to connect to                                                                   |
| COSMOS_HOME             | {path to config persistence folder}    | '$HOME/.cosmos-voyager[-dev]'    |                                                                                         |
| COSMOS_NODE             | {ip of a certain node}                 |                                  | Node to connect to                                                                      |
| COSMOS_DEVTOOLS         | 'true', 'false'                        | 'false'                          | Open the debug panel in the electron view                                               |
| ELECTRON_ENABLE_LOGGING | 'true', 'false'                        | 'false'                          | Redirect the browser view console output to the console                                 |
| PREVIEW                 | 'true', 'false'                        | 'true' if NODE_ENV 'development' | Show/Hide features that are in development                                              |
| COSMOS_E2E_KEEP_OPEN    | 'true', 'false'                        | 'false'                          | Keep the Window open in local E2E test to see the state in which the application broke. |
| COSMOS_MOCKED           | 'true', 'false'                        | `app/config.toml` > mocked       | Start with a mocked connector. Overwrites the setting in `app/config.toml`.             |

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

---

## ✌️
