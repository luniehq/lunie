# A browser extension for Lunie.io
 
The Lunie browser extension will allow you to easily interact with the Cosmos blockchain and Lunie.io using [Chrome](https://www.google.com/chrome/) and [Brave](https://brave.com/) browsers. Support for other networks coming soon.

Easily create a new address, recover an existing one from backup code (seed phrase), manage your accounts and sign transactions from Lunie.io. This is a non-custodial extension, you will always maintain control of your accounts and keys. 

Lunie browser extension provides added security given the fact that browser extension data are isolated from the browser and other extensions.

How to get started:

- Install the Lunie browser extension from [here](https://chrome.google.com/webstore/detail/lunie-browser-extension/hbaijkfbhhdhhjdfbpdafkjimohblhgf)
- Click “Create a new address” or “Recover with backup code”
- Head over to https://lunie.io to start staking!

# Develop

## Clone

```bash
$ git clone https://github.com/luniehq/lunie-browser-extension.git
$ cd lunie-browser-extension
```

## Prepare

This repository uses Lunie core as a dependency. Clone the Lunie Core repository (using branch `master`) via:

```bash
$ git clone https://github.com/luniehq/lunie.git
$ cd lunie
$ git checkout origin/master
```

Note: To reference components easily some aliases are set to the submodule in the Webpack config.

## Install dependencies

```bash
$ yarn install
```

## Set environment

You need to provide 2 environment variables for the extension to work as expected. 

- Provide an endpoint for the Lunie API: `LUNIE_API`

## Develop (with hot reload)

Make sure you're using node 10 or up.

```bash
$ LUNIE_API=https://staging-api.lunie.io EXTENSION=true yarn watch:dev
```

## Build

```bash
$ yarn run build
```

## Build enabling localhost connection

```bash
$ yarn run build:dev
```

## Test in Chrome

1. Go to chrome://extensions and check the box for Developer mode in the top right.
2. Click the Load unpacked extension button in the top left and select the build folder `lunie-browser-extension/dist/` to install it.

# Third-party Integration

If you would like to integrate your website with the Lunie Browser Extension, enabling your users to securely sign transactions, please follow these instructions.

To communicate with the extension we internally use the browser messaging API. Thankfully this is done for you. Please copy the code from the `https://github.com/luniehq/lunie/blob/master/src/scripts/extension-utils.js` to your website. This code exports functions that you may use throughout your website to send and receive messages from the extension.

We use Vue.js to create Lunie and our extension utils assume the use of Vuex.

There are 3 main functions:

## `listenToExtensionMessages(store)`
Calling `listenToExtensionMessages` and passing it a Vuex store will enable your Vue instance to commit and dispatch messages to your app.

It doesn't have to be Vuex, but the store object must have equivalent dispatch and commit methods. When initializing they are called with the following arguments:

- `store.commit("setExtensionAvailable")`
- `store.dispatch("getAddressesFromExtension")`

## `getAccountsFromExtension()`
Used to retrieve the current addresses registered in the extension.

The store utilised when initialising your website will send a commit message with an argument of `setExtensionAccounts` and include the accounts object.

- `store.commit("setExtensionAccounts", payload)`

## `signWithExtension(messageToSign, senderAddress)`
This will pass pass the transaction message and a sender address to the extension, and return an object shaped as follows:

```
  {
    signature: Buffer,
    publicKey: Buffer
  }
```

The final step would be to request your website domain is added to the allowed list of domains that the extension will accept.

## Internal Note
- Export the `extension-utils.js` functionality to a package users can install.
- Potentially might need to filter messages by domain.

# Publish

The CI handles publishing. The publish script can be found in `scripts/deploy.sh`.
If publishing fails, the refresh token could be outdated. In that case, follow these instructions: https://developer.chrome.com/webstore/using_webstore_api. After having used the console (not after the OAuth screen) you will receive a refresh token. Now set the environment variable `GAPI_REFRESH_TOKEN` in CircleCI with this token.

# Using without API

Since we will be shutting down our API, we have introduced a way to feed hardcoded data to the extension through the `network.js` and `validators.js` files. Each file includes one example with the necessary data for the extension to work properly. The env variable `LUNIE_API` is no longer needed to build the extension.