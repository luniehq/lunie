# delegation-game

> An interface for the Cosmos Delegation game..

## Build Setup

**Run app in development mode:**

First, make sure you have [`gaia`](https://github.com/cosmos/gaia) up-to-date and installed.

*(Note: I have noticed issues when using npm version 5, you may need to downgrade by running `npm install -g npm@4`)*

```bash
npm install
npm run clean-dev
```

**Build production releases:**

```bash
# build for all platforms
npm run build
```

or

```bash
# build for one platform
npm run build:darwin
npm run build:linux
npm run build:win32
```

You must have `wine` to build for win32 on non-Windows platforms.

---

This project was generated from [electron-vue](https://github.com/SimulatedGREG/electron-vue) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about this project can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
