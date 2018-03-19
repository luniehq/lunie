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
    gaia: path.resolve(untildify(gaia)),
    git: path.resolve(__dirname, "../../.git"),
    builds
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
