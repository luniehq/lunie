"use strict"

const { cli } = require(`@nodeguy/cli`)
const options = require(`./options.json`)
const path = require(`path`)
const shell = require(`shelljs`)
const untildify = require(`untildify`)

cli(options, async ({ commit, gaia, platform, "skip-pack": skipPack }) => {
  shell.exec(`docker build --tag cosmos/voyager-builder .`, {
    cwd: __dirname
  })

  const builds = path.resolve(__dirname, "../../builds")
  shell.mkdir(`-p`, builds)

  const resolved = {
    gaia: parsePath(path.resolve(untildify(gaia))),
    git: parsePath(path.resolve(__dirname, "../../.git")),
    builds: parsePath(builds)
  }

  shell.exec(`docker run \
      --interactive \
      --mount type=bind,readonly,source=${resolved.gaia},target=/mnt/gaia \
      --mount type=bind,readonly,source=${resolved.git},target=/mnt/.git \
      --mount type=bind,source=${resolved.builds},target=/mnt/builds \
      --rm \
      cosmos/voyager-builder \
        "${commit}" \
        --gaia=/mnt/gaia \
        --platform=${platform} \
        --skip-pack=${skipPack}
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
