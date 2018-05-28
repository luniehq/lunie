# Creating a Cosmos Voyager Release

### Housekeeping

There are a few miscellaneous tasks to do before making a new release:

1.  Ensure the default network is correct in `app/config.toml`:

```toml
default_network = "gaia-5001"
```

2.  Ensure the network params you wish to use are in a folder at
    `app/networks/<networkname>`. It requires the `genesis.json`, `config.toml`,
    and `gaiaversion.txt` files. You can get them from the testnets repo
    (https://github.com/tendermint/testnets).
1.  Update `CHANGELOG.md`.
1.  Commit and PR the above changes if necessary.
1.  Push the commit to the `release` branch. If the tests pass then it will also
    be pushed to `master` and a release will be published on GitHub.

### Verifying Builds with the Team

**TODO:** _Work on this process, automate as much as possible_

As a team, we should verify that we all independently arrived at the same result
for each of the builds, which greatly increases security by reducing the chances
that a build was backdoored by an attacker who has compromised one of our
machines. (When dealing with huge sums of money, we can never be too careful).

1.  Make a production build (see how in <a href="../README.md">README.md</a>).
1.  Paste the output from the previous commands into Slack and ensure everyone
    has matching hashes.
1.  As a team, run the app at least once on each platform to double-check that
    the builds were done correctly.
1.  Enjoy the dopamine and serotonin flooding your brain.
1.  🎊🎉

### TODO: Signing Builds

In the future, we will each have private keys to sign the builds, so that users
can trust new versions when updating (either manually or with an auto-update
feature).

We will also have a company key for macOS signatures, for extra security and so
users aren't warned about the app being untrusted.
