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
        type: `list`,
        name: `referenceType`,
        message: `(mandatory) Which GitHub reference has this?`,
        choices: [
          { name: `Issue`,
            value: `issues` },
          { name: `Pull Request`,
            value: `pull` }
        ]
      },
      {
        type: `input`,
        name: `referenceId`,
        message: `What is the id of the reference issue/PR on GitHub?`,
        validate: function(value) {
          if (value) return true

          return `You need to specify the GitHub reference.`
        },
        transformer(input) {
          return input.replace(`#`, ``)
        }
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
    .reduce((changelog, {
      type,
      content,
      author,
      referenceType,
      referenceId
    }) => {
      const referenceLink = `https://github.com/cosmos/lunie/${referenceType}/${referenceId}`
      // eslint-disable-next-line no-useless-escape
      changelog += `[${type}] [\#${referenceId}](${referenceLink}) ${content} @${author}\n`
      return changelog
    }
    , ``)

  const branch = (await exec(`git rev-parse --abbrev-ref HEAD`)).stdout.trim()
    .replace(/\//g, `_`)

  const changesFolderPath = join(__dirname, `../changes`)
  if (!fs.existsSync(changesFolderPath)) {
    fs.mkdirSync(changesFolderPath)
  }
  const changeFileName = join(changesFolderPath, branch)
  if (fs.existsSync(changeFileName)) {
    fs.unlinkSync(changeFileName)
  }
  fs.writeFileSync(changeFileName, changelog.trim(), {
    flag: `wx`,
    encoding: `utf8`
  })

  // commit changelog
  exec(`git commit -m 'changelog' ${changesFolderPath}/*`)
}

main()