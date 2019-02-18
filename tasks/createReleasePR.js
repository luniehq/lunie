"use strict"

const { cli, shell } = require(`@nodeguy/cli`)
const fs = require(`fs`)
const octokit = require(`@octokit/rest`)()

function bumpVersion(versionString) {
  const versionElements = versionString.split(`.`)
  const patchVersionPosition = versionElements.length - 1
  versionElements[patchVersionPosition] =
    parseInt(versionElements[patchVersionPosition]) + 1
  return versionElements.join(`.`)
}

function updateChangeLog(changeLog, newVersion, now) {
  const today = now.toISOString().slice(0, 10)

  return changeLog.replace(
    `## [Unreleased]`,
    `## [Unreleased]\n\n## [${newVersion}] - ${today}`
  )
}

const updatePackageJson = (packageJson, version) =>
  Object.assign({}, packageJson, { version })

const pushCommit = ({ token, branch }) =>
  shell(`
set -o verbose
git config --local user.name "Voyager Bot"
git config --local user.email "voyager_bot@tendermint.com"
git add CHANGELOG.md package.json
git commit --message="Bump version for release."
git tag --force release-candidate
git remote add bot https://${token}@github.com/cosmos/voyager.git
git push --force --tags bot HEAD:${branch}
`)

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
    base: `master`,
    body: recentChanges(changeLog),
    maintainer_can_modify: true
  })
}

if (require.main === module) {
  cli({}, async () => {
    console.log(`Making release...`)
    const changeLog = fs.readFileSync(__dirname + `/../CHANGELOG.md`, `utf8`)
    const packageJson = require(__dirname + `/../package.json`)
    const oldVersion = packageJson.version
    const newVersion = bumpVersion(oldVersion)
    console.log(`New version:`, newVersion)
    const newChangeLog = updateChangeLog(changeLog, newVersion, new Date())
    const newPackageJson = updatePackageJson(packageJson, newVersion)

    fs.writeFileSync(__dirname + `/../CHANGELOG.md`, newChangeLog, `utf8`)

    fs.writeFileSync(
      __dirname + `/../package.json`,
      JSON.stringify(newPackageJson, null, 2) + `\n`,
      `utf8`
    )

    console.log(`--- Committing release changes ---`)

    const tag = `v${newVersion}`
    const branch = `release-candidate/${tag}`
    await pushCommit({ token: process.env.GIT_BOT_TOKEN, branch })

    await createPullRequest({
      changeLog: newChangeLog,
      token: process.env.GIT_BOT_TOKEN,
      tag,
      head: branch
    })
  })
}

module.exports = {
  bumpVersion,
  updateChangeLog,
  updatePackageJson
}
