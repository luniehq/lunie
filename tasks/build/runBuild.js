"use strict"

const childProcess = require(`child_process`)
const { cli } = require(`@nodeguy/cli`)
const fp = require(`lodash/fp`)
const fs = require(`fs-extra`)
const path = require(`path`)
const untildify = require(`untildify`)

const optionsSpecification = {
  commit: ["commit from which to build"],
  network: ["name of the default network to use"]
}

// Show the exec commands for easier debugging if something goes wrong.
const execSync = (command, options) => {
  console.log(command)
  childProcess.execSync(command, Object.assign({ stdio: `inherit` }, options))
}

cli(optionsSpecification, async options => {
  const builds = path.join(__dirname, `../../builds`)

  if (!(await fs.pathExists(path.join(builds, `Gaia`)))) {
    console.log(`Gaia not found, building...`)
    execSync(`yarn run build:gaia`)
  }

  const { commit } = options

  // Build the container that we'll use to build Voyager.
  execSync(`docker build --tag cosmos/voyager-builder .`, {
    cwd: __dirname
  })

  fs.ensureDirSync(path.join(builds, `Voyager`))

  // Expand '~' if preset and resolve to absolute pathnames for Docker.
  const resolved = fp.mapValues(fp.pipe(untildify, path.resolve), {
    git: path.join(__dirname, "../../.git"),
    builds
  })

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
      --interactive \
      --mount type=bind,readonly,source=${resolved.git},target=/mnt/.git \
      --mount type=bind,source=${resolved.builds},target=/mnt/builds \
      --rm \
      cosmos/voyager-builder ${optionsString}
  `
  )
})
