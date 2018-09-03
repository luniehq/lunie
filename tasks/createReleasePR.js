"use strict"

const fs = require("fs")
const git = require("simple-git/promise")()
const octokit = require(`@octokit/rest`)()

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

const pushCommit = async ({ token, head }) => {
  await Promise.all([
    git.addConfig("user.name", "Voyager Bot"),
    git.addConfig("user.email", "voyager_bot@tendermint.com")
  ])

  await git.commit("Bump version for release.", [
    __dirname + "/../package.json",
    __dirname + "/../CHANGELOG.md"
  ])

  // needed to authenticate properly
  await git.addRemote("bot", `https://${token}@github.com/cosmos/voyager.git`)

  await git.push("bot", `HEAD:${head}`)
}

const recentChanges = changeLog =>
  changeLog.match(/.+?## .+?\n## .+?\n\n(.+?)\n## /s)[1]

const createPullRequest = async ({ changeLog, token, tag, head }) => {
  octokit.authenticate({
    type: `token`,
    token
  })

  await octokit.pullRequests.create({
    owner: `cosmos`,
    repo: `voyager`,
    title: `automatic release created for ${tag}`,
    head,
    base: `develop`,
    body: recentChanges(changeLog),
    maintainer_can_modify: true
  })
}

async function main() {
  console.log("Making release...")
  const changeLog = fs.readFileSync(__dirname + "/../CHANGELOG.md", "utf8")
  const packageJson = require(__dirname + "/../package.json")
  const oldVersion = packageJson.version
  const newVersion = bumpVersion(oldVersion)
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
  const head = `release-candidate/${tag}`
  await pushCommit({ token: process.env.GIT_BOT_TOKEN, tag, head })

  await createPullRequest({
    changeLog: newChangeLog,
    token: process.env.GIT_BOT_TOKEN,
    tag,
    head
  })
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
