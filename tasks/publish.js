"use strict"

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")
const git = require("simple-git/promise")()
const release = require("publish-release")
const util = require("util")

const build = defaultNetwork => {
  console.log("--- BUILDING ---")

  execSync(
    `node tasks/build/build.js \
      --network=${path.join(__dirname, `../app/networks`, defaultNetwork)}`,
    {
      stdio: `inherit`
    }
  )

  console.log("--- DONE BUILDING ---")
}

const assetsDir = path.join(__dirname, `../builds/Voyager`)

const publishRelease = (token, tag) =>
  util.promisify(release)({
    token,
    owner: "cosmos",
    repo: "voyager",
    tag,
    name: `Cosmos Voyager Alpha ${tag} (UNSAFE)`,
    notes: `
NOTE: DO NOT ENTER YOUR FUNDRAISER SEED. THIS SOFTWARE HAS NOT BEEN AUDITED.
NEVER ENTER YOUR FUNDRAISER SEED 12 WORDS ONTO AN ONLINE COMPUTER.

Even when we do start supporting fundraiser seeds, don't use it except for
testing or with small amounts. We will release a CLI to use for offline signing
of transactions, and we will also add hardware support for this UI.

Please checkout the [CHANGELOG.md](CHANGELOG.md) for a list of changes.
`,
    prerelease: true,
    assets: fs.readdirSync(assetsDir).map(file => path.join(assetsDir, file))
  })

async function main() {
  build(config.default_network)
  console.log("--- Publishing release ---")
  const tag = await git.tag(`--points-at`, `HEAD`)
  await publishRelease(process.env.GIT_BOT_TOKEN, tag)

  // needed to authenticate properly
  await git.addRemote(
    "bot",
    `https://${process.env.GIT_BOT_TOKEN}@github.com/cosmos/voyager.git`
  )

  await git.push("bot", "HEAD:master")
  console.log("--- Done releasing ---")
}

main().catch(reason => {
  console.error(reason)
  process.exit(1)
})
