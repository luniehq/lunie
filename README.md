# Lunie Official Monorepo

## Packages:

- API: an API to interact with many different PoS blockchains

- App: Lunie Core (webapp)

- Extension: Lunie browser extension.

## Preparation:

To install the required modules for all packages run:

```bash
$ yarn workspace api
$ yarn workspace app
$ yarn workspace extension
```

Or just work on the directory you are interested in and simply run `yarn`

#### To install a single package:

Should follow this syntax:

```bash
$ yarn workspace <workspace-name> --dev <package-name>
```

As an example:

```bash
$ yarn workspace extension --dev vue-jest
```

## To run:

- API:
```bash
$ yarn workspace api dev
```

- App:
```bash
$ yarn workspace app serve:win
```

## To build:

- Extension:
```bash
$ yarn workspace extension build
```

## To build enabling localhost connection

```bash
$ yarn run build:dev
```
