"use strict"

const fs = require("fs")
const path = require("path")
const toml = require("toml")
const { execSync } = require("child_process")
const git = require("simple-git")
const release = require("publish-release")

const RELEASE_BRANCH = "develop"

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

async function main() {
  console.log("Releasing Voyager...")

  const changeLog = fs.readFileSync(__dirname + "/../CHANGELOG.md", "utf8")
  const packageJson = require(__dirname + "/../package.json")
  const oldVersion = packageJson.version
  const newVersion = bumpVersion(oldVersion)
  const releaseConfig = require(__dirname + "/../release.config.json")
  const config = toml.parse(
    fs.readFileSync(__dirname + "/../app/config.toml", "utf8")
  )

  console.log("New version:", newVersion)

  const newChangeLog = updateChangeLog(changeLog, newVersion, new Date())
  const newPackageJson = updatePackageJson(packageJson, newVersion)

  fs.writeFileSync(__dirname + "/../CHANGELOG.md", newChangeLog, "utf8")

  fs.writeFileSync(
    __dirname + "/../package.json",
    JSON.stringify(newPackageJson, null, 2),
    "utf8"
  )

  const VoyagerCommit = execSync("git rev-parse --short=6 HEAD")
    .toString()
    .trim()

  console.log("Voyager commit:", VoyagerCommit)
  console.log("SDK commit:", releaseConfig.SDK_COMMIT) // TODO put in config.toml?

  if (!process.env.SKIP_BUILD) {
    console.log("--- BUILDING ---")
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
    console.log("--- DONE BUILDING ---")
  } else {
    console.log("--- SKIPPED BUILDING ---")
  }

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
    .push("origin", RELEASE_BRANCH)

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

      Please checkout the [CHANGELOG.md](CHANGELOG.md) for a list of changes.
      `,
      draft: false,
      prerelease: true,
      skipAssetsCheck: false,
      assets: [
        path.join(
          __dirname,
          `../builds/Cosmos Voyager-darwin-x64_${newVersion}.tar.gz`
        ),
        path.join(
          __dirname,
          `../builds/Cosmos Voyager-linux-x64_${newVersion}.tar.gz`
        ),
        path.join(
          __dirname,
          `../builds/Cosmos Voyager-win32-x64_${newVersion}.zip`
        )
      ],
      target_commitish: RELEASE_BRANCH
    },
    function(err, release) {
      console.log("--- Done releasing ---")
      // `release`: object returned from github about the newly created release
    }
  )
}

if (require.main === module) {
  main().then(null, console.error)
} else {
  module.exports = {
    bumpVersion,
    updateChangeLog,
    updatePackageJson
  }
}
