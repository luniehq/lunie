![Cosmos Lunie logo — spaceship blasting off](/app/static/icons/png/128x128.png)

# Cosmos Lunie

[![CircleCI](https://circleci.com/gh/cosmos/lunie.svg?style=svg)](https://circleci.com/gh/cosmos/lunie)
[![codecov](https://codecov.io/gh/cosmos/lunie/branch/develop/graph/badge.svg)](https://codecov.io/gh/cosmos/lunie)

👋 Welcome to Lunie, the official wallet and UI for the [Cosmos Hub](https://cosmos.network/).

⚠️ This is still alpha-level software. **DO NOT** enter your Cosmos fundraiser seed into Lunie.

<!-- 🎉 Binary releases are [available here](https://github.com/cosmos/lunie/releases). After downloading and untar/unzip-ing, navigate to the source directory and click on the `Cosmos Lunie` icon to launch Lunie. -->

## Lunie Dependencies

Install the following dependencies if you wish to run lunie on developer mode or [contribute](https://github.com/cosmos/lunie/blob/develop/CONTRIBUTING.md).

### Node

Lunie requires Node.js `>=10.13.0`. If you have a different version of Node.js installed, you can use `n` to install the correct version. The following command will use `n` to install it alongside your current version of Node.js.

```bash
npm i -g n && n 10.13.0
```

### Yarn

Yarn is a JS package manager we use to manage Lunie's dependencies. Download it [here](https://yarnpkg.com/lang/en/docs/install).

### Docker

Building Lunie and its dependencies requires [Docker](https://www.docker.com/) installed. You can download it [here](https://www.docker.com/get-docker).

### Ledger Cosmos App

> **IMPORTANT:** Only use Ledger devices that you **bought factory new** or **trust fully**.

Lunie supports sending transactions through the `Cøsmos` app for [Ledger Nano S](https://www.ledger.com/products/ledger-nano-s) hardware wallet. To install the `Cøsmos` app on your device you'll have to:

1. Download the Ledger Live app [here](https://www.ledger.com/pages/ledger-live)
2. Connect your Ledger via USB and update to the latest firmware
3. Go to the Ledger Live App Store, and download the `Cøsmos` application (this can take a while). **Note:** You may have to enable `Dev Mode` in the Ledger Live Settings to be able to download the `Cøsmos` application
4. Navigate to the `Cøsmos` app on your Ledger device

### Check out Lunie

With Node, Yarn and Docker installed, you're ready to check out the source code:

```bash
git clone https://github.com/cosmos/lunie.git
cd lunie
yarn install
```

---

## Lunie Development

### Gaia (Cosmos SDK)

Since Lunie runs on top of the Cosmos Hub blockchain, we also need to install Gaia (the Cosmos Hub application) and download the supported testnets.

Open the Docker App and build the Gaia CLI (`gaiacli`) and the full node (`gaiad`), which are part of the Cosmos SDK, with the following command:

```bash
yarn build:gaia
```

The version built is specified in `tasks/build/Gaia/COMMIT.sh` and the programs are placed in the `builds/Gaia` directory.

### Testnets

To connect to a testnet, Lunie needs the configuration files of those networks in the folder `app/networks/{network_name}`. Gaia has a Git repository that holds the configuration files. Lunie has script to download those configurations for you:

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

If you want to have a predictable environment for Lunie please generate some ssl certificates:

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

Create the bundle to deploy Lunie you can run:

```bash
yarn build:ui
```

If you want to set a particular `Stargate` (Cosmos light client) or Tendermint's `RPC` endpoints:

```bash
STARGATE=<https://StargateAddress:port> RPC=<https://RPCAddress:port> yarn build:ui
```

### Run local testnet

#### Run and create local account

You can create a local account to run Lunie's local-testnet on development mode by using:

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

To import the account to Lunie, go to the `Import with seed` option on the `Sign in`, and paste the `mnemonic` value from above on the `Seed Phrase` field.

**Note:** Running `yarn start:new` overwrites all previously generated local accounts, meaning that you will have to import the account every time ! Use `yarn start` if you want to keep your account.

#### Run with already generated accounts

Once you've generated a local account, run Lunie on the default `local-testnet`:

```bash
yarn start
```

### Set up Lunie on a different network

Start a full node for the network that you want to connect to (See [guide](https://cosmos.network/docs/gaia/join-mainnet.html#setting-up-a-new-node)).


Then start Lunie without the local testnet:

```bash
yarn frontend & yarn connect
```

## Testing

If you would like to run all the tests you can run:

```bash
yarn test
```

### Unit tests

Lunie uses [Jest](https://facebook.github.io/jest) to run unit tests. You can run _all_ the unit tests with the following command:

```bash
yarn test:unit
```

For a single test file (e.g. `PageValidator.spec.js`) run the unit tests like this to watch the tests whenever there are changes:

```bash
yarn watch PageValidator
```

### End to end tests

End to end testing will be soon restored thanks to: [Browserstack](https://www.browserstack.com/)

If you want to run them locally build the UI and serve the files so the E2E tests can access them:

```bash
yarn build:ui
./node_modules/.bin/http-server /app/dist -p 8081
```

Then run the actual tests:

```bash
yarn test:e2e
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
| `CI`                   | `true`, `false`             | `false` | Adds better structured output, makes a screenshot and adds logs to files (used on CircleCI).                                                                      |
| `ALLOW_CONSOLE`        | `true`, `false`             | `false` | Unit tests fail if they use `console.error` or `console.warn`. To see the initial use/occurences of those callings, you can escape this behavior using this flag. |

## Thanks

[![Browserstack](/test/browserstack-logo-600x315.png)](https://www.browserstack.com)
