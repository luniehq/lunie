"use strict"

const { cli } = require(`@nodeguy/cli`)
const specification = require(`./options.json`)
const path = require(`path`)
const R = require(`ramda`)
const shell = require(`shelljs`)
const untildify = require(`untildify`)

cli(specification, options => {
  const { commit, gaia, network } = options

  shell.exec(`docker build --tag cosmos/voyager-builder .`, {
    cwd: __dirname
  })

  const resolved = R.map(R.pipe(untildify, path.resolve), {
    gaia,
    git: path.join(__dirname, "../../.git"),
    network,
    builds: path.join(__dirname, "../../builds")
  })

  shell.mkdir(`-p`, resolved.builds)

  const nextOptions = Object.assign({}, options, {
    gaia: `/mnt/gaia`
  })

  const nextOptionsString = Object.entries(nextOptions)
    .map(([key, value]) => `--${key}=${value}`)
    .join(` `)

  // inputs: The Gaia binary and the .git directory.
  // inputs:
  //   gaia
  //   .git/
  //   default network
  //
  // output: the builds directory
  shell.exec(`docker run \
      --interactive \
      --mount type=bind,readonly,source=${resolved.gaia},target=/mnt/gaia \
      --mount type=bind,readonly,source=${resolved.git},target=/mnt/.git \
      --mount type=bind,readonly,source=${
        resolved.network
      },target=/mnt/network \
      --mount type=bind,source=${resolved.builds},target=/mnt/builds \
      --rm \
      cosmos/voyager-builder "${commit}" ${nextOptionsString}
  `)
})
