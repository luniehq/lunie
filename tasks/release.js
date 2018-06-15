"use strict"

const fs = require("fs")
const path = require("path")
const toml = require("toml")
const { execSync } = require("child_process")
const git = require("simple-git/promise")()
const release = require("publish-release")
const util = require("util")

function bumpVersion(versionString) {
  let versionElements = versionString.split(".")
  versionElements[2] = parseInt(versionElements[2]) + 1
  return versionElements.join(".")
}

function updateChangeLog(changeLog, newVersion, now) {
  const today = now.toISOString().slice(0, 10)

  return changeLog.replace(
    "## [Unreleased]",
    `## [Unreleased]\n\n## [${newVersion}] - ${today}`
  )
}

const updatePackageJson = (packageJson, version) =>
  Object.assign({}, packageJson, { version })

const pushCommit = async (token, tag) => {
  await Promise.all([
    git.addConfig("user.name", "Voyager Bot"),
    git.addConfig("user.email", "voyager_bot@tendermint.com")
  ])

  await git.commit("Bump version for release.", [
    __dirname + "/../package.json",
    __dirname + "/../CHANGELOG.md"
  ])

  await git.tag([tag])

  // needed to authenticate properly
  await git.addRemote("bot", `https://${token}@github.com/cosmos/voyager.git`)

  await git.push("bot", "HEAD:master")
}

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
    assets: fs.readdirSync(path.join(__dirname, `../builds/Voyager`))
  })

async function main() {
  console.log("Releasing Voyager...")
  const changeLog = fs.readFileSync(__dirname + "/../CHANGELOG.md", "utf8")
  const packageJson = require(__dirname + "/../package.json")
  const oldVersion = packageJson.version
  const newVersion = bumpVersion(oldVersion)

  const config = toml.parse(
    fs.readFileSync(__dirname + "/../app/config.toml", "utf8")
  )

  console.log("New version:", newVersion)
  const newChangeLog = updateChangeLog(changeLog, newVersion, new Date())
  const newPackageJson = updatePackageJson(packageJson, newVersion)

  fs.writeFileSync(__dirname + "/../CHANGELOG.md", newChangeLog, "utf8")

  fs.writeFileSync(
    __dirname + "/../package.json",
    JSON.stringify(newPackageJson, null, 2) + "\n",
    "utf8"
  )

  console.log("--- Committing release changes ---")
  const tag = `v${newVersion}`
  await pushCommit(process.env.GIT_BOT_TOKEN, tag)
  build(config.default_network)
  console.log("--- Publishing release ---")
  await publishRelease(process.env.GIT_BOT_TOKEN, tag)
  console.log("--- Done releasing ---")
}

if (require.main === module) {
  main().catch(reason => {
    console.error(reason)
    process.exit(1)
  })
} else {
  module.exports = {
    bumpVersion,
    updateChangeLog,
    updatePackageJson
  }
}
