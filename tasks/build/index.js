"use strict"

const { cli } = require(`@nodeguy/cli`)
const fp = require(`lodash/fp`)
const optionsSpecification = require(`./optionsSpecification.json`)
const path = require(`path`)
const shell = require(`shelljs`)
const untildify = require(`untildify`)

cli(optionsSpecification, options => {
  const { commit, gaia, network } = options

  shell.exec(`docker build --tag cosmos/voyager-builder .`, {
    cwd: __dirname
  })

  // Expand '~' if preset and resolve to absolute pathnames for Docker.
  const resolved = fp.mapValues(fp.pipe(untildify, path.resolve, parsePath), {
    gaia,
    git: path.join(__dirname, "../../.git"),
    network,
    builds: path.join(__dirname, "../../builds")
  })

  // Make the 'builds' directory if not present.
  shell.mkdir(`-p`, resolved.builds)

  // Override the gaia option before passing the options into the container.
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

// Paths are resolved different on Windows. Docker needs the paths in the format //c/Users/Fabo/...
function parsePath(path) {
  if (process.platform === "win32") {
    const drive = path[0]
    return "//" + drive.toLowerCase() + path.substr(2).replace(/\\/g, "/")
  }
  return path
}
