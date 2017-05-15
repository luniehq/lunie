# basecoin-ui

> An interface for Basecoin.

## Build Setup

**Run app in development mode:**

First, make sure you have [`basecoin`](https://github.com/tendermint/basecoin) installed on the `develop` branch.

```bash
yarn install
yarn run dev
```

**Build production releases:**

```bash
# build for all platforms
yarn run build
```

or

```bash
# build for one platform
yarn run build:darwin
yarn run build:linux
yarn run build:win32
```

You must have `wine` to build for win32 on non-Windows platforms.

---

This project was generated from [electron-vue](https://github.com/SimulatedGREG/electron-vue) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about this project can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
