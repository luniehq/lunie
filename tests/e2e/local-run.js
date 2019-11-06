const util = require("util")
const fs = require("fs")
const exec = util.promisify(require("child_process").exec)
const spawn = require("child_process").spawn
const inquirer = require(`inquirer`);

const processes = {}

/* start the testnet and the development server and executes the local end to end tests */
/* you can provide the name of the file to test only one file > for send.spec.js `yarn test:e2e send` */
const main = async () => {
  if (!fs.existsSync("./lunie-backend")) {
    console.log("cloning lunie-backend repo")
    await exec("git clone https://github.com/luniehq/lunie-backend.git lunie-backend")
  } else {
    console.log("updating lunie-backend repo")
    await exec("cd lunie-backend && git pull origin develop")
  }
  await exec("cd lunie-backend && git pull origin develop")
  console.log("starting lunie-backend repo")
  await exec("cd lunie-backend && docker-compose up -d")

  console.log("starting website")
  const serve = spawn("yarn", ["test:e2e:serve"])
  serve.stdout.pipe(process.stdout, { end: true })
  serve.stderr.pipe(process.stderr, { end: true })
  // await until page is served
  await new Promise(resolve => {
    serve.stdout.on("data", async data => {
      if (data.toString().indexOf("App is served") !== -1) resolve()
    })
  })
  processes.serve = serve

  runTests()

  process.on("exit", terminateProcesses())
}

const terminateProcesses = (exitCode = 1) => async () => {
  await exec("cd lunie-backend && docker-compose stop")
  processes.test.kill()
  processes.serve.kill()
  process.exit(exitCode)
}

const runTests = () => {
  // cleanup
  if (processes.test) {
    processes.test.kill()
  }

  console.log("starting local e2e tests")
  let testArgs = ["test:e2e:local"]
  const filter = process.argv[2]
  if (filter) testArgs = testArgs.concat(`--filter`, `*${filter}*`)
  const test = spawn("yarn", testArgs)
  test.stdout.pipe(process.stdout, { end: true })
  test.stderr.pipe(process.stderr, { end: true })

  // cleanup on exit
  // test.on("exit", terminateProcesses())
  test.stdout.on("data", async data => {
    if (data.toString().startsWith("Done in")) {
      onEnd(true)
    }
  })
  test.stderr.on("data", async data => {
    // ignore simple test failures
    if (data.toString().startsWith("expected")) return

    console.error("Test failed")
    onEnd(false)
  })

  test.on("exit", async exitCode => {
    onEnd(exitCode === 0)
  })

  processes.test = test
}

const onEnd = async (success) => {
  await new Promise(resolve => setTimeout(resolve), 500)
  const answers = await inquirer.prompt([{
    type: `confirm`,
    name: `runAgain`,
    message: `Want to run the tests again?`,
    default: false
  }])

  if (answers.runAgain) {
    runTests()
  } else {
    terminateProcesses()
  }
}

main()
