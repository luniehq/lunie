# Creating a Cosmos UI Release

## Gaia

First, you'll need to either download trusted `gaia` binaries for each platform, or build them yourself.

### Building Gaia Binaries

**TODO:** *Use Docker for this step*

If you build the binaries yourself, you'll need to have Golang 1.9 installed, and be on the correct version of `gaia` for the network you are building the UI for:

```bash
go version # should be at least 1.9

cd $GOPATH/src/github.com/cosmos/gaia
git checkout v0.5.0 # choose a gaia version

# install deps
rm -rf vendor
glide install
```

Once that is checked out, we can build the binaries for each platform:

```bash
# macOS
GOOS=darwin GOARCH=amd64 go build \
  -ldflags "-s -w" \
  -o gaia-mac \
  ./cmd/gaia

# 32-bit linux
GOOS=linux GOARCH=386 go build \
  -ldflags "-s -w" \
  -o gaia-linux-32 \
  ./cmd/gaia

# 32-bit windows
GOOS=windows GOARCH=386 go build \
  -ldflags "-s -w" \
  -o gaia-windows-32.exe \
  ./cmd/gaia

# (if you want 64-bit, change `GOARCH=386` to `GOARCH=amd64`)
```

## Cosmos UI

Now that we have `gaia`, we can build the app.

### Dependencies

Just in case you installed package dependencies in a non-deterministic order, it's a good idea to remove them and reinstall:

```bash
rm -rf node_modules
yarn
```

### Housekeeping

**TODO:** *Automate these tasks with scripts or allow setting via environment variables*

There are a few miscellaneous tasks to do before making a new release:
- Ensure the default network is correct in `app/src/main/index.js`:
```js
// currently set to gaia-2, change if necessary
let DEFAULT_NETWORK = join(__dirname, '../networks/gaia-2')
```
- Ensure the network params you wish to use are in a folder at `app/networks/<networkname>`. It requires the `genesis.json`, `config.toml`, and `gaiaversion.txt` files. You can get them from the testnets repo (https://github.com/tendermint/testnets).
- Increment the version for this release in `package.json`.
- Commit and PR the above changes if necessary.

### Building the App

```bash
# macOS
yarn build:darwin \
  --binary=$GOPATH/src/github.com/cosmos/gaia/gaia-mac

# linux (32-bit)
yarn build:linux \
  --binary=$GOPATH/src/github.com/cosmos/gaia/gaia-linux-32

# windows (32-bit)
yarn build:win32 \
  --binary=$GOPATH/src/github.com/cosmos/gaia/gaia-windows-32.exe
```

### Verifying Builds with the Team

**TODO:** *Work on this process, automate as much as possible*

As a team, we should verify that we all independently arrived at the same result for each of the builds, which greatly increases security by reducing the chances that a build was backdoored by an attacker who has compromised one of our machines. (When dealing with huge sums of money, we can never be too careful).

- Paste the output from the previous commands into Slack and ensure everyone has matching hashes
- As a team, run the app at least once on each platform to double-check that the builds were done correctly

### TODO: Signing Builds

In the future, we will each have private keys to sign the builds, so that users can trust new versions when updating (either manually or with an auto-update feature).

We will also have a company key for macOS signatures, for extra security and so users aren't warned about the app being untrusted.

### Publish Release

Now this release is ready to go out to the world!

- Visit https://github.com/cosmos/cosmos-ui/releases/new to create the Github release
- Fill in the release text based on the format of past releases (https://github.com/cosmos/cosmos-ui/releases)
- Add changes from `CHANGELOG.md`
- Upload the build files from the `builds` folder (Windows `.zip`, Linux and Mac `.tar.gz`)
- Hit the big green button and enjoy the dopamine and serotonin flooding your brain
- 🎊🎉
