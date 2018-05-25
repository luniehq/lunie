const fs = require("fs")
const path = require("path")
const toml = require("toml")
const { execSync } = require("child_process")
const git = require("simple-git")
const release = require("publish-release")

function updateVersion(newVersion) {
  const packageJson = require(__dirname + "/../package.json")
  packageJson.version = newVersion
  fs.writeFileSync(
    __dirname + "/../package.json",
    JSON.stringify(packageJson, null, 2),
    "utf8"
  )
}

function bumpVersion(versionString) {
  let versionElements = versionString.split(".")
  versionElements[2] = parseInt(versionElements[2]) + 1
  return versionElements.join(".")
}

function getVersion() {
  const packageJson = require(__dirname + "/../package.json")
  return packageJson.version
}

function updateChangelog(newVersion) {
  let changelog = fs.readFileSync(__dirname + "/../CHANGELOG.md", "utf8")
  changelog = changelog.replace(
    "## [Unreleased]",
    `## [Unreleased]\n\n## [${newVersion}] - ${new Date().toUTCString()}`
  )
  fs.writeFileSync(__dirname + "/../CHANGELOG.md", changelog, "utf8")
}

async function main() {
  console.log("Releasing Voyager...")

  const oldVersion = getVersion()
  const newVersion = bumpVersion(oldVersion)
  const releaseConfig = require(__dirname + "/../release.config.json")
  const config = toml.parse(
    fs.readFileSync(__dirname + "/../app/config.toml", "utf8")
  )

  console.log("New version:", newVersion)

  updateVersion(newVersion)
  updateChangelog(newVersion)

  const VoyagerCommit = execSync("git rev-parse --short=6 HEAD")
    .toString()
    .trim()

  console.log("Voyager commit:", VoyagerCommit)
  console.log("SDK commit:", releaseConfig.SDK_COMMIT) // TODO put in config.toml?

  console.log("--- BUILDING ---")
  if (!process.env.SKIP_BUILD) {
    execSync(
      [
        "yarn",
        "build",
        "--network=" +
          path.join(__dirname, "../app/networks/" + config.default_network),
        "--sdk-commit=" + releaseConfig.SDK_COMMIT,
        "--commit=" + VoyagerCommit
      ].join(" "),
      {
        stdio: [0, 1, 2]
      }
    )
  }
  console.log("--- DONE BUILDING ---")

  console.log("--- Committing release changes ---")
  git()
    .addConfig("user.name", "Voyager Bot")
    .addConfig("user.email", "voyager_bot@tendermint.com")
    .removeRemote("origin")
    // needed to authenticate properly
    .addRemote(
      "origin",
      `https://${process.env.GIT_BOT_TOKEN}@github.com/cosmos/voyager.git`
    )
    .commit("Bumped version for release", [
      __dirname + "/../package.json",
      __dirname + "/../CHANGELOG.md"
    ])
    .tag([newVersion])
    .push()

  console.log("--- Publishing release ---")

  release(
    {
      token: process.env.GIT_BOT_TOKEN,
      owner: "cosmos",
      repo: "voyager",
      tag: newVersion,
      name: `Cosmos Voyager Alpha ${newVersion} (UNSAFE)`,
      notes: `
      NOTE: DO NOT ENTER YOUR FUNDRAISER SEED. THIS SOFTWARE HAS NOT BEEN AUDITED. NEVER ENTER YOUR FUNDRAISER SEED 12 WORDS ONTO AN ONLINE COMPUTER.

      Even when we do start supporting fundraiser seeds, don't use it except for testing or with small amounts. We will release a CLI to use for offline signing of transactions, and we will also add hardware support for this UI.

      Please checkout the CHANGELOG.md for a list of changes.
      `,
      draft: false,
      prerelease: true,
      skipAssetsCheck: false,
      assets: [
        __dirname + `/../builds/Cosmos Voyager-darwin-x64_${newVersion}.tar.gz`,
        __dirname + `/../builds/Cosmos Voyager-linux-x64_${newVersion}.tar.gz`,
        __dirname + `/../builds/Cosmos Voyager-win32-x64_${newVersion}.zip`
      ],
      target_commitish: "develop"
    },
    function(err, release) {
      console.log("--- Done releasing ---")
      // `release`: object returned from github about the newly created release
    }
  )
}

main().then(null, console.error)
