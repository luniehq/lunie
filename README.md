![Cosmos Voyager logo — spaceship blasting off](/app/icons/png/128x128.png)

# Cosmos Voyager

[![CircleCI](https://circleci.com/gh/cosmos/voyager.svg?style=svg)](https://circleci.com/gh/cosmos/voyager)
[![codecov](https://codecov.io/gh/cosmos/voyager/branch/develop/graph/badge.svg)](https://codecov.io/gh/cosmos/voyager)

👋 Welcome to Voyager, the official wallet and UI for the [Cosmos Hub](https://cosmos.network/).

⚠️ This is still alpha-level software. **DO NOT** enter your Cosmos fundraiser seed into Voyager.

💻 Voyager runs on macOS 10.9+, Windows 7+, and Debian-based Linux distros.

<!-- 🎉 Binary releases are [available here](https://github.com/cosmos/voyager/releases). After downloading and untar/unzip-ing, navigate to the source directory and click on the `Cosmos Voyager` icon to launch Voyager. -->

## Voyager Dependencies

Install the following dependencies if you wish to run voyager on developer mode or [contribute](https://github.com/cosmos/voyager/blob/develop/CONTRIBUTING.md).

### Node

Voyager requires Node.js `>=10.13.0`. If you have a different version of Node.js installed, you can use `n` to install the correct version. The following command will use `n` to install it alongside your current version of Node.js.

```bash
npm i -g n && n 10.13.0
```

### Yarn

Yarn is a JS package manager we use to manage Voyager's dependencies. Download it [here](https://yarnpkg.com/lang/en/docs/install).

### Docker

Building Voyager and its dependencies requires [Docker](https://www.docker.com/) installed. You can download it [here](https://www.docker.com/get-docker).

### Check out Voyager

With Node, Yarn and Docker installed, you're ready to check out the source code:

```bash
git clone https://github.com/cosmos/voyager.git
cd voyager
yarn install
```

### Gaia (Cosmos SDK)

Since Voyager runs on top of the Cosmos Hub blockchain, we also need to install Gaia (the Cosmos Hub application) and download the supported testnets.

Open the Docker App and build the Gaia CLI (`gaiacli`) and the full node (`gaiad`), which are part of the Cosmos SDK, with the following command:

```bash
yarn build:gaia
```

The version built is specified in `tasks/build/Gaia/COMMIT.sh` and the programs are placed in the `builds/Gaia` directory.

### Testnets

To connect to a testnet, Voyager needs the configuration files of those networks in the folder `app/networks/{network_name}`. Gaia has a Git repository that holds the configuration files. Voyager has script to download those configurations for you:

```bash
yarn build:testnets
```

## Voyager Development

### Active testnets

To run Voyager on the default testnet (if active):

```bash
yarn start
```

To run Voyager on a specific testnet you can use the following command. Click [here](https://github.com/cosmos/testnets) for a complete list of the supported official and community testnets.

```bash
yarn start <network_name>
```

## Local testnet

Sometimes you may want to run a local node, i.e. in the case there is no available network. To do so first [Build Gaia](#gaia-cosmos-sdk), then use our automatic script or the manual process to set up your node.

### Build

#### Automatically

You can do the entire process in one command by running:

```bash
yarn build:local --overwrite=true
```

Once the build is done, it will print a success message on the Terminal with the default username/account and password to connect to the local testnet.

**Note:** the `--overwrite` flag as it will remove previous local node configurations

#### Manually

You can do the entire process manually by following these steps:

First initialize your node:

```bash
builds/Gaia/{OS}/gaiad init --home ~/.gaiad-testnet --name local
```

Write down the 24 word secret phrase to be able to import an account that holds tokens later on.

Copy the configuration files (assuming you are in the Voyager dir):

```bash
mkdir builds/testnets/local-testnet
cp ~/.gaiad-testnet/config/{genesis.json,config.toml} builds/testnets/local-testnet/
```

Enter your local node as a seed:

```bash
sed -i.bak 's/seeds = ""/seeds = "localhost"/g' ./builds/testnets/local-testnet/config.toml
```

Activate TX indexing in your local node:

```bash
sed -i.bak 's/index_all_tags = false/index_all_tags = true/g'  ~/.gaiad-testnet/config/config.toml
```

Store the gaia version used in your local testnet:

```bash
./builds/Gaia/{OS}/gaiad version > ./builds/testnets/local-testnet/gaiaversion.txt
```

### Deploy

Run Voyager for your local testnet:

```bash
yarn start local-testnet
```

Once the app is running it will redirect you to the `Sign In` page. Here you need to select an account and input the password given (if you used the [auto build](#automatically); default `1234567890`).

### Running several nodes

This command will build and run several nodes at once on the local testnet. All nodes will be validators:

```bash
yarn start local-testnet <number>
```

## Testing

If you would like to run all the tests you can run:

```bash
yarn test
```

### Unit tests

Voyager uses [Jest](https://facebook.github.io/jest) to run unit tests. You can run _all_ the unit tests with the following command:

```bash
yarn test:unit
```

For a single test file (e.g. `PageValidator.spec.js` ) run the unit tests like this to watch the tests whenever there are changes:

```bash
yarn watch PageValidator
```

### End to end tests

End to end (e2e) testing is performed via [`tape`](https://github.com/substack/tape), you can run all of them using:

```bash
yarn test:e2e
```

If you would like to run a single test please set the TEST variable (Unix systems):

```bash
TEST=test/e2e/init.js yarn test:e2e
```

You can also run the `tape` command directly, but then you need to run the packaging of Voyager before it (_i.e._ necessary on Windows):

```bash
yarn pack
node_modules/.bin/tape test/e2e/init.js
```

### Documentation

To produce an up-to date documentation you can run:

```bash
$ yarn doc
```

This will store an HTML static website containing all the documented modules and components that you can consult.

The output folder is: `docs/cosmos-voyager/[#version]`

### Code coverage

To check test coverage locally run following. It will spin up a webserver and provide you with a link to the coverage report web page.

```bash
yarn test:coverage
```

## Debugging

To debug the Electron application, build it and run the node inspector for the built files:

```bash
electron --inspect-brk builds/{{your build}}/resources/app/dist/main.js
```

Then attach to the debugger via the posted URL in Chrome.

To debug the electron view, set the environment variable `COSMOS_DEVTOOLS` to something truthy like `"true"`. The Chrome DevTools will appear when you start Voyager.

To see the console output of the view in your terminal, set the environment variable `ELECTRON_ENABLE_LOGGING` to something truthy like `1`.

## Flags

A list of all environment variables and their purpose:

| Variable                  | Values                                   | default                                                                        | Purpose                                                                                                                                                           |
| ------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                | `production`, `development`              |                                                                                |                                                                                                                                                                   |
| `LOGGING`                 | `true`, `false`                          | `true`                                                                         | Disable logging                                                                                                                                                   |
| `COSMOS_NETWORK`          | {path to network configuration folder}   |                                                                                | Network to connect to                                                                                                                                             |
| `COSMOS_HOME`             | {path to config persistence folder}      | `\$HOME/.cosmos-voyager[-dev]`                                                 |                                                                                                                                                                   |
| `LCD_URL`                 | {URL of a Cosmos light client interface} | see [`config`](https://github.com/cosmos/voyager/blob/develop/app/config.toml) | Cosmos Light Client interface to connect to                                                                                                                       |
| `RPC_URL`                 | {URL of a Tendermint rpc interface}      | see [`config`](https://github.com/cosmos/voyager/blob/develop/app/config.toml) | Tendermint node to connect to                                                                                                                                     |
| `COSMOS_DEVTOOLS`         | `true`, `false`                          | `false`                                                                        | Open the debug panel in the electron view                                                                                                                         |
| `ELECTRON_ENABLE_LOGGING` | `true`, `false`                          | `false`                                                                        | Redirect the browser view console output to the console                                                                                                           |
| `PREVIEW`                 | `true`, `false`                          | `true` if `NODE_ENV=development`                                               | Show/Hide features that are in development                                                                                                                        |
| `COSMOS_E2E_KEEP_OPEN`    | `true`, `false`                          | `false`                                                                        | Keep the Window open in local E2E test to see the state in which the application broke.                                                                           |
| `CI`                      | `true`, `false`                          | `false`                                                                        | Adds better structured output, makes a screenshot and adds logs to files (used on CircleCI).                                                                      |
| `ALLOW_CONSOLE`           | `true`, `false`                          | `false`                                                                        | Unit tests fail if they use `console.error` or `console.warn`. To see the initial use/occurences of those callings, you can escape this behavior using this flag. |

## FAQ

- If tendermint crashes and the log shows `Tendermint state.AppHash does not match AppHash after replay.` delete the config folders at `$HOME/.cosmos-voyager[-dev]`.

- If you use yarn, the post-install hook may not execute. If this happens you'll have to execute the script manually:

```bash
cd app
yarn
cd ..
npm run rebuild
```

- If electron shows the error: `A DLL initialization routine has failed.` rebuild the electron dependencies:

```bash
npm run rebuild
```

- If you have trouble installing dependencies, remove all the lockfiles and try installing again.

```bash
rm -rf app/yarn.lock
rm -rf app/package-lock.json
rm -rf yarn.lock
rm -rf package-lock.json
```

- If your components are not found using a short path, check if the path resolution is applied for Webpack (`webpack.renderer.js > rendererConfig.resolve.alias`) and Jest (`package.json > jest.moduleNameMapper`).

- If starting the development server fails with the error: `Error: listen EADDRINUSE 127.0.0.1:9080`, you have still a development server process running. Kill it with `kill $(lsof -t -i:9080)` on Unix systems. On Windows Powershell first look for the processes with `netstat -a -o -n | Select-String -Pattern "9080"` then kill them with `taskkill /F /PID {PID}`.

- If `yarn test:e2e` outputs an error about ChromeDriver timeout, remove your `node_modules` folder and reinstall all dependencies with `yarn`.

- The version mismatch (`The network you are trying to connect to requires gaia X, but the version Voyager is using is Y.`) is testing the gaia version in `/builds/Gaia/...` against the one specified in the config dir `~/.cosmos-voyager[-dev]/{NETWORK}/gaiaversion.txt`. If you know that you have the correct version, change it in `gaiaversion.txt`.

- You get `The network configuration for the network you want to connect to doesn't exist. Have you run "yarn build:testnets" to download the latest configurations?` but you have run `yarn build:testnets`.
  The symlink between `app/networks` and `builds/testnets` is broken. Try readding the symlink with `cd app && ln -s ../builds/testnets networks`.
