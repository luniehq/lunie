# Creating a Cosmos Voyager Release

### Automatic Release

There is an automatic release process setup. Just push to release and the CI will create a release candidate PR. If this is merged the CI will create and publish the release.

### Manual Release

If the CI is broken, you can also manually release. Therefor you need a GitHub access token with simple repository rights.

First create the release candidate:
`GIT_BOT_TOKEN={TOKEN} node tasks/releasePullRequest.js`

If this is merged, checkout the new develop. Then cleanup the release folder:
`rm -rf ./builds/Voyager`

Now build Voyager (checkout the <a href="../README.md#build-gaia">README.md</a> for how to build).

Now you publish the release:
`GIT_BOT_TOKEN={TOKEN} node tasks/publish.js`

### Verifying Builds with the Team

**TODO:** _Work on this process, automate as much as possible_

As a team, we should verify that we all independently arrived at the same result
for each of the builds, which greatly increases security by reducing the chances
that a build was backdoored by an attacker who has compromised one of our
machines. (When dealing with huge sums of money, we can never be too careful).

1.  Make a production build (see how in <a href="../README.md#build-gaia">README.md</a>).
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
