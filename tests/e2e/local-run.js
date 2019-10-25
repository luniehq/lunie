const util = require("util")
const exec = util.promisify(require("child_process").exec)
const spawn = require("child_process").spawn

/* start the testnet and the development server and executes the local end to end tests */
/* you can provide the name of the file to test only one file > for send.spec.js `yarn test:e2e send` */
const main = async () => {
  const filter = process.argv[2]
  console.log("cloning lunie-backend repo")
  try {
    await exec("git clone https://github.com/luniehq/lunie-backend.git lunie-backend")
  } catch (error) { }
  await exec("cd lunie-backend && git pull origin develop")
  console.log("starting stack repo")
  await exec("cd lunie-backend && docker-compose up -d")

  console.log("starting website")
  const serve = spawn("yarn", ["test:e2e:serve"])
  serve.stdout.pipe(process.stdout)
  serve.stderr.pipe(process.stderr)
  // await until page is served
  await new Promise(resolve => {
    serve.stdout.on("data", async data => {
      if (data.toString().indexOf("App is served") !== -1) resolve()
    })
  })

  console.log("starting local e2e tests")
  let testArgs = ["test:e2e:local"]
  if (filter) testArgs = testArgs.concat(`--filter`, `*${filter}*`)
  const test = spawn("yarn", testArgs)
  test.stdout.pipe(process.stdout)
  test.stderr.pipe(process.stderr)

  // cleanup on exit
  test.on("exit", terminateProcesses({ serve, test }))
  test.stdout.on("data", async data => {
    if (data.toString().startsWith("Done in")) {
      await (terminateProcesses({ serve, test }, 0))()
    }
  })
  test.stderr.on("data", async data => {
    // ignore simple test failures
    if (data.toString().startsWith("expected")) return

    console.error("Test failed")
    await (terminateProcesses({ serve, test }))()
  })
  process.on("exit", terminateProcesses({ serve, test }))
}

const terminateProcesses = ({ serve, test }, exitCode = 1) => async () => {
  await exec("cd lunie-backend && docker-compose down")
  test.kill()
  serve.kill()
  process.exit(exitCode)
}

main()
