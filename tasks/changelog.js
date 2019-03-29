const fs = require(`fs`)
const { promisify } = require(`util`)
const { join } = require(`path`)
const exec = promisify(require(`child_process`).exec)
const inquirer = require(`inquirer`)

const changes = []

const ask = async () => {
  const answer = await inquirer
    .prompt([
      {
        type: `list`,
        name: `type`,
        message: `What type of change do you want to add to the changelog?`,
        choices: [
          { name: `Addition of feature`,
            value: `Added` },
          { name: `Change of existing behavior`,
            value: `Changed` },
          { name: `Fix for a bug`,
            value: `Fixed` },
          { name: `Security improvement`,
            value: `Security` },
          { name: `Deprecation of unused code/feature`,
            value: `Deprecated` }
        ]
      },
      {
        type: `input`,
        name: `content`,
        message: `What is the content of the change?`,
        validate: function(value) {
          if (value) return true

          return `You need to specify the change.`
        }
      },
      {
        type: `input`,
        name: `issue`,
        message: `(optional) Which GitHub issue is discussing this change?`
      },
      {
        type: `input`,
        name: `author`,
        message: `What is your GitHub handle?`,
        validate: function(value) {
          if (value) return true

          return `You need to specify your GitHub handle.`
        }
      },
      {
        type: `confirm`,
        name: `askAgain`,
        message: `Want to enter another change?`,
        default: false
      }
    ])
  changes.push(answer)
  if (answer.askAgain) {
    await ask()
  }
}

async function main() {
  await ask()

  const changelog = changes
    .reduce((changelog, { type, content, issue, author }) =>
      // eslint-disable-next-line no-useless-escape
      changelog += `[${type}] ${issue ? `[\#${issue}](https://github.com/cosmos/lunie/issues/${issue}) ` : ``}${content} @${author}\n`
    , ``)

  const branch = (await exec(`git rev-parse --abbrev-ref HEAD`)).stdout.trim()
    .replace(/\//g, `_`)

  if (!fs.existsSync(join(__dirname, `../changes`))) {
    fs.mkdirSync(join(__dirname, `../changes`))
  }
  fs.writeFileSync(join(__dirname, `../changes`, branch), changelog.trim(), {
    flag: `wx`,
    encoding: `utf8`
  })
}

main()