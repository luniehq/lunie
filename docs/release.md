# Creating a Cosmos Voyager Release

### Housekeeping

**TODO:** _Automate these tasks with scripts or allow setting via environment variables_

There are a few miscellaneous tasks to do before making a new release:

* Ensure the default network is correct in `app/config.toml`:

```toml
default_network = "gaia-5001"
```

* Ensure the network params you wish to use are in a folder at `app/networks/<networkname>`. It requires the `genesis.json`, `config.toml`, and `gaiaversion.txt` files. You can get them from the testnets repo (https://github.com/tendermint/testnets).
* Increment the version for this release in `package.json`.
* Commit and PR the above changes if necessary.

### Building the App

Follow the instructions in `README.md`. Specify the version of the Cosmos SDK to bundle with the `--sdk-commit` option.

### Verifying Builds with the Team

**TODO:** _Work on this process, automate as much as possible_

As a team, we should verify that we all independently arrived at the same result for each of the builds, which greatly increases security by reducing the chances that a build was backdoored by an attacker who has compromised one of our machines. (When dealing with huge sums of money, we can never be too careful).

* Paste the output from the previous commands into Slack and ensure everyone has matching hashes
* As a team, run the app at least once on each platform to double-check that the builds were done correctly

### TODO: Signing Builds

In the future, we will each have private keys to sign the builds, so that users can trust new versions when updating (either manually or with an auto-update feature).

We will also have a company key for macOS signatures, for extra security and so users aren't warned about the app being untrusted.

### Publish Release

Now this release is ready to go out to the world!

* Visit https://github.com/cosmos/voyager/releases/new to create the Github release
* Fill in the release text based on the format of past releases (https://github.com/cosmos/voyager/releases)
* Add changes from `CHANGELOG.md`
* Upload the build files from the `builds` folder (Windows `.zip`, Linux and Mac `.tar.gz`)
* Hit the big green button and enjoy the dopamine and serotonin flooding your brain
* 🎊🎉
