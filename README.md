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

This repository uses Lunie core as a dependency. Install the submodule via:

```bash
$ git submodule init
$ git submodule update
```

Note: To reference components easily some aliases are set to the submodule in the webpack config.

## Install dependencies

```bash
$ yarn install
```

## Develop (with hot reload)

```bash
$ yarn watch:dev
```

## Build

```bash
$ yarn run build
```

## Test in Chrome

1. Go to chrome://extensions/ and check the box for Developer mode in the top right.
2. Click the Load unpacked extension button in the top left and select the build folder `lunie-browser-extension/dist/` to install it.
