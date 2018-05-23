"use strict"

const childProcess = require(`child_process`)
const { cli } = require(`@nodeguy/cli`)
const fp = require(`lodash/fp`)
const fs = require(`fs-extra`)
const path = require(`path`)
const untildify = require(`untildify`)

const optionsSpecification = {
  commit: ["commit from which to build"],
  network: ["path to the default network to use"],
  "sdk-commit": ["commit of the SDK to build"],
  "skip-pack": ["skip the repackaging of the JS files", false]
}

// Show the exec commands for easier debugging if something goes wrong.
const execSync = (command, options) => {
  console.log(command)
  childProcess.execSync(command, Object.assign({ stdio: `inherit` }, options))
}

cli(optionsSpecification, options => {
  const { commit, network, "sdk-commit": sdkCommit } = options

  execSync(
    `docker build \
      --build-arg SDK_COMMIT=${options[`sdk-commit`]} \
      --tag cosmos/voyager-builder .`,
    {
      cwd: __dirname
    }
  )

  // Expand '~' if preset and resolve to absolute pathnames for Docker.
  const resolved = fp.mapValues(fp.pipe(untildify, path.resolve), {
    git: path.join(__dirname, "../../.git"),
    network,
    builds: path.join(__dirname, "../../builds")
  })

  // Make the 'builds' directory if not present.
  fs.mkdirsSync(resolved.builds)

  const optionsString = Object.entries(options)
    .map(([key, value]) => `--${key}=${value}`)
    .join(` `)

  // inputs:
  //   .git/
  //   default network
  //
  // output: the builds directory
  execSync(
    `docker run \
      --env COMMIT=${commit} \
      --env SDK_COMMIT=${sdkCommit} \
      --interactive \
      --mount type=bind,readonly,source=${resolved.git},target=/mnt/.git \
      --mount type=bind,readonly,source=${
        resolved.network
      },target=/mnt/network \
      --mount type=bind,source=${resolved.builds},target=/mnt/builds \
      --rm \
      cosmos/voyager-builder ${optionsString}
  `
  )
})
