const util = require("util")
const exec = util.promisify(require("child_process").exec)
const spawn = require("child_process").spawn

/* start the testnet and the development server and executes the local end to end tests */
/* you can provide the name of the file to test only one file > for send.spec.js `yarn test:e2e send` */
const main = async () => {
  const filter = process.argv[2]
  await exec("yarn testnet:start:container")
  const proxy = spawn("yarn", ["proxy"])
  proxy.stdout.pipe(process.stdout)
  proxy.stderr.pipe(process.stderr)
  const serve = spawn("yarn", ["test:e2e:serve"])
  serve.stdout.pipe(process.stdout)
  serve.stderr.pipe(process.stderr)
  let testArgs = ["test:e2e:local"]
  if (filter) testArgs = testArgs.concat(`--filter`, `*${filter}*`)
  const test = spawn("yarn", testArgs)
  test.stdout.pipe(process.stdout)
  test.stderr.pipe(process.stderr)

  test.on("exit", terminateProcesses({ proxy, serve, test }))
  test.stdout.on("data", async data => {
    if (data.toString().startsWith("Done in")) {
      await terminateProcesses({ proxy, serve, test })
      process.exit(0)
    }
  })
  test.stderr.on("data", async data => {
    // ignore simple test failures
    if (data.toString().startsWith("expected")) return

    console.error("Test failed")
    await terminateProcesses({ proxy, serve, test })
    process.exit(1)
  })
  process.on("exit", terminateProcesses({ proxy, serve, test }))
}

const terminateProcesses = ({ proxy, serve, test }) => async () => {
  await exec("yarn testnet:stop")
  test.kill()
  serve.kill()
  proxy.kill()
}

main()
