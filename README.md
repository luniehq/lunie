# Lunie Official Monorepo

## Packages:

- API: an API to interact with many different PoS blockchains
    ([README](https://github.com/luniehq/lunie/blob/develop/api/README.md))

- App: Lunie Core (webapp)
    ([README](https://github.com/luniehq/lunie/blob/develop/app/README.md))

- Extension: Lunie browser extension.
    ([README](https://github.com/luniehq/lunie/blob/develop/extension/README.md))

## Preparation:

To install the required modules for all packages run:

```bash
$ yarn
```

Or just work on the directory you are interested in and simply run `yarn`

#### To install a single package:

Should follow this syntax:

```bash
$ yarn workspace <workspace-name> add <package-name>
```

As an example:

```bash
$ yarn workspace extension add vue-jest
```

## To run:

- API:
```bash
$ yarn workspace api start
```

- App:
```bash
$ yarn workspace app serve
```

### To build extension:

```bash
$ export LUNIE_API=https://staging-api.lunie.io
$ yarn workspace extension build
```

### To build extension enabling localhost connection

```bash
$ export LUNIE_API=https://staging-api.lunie.io
$ yarn workspace extension build:dev
```
