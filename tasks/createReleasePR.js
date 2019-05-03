"use strict"

const { cli, shell } = require(`@nodeguy/cli`)
const fs = require(`fs`)
const { join } = require(`path`)
const groupBy = require(`lodash.groupby`)
const octokit = require(`@octokit/rest`)()

const changesPath = join(__dirname, `../changes`)

function bumpVersion(versionString) {
  const versionElements = versionString.split(`.`)
  const patchVersionPosition = versionElements.length - 1
  versionElements[patchVersionPosition] =
    parseInt(versionElements[patchVersionPosition]) + 1
  return versionElements.join(`.`)
} // only touches filesystem

// collect all changes from files
/* istanbul ignore next */ async function collectPending() {
  if (!fs.existsSync(changesPath)) {
    throw new Error(`No pending changes.`)
  }
  const files = await fs.readdirSync(changesPath)
  const allChanges = files.map(file => {
    return fs.readFileSync(join(changesPath, file), `utf8`)
  })

  return allChanges
}

function addCategory(output, category, groupedLines) {
  if (groupedLines[category]) {
    output += `### ${category}\n\n`
    groupedLines[category].forEach(
      ({ content }) => (output += `- ${content}\n`)
    )
    output += `\n`
  }

  return output
}

// stitch all changes into one nice changelog
// changes is an array of the content from all individual changelogs
function beautifyChanges(changes) {
  const lines = changes.join(`\n`).split(`\n`)

  const categorized = lines.map(line => {
    const matches = /\[(\w+)\] (.+)/.exec(line)
    return {
      type: matches[1],
      content: matches[2]
    }
  })
  const grouped = groupBy(categorized, `type`)

  let output = ``
  output = addCategory(output, `Added`, grouped)
  output = addCategory(output, `Changed`, grouped)
  output = addCategory(output, `Fixed`, grouped)
  output = addCategory(output, `Security`, grouped)
  output = addCategory(output, `Deprecated`, grouped)

  return output.trim()
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
git add CHANGELOG.md changes/* package.json
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
  cli({}, async () => {
    const changeLog = fs.readFileSync(
      join(__dirname, `..`, `CHANGELOG.md`),
      `utf8`
    )
    const pending = beautifyChanges(await collectPending())
    const packageJson = require(join(__dirname, `..`, `package.json`))

    main({ octokit, shell, fs }, changeLog, pending, packageJson)

    // cleanup
    const files = await fs.readdirSync(changesPath)
    files.forEach(file => {
      fs.unlinkSync(join(changesPath, file))
    })
  })
}

module.exports = {
  main,
  bumpVersion,
  updateChangeLog,
  updatePackageJson,
  beautifyChanges
}
