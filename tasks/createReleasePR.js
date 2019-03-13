"use strict"

const { cli, shell } = require(`@nodeguy/cli`)
const fs = require(`fs`)
const { join } = require(`path`)
const octokit = require(`@octokit/rest`)()

function bumpVersion(versionString) {
  const versionElements = versionString.split(`.`)
  const patchVersionPosition = versionElements.length - 1
  versionElements[patchVersionPosition] =
    parseInt(versionElements[patchVersionPosition]) + 1
  return versionElements.join(`.`)
}

function updateChangeLog(changeLog, pending, newVersion, now) {
  const today = now.toISOString().slice(0, 10)

  return changeLog.replace(
    `## [Unreleased]`,
    `## [Unreleased]\n\n## [${newVersion}] - ${today}\n\n${pending}`
  )
}

const updatePackageJson = (packageJson, version) =>
  Object.assign({}, packageJson, { version })

const pushCommit = (shell, { token, branch }) =>
  shell(`
set -o verbose
git config --local user.name "Voyager Bot"
git config --local user.email "voyager_bot@tendermint.com"
git add CHANGELOG.md PENDING.md package.json
git commit --message="Bump version for release."
git tag --force release-candidate
git remote add bot https://${token}@github.com/cosmos/voyager.git
git push --force --tags bot HEAD:${branch}
`)

const recentChanges = changeLog =>
  changeLog.match(/.+?## .+?\n## .+?\n\n(.+?)\n## /s)[1]

const createPullRequest = async (octokit, { changeLog, token, tag, head }) => {
  octokit.authenticate({
    type: `token`,
    token
  })

  await octokit.pullRequests.create({
    owner: `cosmos`,
    repo: `voyager`,
    title: `automatic release created for ${tag}`,
    head,
    base: `master`,
    body: recentChanges(changeLog),
    maintainer_can_modify: true
  })
}

async function main({ octokit, shell, fs }, changeLog, pending, packageJson) {
  // only update if sth changed
  if (pending.trim() === ``) return

  console.log(`Making release...`)

  const oldVersion = packageJson.version
  const newVersion = bumpVersion(oldVersion)
  console.log(`New version:`, newVersion)
  const newChangeLog = updateChangeLog(
    changeLog,
    pending,
    newVersion,
    new Date()
  )
  const newPackageJson = updatePackageJson(packageJson, newVersion)

  fs.writeFileSync(join(__dirname, `..`, `PENDING.md`), ``, `utf8`)
  fs.writeFileSync(join(__dirname, `..`, `CHANGELOG.md`), newChangeLog, `utf8`)
  fs.writeFileSync(
    join(__dirname, `..`, `package.json`),
    JSON.stringify(newPackageJson, null, 2) + `\n`,
    `utf8`
  )

  console.log(`--- Committing release changes ---`)

  const tag = `v${newVersion}`
  const branch = `release-candidate/${tag}`
  await pushCommit(shell, { token: process.env.GIT_BOT_TOKEN, branch })

  await createPullRequest(octokit, {
    changeLog: newChangeLog,
    token: process.env.GIT_BOT_TOKEN,
    tag,
    head: branch
  })
}

if (require.main === module) {
  /* istanbul ignore next */
  cli({}, () => {
    const changeLog = fs.readFileSync(join(__dirname, `..`, `CHANGELOG.md`), `utf8`)
    const pending = fs.readFileSync(join(__dirname, `..`, `PENDING.md`), `utf8`)
    const packageJson = require(join(__dirname, `..`, `package.json`))

    main({ octokit, shell, fs }, changeLog, pending, packageJson)
  })
}

module.exports = {
  main,
  bumpVersion,
  updateChangeLog,
  updatePackageJson
}
