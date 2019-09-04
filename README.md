# Lunie browser extension


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
yarn run build
```

## Test in Chrome

1. Go to chrome://extensions/ and check the box for Developer mode in the top right.
2. Click the Load unpacked extension button in the top left and select the `dist/` folder to install it.
