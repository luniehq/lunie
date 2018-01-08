'use strict'

const { exec } = require('child_process')
const { join } = require('path')
const fs = require('fs-extra')
const builder = require('electron-builder')

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

if (process.env.PLATFORM_TARGET === 'clean') {
  require('del').sync(['builds/*', '!.gitkeep'])
  console.log('\x1b[33m`builds` directory cleaned.\n\x1b[0m')
} else {
  if (skipPack) {
    build(process.env.PLATFORM_TARGET, process.env.PLATFORM_ARCH)
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
 * Use electron-builder to build electron app
 */
function build (platform = process.platform, arch = process.arch) {
  let config = require('../config').building

  // defined build target
  let electronPlatform = platform
  if (platform === 'win32') {
    electronPlatform = 'win'
  }
  let targets = {
    [arch]: true,
    [electronPlatform]: []
  }

  // icons need to be available in the dist folder
  copyIcons()

  config.afterPack = ({outDir, appOutDir}) => {
    binaryPath
    ? copyBinary('gaia', binaryPath, platform)({outDir, appOutDir})
    : buildGaiaBinary(platform, arch)({outDir, appOutDir})
    copyNetworks(appOutDir)
  }

  console.log('\x1b[34mBuilding electron app(s)...\n\x1b[0m')
  // Promise is returned
  return builder.build({
    ...targets,
    config
  })
    .then(() => {
      console.log('Build(s) successful!')
      console.log('\n\x1b[34mDONE\n\x1b[0m')
    })
    .catch((error) => {
      console.error('\x1b[31mError from `electron-builder` when building app...\x1b[0m')
      console.error(error)
    })
}

/*
* Build the baseserver binary. Should only be done in development!
*/
const GOARCH = {
  'x64': 'amd64',
  'ia32': '386'
}

function buildGaiaBinary (platform, arch) {
  return function ({outDir, appOutDir}) {
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
        GOOS=${platform} GOARCH=${arch} go build \
          -o /mnt/${output} \
          -ldflags '-s -w' \
          ./cmd/gaia
      "
    `
    let docker = exec(cmd)
    docker.stdout.on('data', (data) => process.stdout.write(data))
    docker.stderr.on('data', (data) => process.stderr.write(data))
    return new Promise((resolve, reject) => {
      docker.once('exit', (code) => {
        if (code !== 0) return reject(Error('Build failed'))

        let binPath = join(outDir, 'bin')
        fs.ensureDirSync(binPath)
        fs.copySync(join('/tmp', output), join(binPath, output))
        resolve()
      })
    })
  }
}

/*
* copy the baseserver binary into the app directory
*/
function copyBinary (name, binaryLocation, platform) {
  return function ({outDir, appOutDir}) {
    let binPath = join(appOutDir, 'resources/bin', name)
    if (platform === 'win32') {
      binPath = binPath + '.exe'
    }
    fs.copySync(binaryLocation, binPath)
  }
}

/*
* Electron builder copies the icons from the folder builds/resources
*/
function copyIcons () {
  console.log('Copying icons to builds/resources')
  let iconsPath = join(__dirname, '../app/icons')
  let distPath = join(__dirname, '../builds/resources')
  fs.ensureDirSync(distPath)
  fs.copyFileSync(join(iconsPath, 'icon.icns'), join(distPath, 'icon.icns'))
  fs.copyFileSync(join(iconsPath, 'icon.ico'), join(distPath, 'icon.ico'))
  fs.copySync(join(iconsPath, 'png'), join(distPath, 'png'))
}

function copyNetworks (appOutDir) {
  console.log('Copying networks to folder')
  let networksPath = join(__dirname, '../app/networks')
  let networksOutPath = join(appOutDir, 'resources/networks')
  fs.ensureDirSync(networksOutPath)
  fs.copySync(networksPath, networksOutPath)
}
