![Lunie logo — right half circle with dotted left circle](/public/img/readme-header.svg)

# Welcome to [Lunie.io](https://lunie.io)!

[![CircleCI](https://circleci.com/gh/luniehq/lunie/tree/develop.svg?style=svg)](https://circleci.com/gh/luniehq/lunie/tree/develop)
[![codecov](https://codecov.io/gh/luniehq/lunie/branch/develop/graph/badge.svg)](https://codecov.io/gh/luniehq/lunie)
[![Maintainability](https://api.codeclimate.com/v1/badges/a99a88d28ad37a79dbf6/maintainability)](https://codeclimate.com/github/codeclimate/codeclimate/maintainability)

👋 Welcome to Lunie. We're making staking accessible for everyone. This is the repo for the Lunie web app.

## Development Dependencies

Install the following dependencies if you wish to run lunie on developer mode or [contribute](https://github.com/luniehq/lunie/blob/develop/CONTRIBUTING.md).

### Node

Lunie requires Node.js `>=10.13.0`. If you have a different version of Node.js installed, you can use [nvm](https://github.com/nvm-sh/nvm) to install the correct version. Now to install the Node.js version run:

```bash
nvm install 10.*
```

### Ledger Cosmos App

> **IMPORTANT:** Only use Ledger devices that you **bought factory new** or **trust fully**.

Lunie supports sending transactions through the `Cosmos` app for [Ledger Nano](https://www.ledger.com/products/ledger-nano-s) hardware wallet. To install the `Cøsmos` app on your device you'll have to:

1. Download the Ledger Live app [here](https://www.ledger.com/pages/ledger-live)
2. Connect your Ledger via USB and update to the latest firmware
3. Go to the Ledger Live App Store, and download the `Cøsmos` application (this can take a while). **Note:** You may have to enable `Dev Mode` in the Ledger Live Settings to be able to download the `Cøsmos` application
4. Navigate to the `Cøsmos` app on your Ledger device

### Check out Lunie

With Node installed, you're ready to check out the source code. Afterwards install the dependencies for this repository:

```bash
git clone https://github.com/luniehq/lunie.git
cd lunie
npm install
```

---

## Lunie Development

### Start

You can simply start the frontend:

```bash
npm run serve
```

ATTENTION: Lunie requires a backend. This is currently not yet public.

### Run local testnet

#### Docker

To run a local testnet for Lunie you will need [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed. You can find instructions to install Docker [here](https://www.docker.com/get-docker). You can find instructions to install Docker-Compose [here](https://docs.docker.com/compose/install/).

#### Backend

```
git clone https://github.com/luniehq/lunie-backend.git
cd lunie-backend
npm run start
```

#### Use the local testnet

Lunie is automatically connecting to the backend at `http://localhost:4000`. If not set the according environment variable `VUE_APP_GRAPHQL_URL`.

The testnet will contain a rich account that you can use to see balances and make transactions. You need to import that account into Lunie:
- Sign In
- Use an existing account
- Recover with backup code

Now enter the backup code and create the account. Backup code: `release endorse scale across absurd trouble climb unaware actor elite fantasy chair license word rare length business kiss smoke tackle report february bid ginger`

You should now have a bunch of stake to play with.

### Code Conventions / Coding Style

All code needs to conform to our linting rules. This will be tested in our continuous integration.

To test if your code conforms to the rules run:
```
npm run lint
```

To fix linting errors automatically (as long as this is possible) run:
```
npm run lint -- --fix
```

### Deploy

Create the bundle to deploy Lunie you can run:

```bash
npm run build
```

If you want to set a particular `Stargate` (Cosmos SDK REST API):

```bash
STARGATE=<https://StargateAddress:port> npm run build
```

### Mobile

#### Android

Dependencies: 
- Android Studio
- Gradle updated to 5.1.1 (Android Studio > File > Project Structure)

You will probably also want a virtual Android device which you can create from inside the Android Studio.

To run the Android version of Lunie in development:

```bash
$ npm run build
$ npx cap sync android
$ npx cap open android
```

#### iOS

Dependencies:
- [Capacitor](https://capacitor.ionicframework.com/docs/getting-started/dependencies/#ios-development)
- [Xcode 10](https://itunes.apple.com/us/app/xcode/id497799835?mt=12)
- [Cocoapods](https://guides.cocoapods.org/using/getting-started.html#installation)

To open Lunie in Xcode: 
1. Build Lunie
```bash
$ npm run build
```

2. This step may take up to 20 minutes to complete if you've never used Cocoapods before.
```bash
$ npx cap sync ios
```

3. This will open Xcode with Lunie loaded
```bash
$ npx cap open ios
```

Once Xcode is open, just click the Play button to run Lunie on your preferred Simulator or Device.

## Release

Lunie has a automated release process. Every night the CI creates a new release PR. To release manually, run

```bash
npm run release
```

## Testing

If you would like to run all the tests you can run:~ 

```bash
npm run test
```

### Unit tests

Lunie uses [Jest](https://facebook.github.io/jest) to run unit tests. You can run _all_ the unit tests with the following command:

```bash
npm run test:unit
```

For a single test file (e.g. `PageValidator.spec.js`) run the unit tests like this:

```bash
npm run test:unit PageValidator
```

### Code coverage

To check test coverage locally run following after having run unit tests. It will spin up a webserver and provide you with a link to the coverage report web page.

```bash
npm run test:coverage
```

### End to end tests

Then run the tests:

```bash
npm run test:e2e
```

To run only some tests, provide the name of the e2e test file you want to run (i.e. for `send.spec.js`):

```bash
npm run test:e2e send
```

To run the e2e tests on multiple browsers use [Browserstack](https://www.browserstack.com/). You must set the environment variables `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY` aquired from Browserstack first.

Then start the backend up locally followed by running the frontend in production mode and finally start the tests:

```bash
// start the backend
npm run test:e2e:serve
npm run test:e2e:browserstack
```

Finally stop the testnet when you are done.

## Flags

A list of all environment variables and their purpose:

| Variable        | Values                      | default | Purpose                                                                                                                                                           |
|-----------------|-----------------------------|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `NODE_ENV`      | `production`, `development` |         |                                                                                                                                                                   |
| `ALLOW_CONSOLE` | `true`, `false`             | `false` | Unit tests fail if they use `console.error` or `console.warn`. To see the initial use/occurences of those callings, you can escape this behavior using this flag. |
| `STARGATE` |              | `http://localhost:9071` | URL of the Cosmos REST API that is used for broadcasting and simulation of transactions. |
| `VUE_APP_GRAPHQL_URL` |              | `http://localhost:4000` | URL of the Lunie Backend GraphQL API. |
| `VUE_APP_E2E` | `true`, `false`             | `false` | Switches Lunie to run/build in e2e test mode. Disables some tracking. |
| `GOOGLE_ANALYTICS_UID` |             |  | Google Analytics UID to be used in production builds. |
| `MOBILE_APP` | `true`, `false`             | `false` | Build for mobile. Handles some interactions differently. |

## Thanks

[![Browserstack](/tests/browserstack-logo-600x315.png)](https://www.browserstack.com)
