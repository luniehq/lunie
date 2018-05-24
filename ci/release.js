const fs = require("fs")
const { spawn } = require("child_process")
const git = require("simple-git")
const release = require("publish-release")

function updateVersion(newVersion) {
  const packageJson = require("../package.json")
  packageJson.version = newVersion
  fs.writeFileSync("../package.json", JSON.stringify(packageJson))
}

function bumpVersion(versionString) {
  let versionElements = versionString.split(".").map(parseInt)
  versionElements[2] = versionElements[2] + 1
  return versionElements.join(".")
}

function getVersion() {
  const packageJson = require(__dirname + "/../package.json")
  return packageJson.version
}

function updateChangelog(newVersion) {
  let changelog = fs.readFileSync(__dirname + "/../CHANGELOG.md", "utf8")
  changelog.replace(
    "## [Unreleased]",
    `## [Unreleased]\n\n## [${newVersion}] - ${new Date().toUTCString()}`
  )
}

async function main() {
  try {
    const oldVersion = getVersion()
    const newVersion = bumpVersion(oldVersion)
    const releaseConfig = require(__dirname + "/../release.config.json")

    updateVersion(newVersion)
    updateChangelog(newVersion)

    const commit = await new Promise(resolve => {
      let child = spawn("git", ["rev-parse", "--short=5", "HEAD"])
      child.stdout = process.stdout
      child.stderr = process.stderr
      child.stdout.on("data", () => {
        resolve(data.toSting())
      })
    })
    console.log("HALLO")

    await new Promise((resolve, reject) => {
      let child = spawn("yarn", [
        "build",
        "--sdk-commit",
        releaseConfig.SDK_COMMIT,
        "--commit",
        commit
      ])
      child.stdout = process.stdout
      child.stderr = process.stderr
      child.on("exit", code => {
        if (code === 0) {
          resolve()
        }
        reject()
      })
    })

    git
      .commit("Bumped version for release", [
        __dirname + "/../package.json",
        __dirname + "/../CHANGELOG.md"
      ])
      .tag([newVersion])
      .push()

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
          __dirname +
            `/../builds/Cosmos Voyager-darwin-x64_${newVersion}.tar.gz`,
          __dirname +
            `/../builds/Cosmos Voyager-linux-x64_${newVersion}.tar.gz`,
          __dirname + `/../builds/Cosmos Voyager-win32-x64_${newVersion}.zip`
        ],
        target_commitish: "master"
      },
      function(err, release) {
        // `release`: object returned from github about the newly created release
      }
    )
  } catch (err) {
    console.error(err)
  }
}

main().then(console.log, console.error)
