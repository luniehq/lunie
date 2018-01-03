'use strict'

const { exec } = require('child_process')
const { join } = require('path')
const packager = require('electron-packager')
const rebuild = require('electron-rebuild').default
const mkdirp = require('mkdirp').sync
const fs = require('fs-extra')
const { promisify } = require('util')

let skipPack = false
let binaryPath = null
process.argv.forEach(function (val) {
  if (val === '--skip-pack') {
    console.log('Skipping packaging')
    skipPack = true
  }
  if (val.startsWith('--binary')) {
    binaryPath = val.replace('--binary=', '')
    console.log('Using build binary', binaryPath)
  }
})

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
    binaryPath
      ? copyBinary('gaia', binaryPath)
      : buildGaiaBinary()
  ]
  // prune installs the packages
  options.afterPrune = [
    // we need to rebuild some native packages for the electron environment
    function rebuildNodeModules (buildPath, electronVersion, platform, arch, callback) {
      rebuild({ buildPath, electronVersion, arch })
        .then(callback)
        .catch(callback)
    }
  ]

  console.log('\x1b[34mBuilding electron app(s)...\n\x1b[0m')
  packager(options, (err, appPaths) => {
    if (err) {
      console.error('\x1b[31mError from `electron-packager` when building app...\x1b[0m')
      console.error(err)
    } else {
      console.log('Build(s) successful!')
      console.log(appPaths)

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

const GOARCH = {
  'x64': 'amd64',
  'ia32': '386'
}

function buildGaiaBinary () {
  return function (buildPath, electronVersion, platform, arch, cb) {
    if (platform === 'win32') platform = 'windows'
    if (platform === 'mas') platform = 'darwin'
    if (GOARCH[arch]) arch = GOARCH[arch]

    console.log(`\x1b[34mBuilding gaia binary (${platform}/${arch})...\n\x1b[0m`)

    let output = 'gaia'
    if (platform === 'windows') output += '.exe'

    let cmd = `
      docker run -v "/tmp:/mnt" golang bash -c "
        go get github.com/cosmos/gaia;
        cd /go/src/github.com/cosmos/gaia && \
        git checkout develop && \
        make get_vendor_deps && \
        GOOS=darwin GOARCH=amd64 go build \
          -o /mnt/${output} \
          -ldflags '-s -w' \
          ./cmd/gaia
      "
    `
    let docker = exec(cmd)
    docker.stdout.on('data', (data) => process.stdout.write(data))
    docker.stderr.on('data', (data) => process.stderr.write(data))
    docker.once('exit', (code) => {
      if (code !== 0) return cb(Error('Build failed'))

      let binPath = join(buildPath, 'bin')
      mkdirp(binPath)
      fs.copy(join('/tmp', output), join(binPath, output), cb)
    })
  }
}
