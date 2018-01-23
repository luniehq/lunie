'use strict'

const { exec } = require('child_process')
const { join } = require('path')
const packager = require('electron-packager')
const fs = require('fs-extra')
const zip = require('deterministic-zip')

let skipPack = false
let binaryPath = null
process.argv.forEach(function (val) {
  if (val === '--skip-pack') {
    console.log('Skipping packaging')
    skipPack = true
  }
  if (val.startsWith('--binary')) {
    binaryPath = val.replace('--binary=', '')
    console.log('Using prebuilt binary', binaryPath)
  }
})

if (!binaryPath) {
  console.error(`\x1b[31mPlease specify a gaia binary for this platform using the "--binary" flag
    Example: npm run build:darwin -- --binary=./gaia
    \x1b[0m`)
  process.exit(1)
}

if (process.env.PLATFORM_TARGET === 'clean') {
  require('del').sync(['builds/*', '!.gitkeep'])
  console.log('\x1b[33m`builds` directory cleaned.\n\x1b[0m')
} else {
  if (skipPack) {
    build()
  } else {
    pack()
  }
}

/**
 * Build webpack in production
 */
function pack () {
  console.log('\x1b[33mBuilding webpack in production mode...\n\x1b[0m')
  let pack = exec('npm run pack')

  pack.stdout.on('data', data => console.log(data))
  pack.stderr.on('data', data => console.error(data))
  pack.on('exit', code => {
    if (code === null || code <= 0) {
      build()
    }
  })
}

/**
 * Use electron-packager to build electron app
 */
function build () {
  let options = require('../config').building

  options.afterCopy = [
    copyBinary('gaia', binaryPath)
  ]

  console.log('\x1b[34mBuilding electron app(s)...\n\x1b[0m')
  packager(options, async (err, appPaths) => {
    if (err) {
      console.error('\x1b[31mError from `electron-packager` when building app...\x1b[0m')
      console.error(err)
    } else {
      console.log('Build(s) successful!')
      console.log(appPaths)
      console.log('\x1b[34mZipping files...\n\x1b[0m')
      await Promise.all(appPaths.map(deterministicZip))

      console.log('\n\x1b[34mDONE\n\x1b[0m')
    }
  })
}

function copyBinary (name, binaryLocation) {
  return function (buildPath, electronVersion, platform, arch, cb) {
    let binPath = join(buildPath, 'bin', name)
    if (platform === 'win32') {
      binPath = binPath + '.exe'
    }
    fs.copySync(binaryLocation, binPath)
    cb()
  }
}

function deterministicZip (folder) {
  let outFile = 'builds/cosmos/cosmos.zip'
  return new Promise((resolve, reject) => zip(folder, outFile, (err) => {
    if (err) {
      console.error('\x1b[31mError from `deterministic-zip` when zipping app...\x1b[0m')
      reject(err)
    } else {
      console.log('Zip successful!', outFile)
      resolve()
    }
  }))
}
