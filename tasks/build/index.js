"use strict"

const { cli } = require(`@nodeguy/cli`)
const optionsSpecification = require(`./optionsSpecification.json`)
const path = require(`path`)
const R = require(`ramda`)
const shell = require(`shelljs`)
const untildify = require(`untildify`)

cli(optionsSpecification, options => {
  const { commit, gaia, network } = options

  // Build the Docker image (if necessary).
  shell.exec(`docker build --tag cosmos/voyager-builder .`, {
    cwd: __dirname
  })

  // Expand '~' if present and resolve all pathnames to absolute paths for
  // Docker.
  const resolvedPaths = R.map(R.pipe(untildify, path.resolve), {
    gaia,
    git: path.join(__dirname, "../../.git"),
    network,
    builds: path.join(__dirname, "../../builds")
  })

  // Create the 'builds' directory for the output if necessary.
  shell.mkdir(`-p`, resolvedPaths.builds)

  // Pass the options through to the container while overriding 'gaia'.
  const nextOptions = Object.assign({}, options, {
    gaia: `/mnt/gaia`
  })

  const nextOptionsString = Object.entries(nextOptions)
    .map(([key, value]) => `--${key}=${value}`)
    .join(` `)

  // Continue the build process in the container with the following mounts:
  //
  // inputs:
  //   gaia
  //   .git/
  //   default network
  //
  // output:
  //    builds
  //
  shell.exec(`docker run \
      --interactive \
      --mount type=bind,readonly,source=${resolvedPaths.gaia},target=/mnt/gaia \
      --mount type=bind,readonly,source=${resolvedPaths.git},target=/mnt/.git \
      --mount type=bind,readonly,source=${
        resolvedPaths.network
      },target=/mnt/network \
      --mount type=bind,source=${resolvedPaths.builds},target=/mnt/builds \
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
