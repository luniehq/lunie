![Cosmos Voyager logo — spaceship blasting off](/app/static/icons/png/128x128.png)

# Cosmos Voyager

[![CircleCI](https://circleci.com/gh/cosmos/voyager.svg?style=svg)](https://circleci.com/gh/cosmos/voyager)
[![codecov](https://codecov.io/gh/cosmos/voyager/branch/develop/graph/badge.svg)](https://codecov.io/gh/cosmos/voyager)

👋 Welcome to Voyager, the official wallet and UI for the [Cosmos Hub](https://cosmos.network/).

⚠️ This is still alpha-level software. **DO NOT** enter your Cosmos fundraiser seed into Voyager.

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

### Ledger Cosmos App

> **IMPORTANT:** Only use Ledger devices that you **bought factory new** or **trust fully**.

Voyager supports sending transactions through the `Cøsmos` app for [Ledger Nano S](https://www.ledger.com/products/ledger-nano-s) hardware wallet. To install the `Cøsmos` app on your device you'll have to:

1. Download the Ledger Live app [here](https://www.ledger.com/pages/ledger-live)
2. Connect your Ledger via USB and update to the latest firmware
3. Go to the Ledger Live App Store, and download the `Cøsmos` application (this can take a while). **Note:** You may have to enable `Dev Mode` in the Ledger Live Settings to be able to download the `Cøsmos` application
4. Navigate to the `Cøsmos` app on your Ledger device

### Check out Voyager

With Node, Yarn and Docker installed, you're ready to check out the source code:

```bash
git clone https://github.com/cosmos/voyager.git
cd voyager
yarn install
```

---

## Voyager Development

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

### Caddy Proxy

Currently we need a proxy to enable easy local development. We use [Caddy](https://caddyserver.com). To download run:

```bash
curl https://getcaddy.com | bash -s personal http.cors
```

## Local testnet

Sometimes you may want to run a local node, i.e. in the case there is no available network. To do so first [Build Gaia](#gaia-cosmos-sdk), then use our automatic script or the manual process to set up your node.

### Generate SSL certificates

If you want to have a predictable environment for Voyager please generate some ssl certificates:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout server_dev.key -out server_dev.crt \
  -subj "/C=US/ST=CA/L=Irvine/O=Acme Inc./CN=localhost" \
  -reqexts v3_req -reqexts SAN -extensions SAN \
  -config \
  <(echo -e '
    [req]\n
    distinguished_name=req_distinguished_name\n
    [req_distinguished_name]\n
    [SAN]\n
    subjectKeyIdentifier=hash\n
    authorityKeyIdentifier=keyid:always,issuer:always\n
    basicConstraints=CA:TRUE\n
    subjectAltName=@alt_names
    [alt_names]
    DNS.1 = localhost
  ')
```

Afterwards you can use:

```bash
yarn backend:fixed-https
yarn frontend:fixed-https
```

### Deploy

Create the bundle to deploy Voyager you can run:

```bash
yarn build:ui
```

If you want to set a particular `Stargate` (Cosmos light client) or Tendermint's `RPC` endpoints:

```bash
STARGATE=<https://StargateAddress:port> RPC=<https://RPCAddress:port> yarn build:ui
```

### Run local testnet

#### Run and create local account

You can create a local account to run Voyager's local-testnet on development mode by using:

```bash
yarn start:new
```

This will print a newly generated account on the console, such as the following:

```bash
Created Account: {
  name: 'account-with-funds',
  type: 'local',
  address: 'cosmos1...',
  pub_key: 'cosmospub1...',
  mnemonic: '...'
  }
```

To import the account to Voyager, go to the `Import with seed` option on the `Sign in`, and paste the `mnemonic` value from above on the `Seed Phrase` field.

**Note:** Running `yarn start:new` overwrites all previously generated local accounts, meaning that you will have to import the account every time ! Use `yarn start` if you want to keep your account.

#### Run with already generated accounts

Once you've generated a local account, run Voyager on the default `local-testnet`:

```bash
yarn start
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

For a single test file (e.g. `PageValidator.spec.js`) run the unit tests like this to watch the tests whenever there are changes:

```bash
yarn watch PageValidator
```

### End to end tests

End to end testing will be soon restored thanks to: [Browserstack](https://www.browserstack.com/)
You can run all of them using:

```bash
yarn test:e2e
```

If you would like to run a single test please set the TEST variable (Unix systems):

```bash
TEST=test/e2e/init.js yarn test:e2e
```

You can also run the `tape` command directly. You will need to run the packages of Voyager previously if on you're on Windows:

```bash
yarn pack
node_modules/.bin/tape test/e2e/init.js
```

### Code coverage

To check test coverage locally run following. It will spin up a webserver and provide you with a link to the coverage report web page.

```bash
yarn test:coverage
```

## Flags

A list of all environment variables and their purpose:

| Variable               | Values                      | default | Purpose                                                                                                                                                           |
|------------------------|-----------------------------|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `NODE_ENV`             | `production`, `development` |         |                                                                                                                                                                   |
| `COSMOS_E2E_KEEP_OPEN` | `true`, `false`             | `false` | Keep the Window open in local E2E test to see the state in which the application broke.                                                                           |
| `CI`                   | `true`, `false`             | `false` | Adds better structured output, makes a screenshot and adds logs to files (used on CircleCI).                                                                      |
| `ALLOW_CONSOLE`        | `true`, `false`             | `false` | Unit tests fail if they use `console.error` or `console.warn`. To see the initial use/occurences of those callings, you can escape this behavior using this flag. |

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

## Thanks

[![Browserstack](/test/browserstack-logo-600x315.png)](https://www.browserstack.com)
