'use strict'

const { exec } = require('child_process')
const path = require('path')
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
    : goBuild(`github.com/cosmos/gaia/cmd/gaia`, platform, arch)({outDir, appOutDir})
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
      console.error('\x1b[31mError from `electron-packager` when building app...\x1b[0m')
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
function goBuild (pkg, platform, arch) {
  return function ({outDir, appOutDir}) {
    if (platform === 'win32') platform = 'windows'
    if (platform === 'mas') platform = 'darwin'
    if (GOARCH[arch]) arch = GOARCH[arch]

    console.log(`\x1b[34mBuilding gaia binary (${platform}/${arch})...\n\x1b[0m`)

    let binaryDir = path.join(appOutDir, 'resources/bin')
    fs.ensureDirSync(binaryDir)
    let binPath = path.join(binaryDir, name)
    if (platform === 'windows') {
      binPath = binPath + '.exe'
    }
    let cmd = `cross-env GOOS=${platform} GOARCH=${arch} go build -o ${binPath} ${pkg}`
    console.log(`> ${cmd}\n`)
    let go = exec(cmd)

    go.stdout.on('data', (data) => process.stdout.write(data))
    go.stderr.on('data', (data) => process.stderr.write(data))
    return new Promise((resolve, reject) => {
      go.once('exit', (code) => {
        if (code !== 0) return reject(Error('Build failed'))
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
    let binPath = path.join(appOutDir, 'resources/bin', name)
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
  let iconsPath = path.join(__dirname, '../app/icons')
  let distPath = path.join(__dirname, '../builds/resources')
  fs.ensureDirSync(distPath)
  fs.copyFileSync(path.join(iconsPath, 'icon.icns'), path.join(distPath, 'icon.icns'))
  fs.copyFileSync(path.join(iconsPath, 'icon.ico'), path.join(distPath, 'icon.ico'))
  fs.copySync(path.join(iconsPath, 'png'), path.join(distPath, 'png'))
}

function copyNetworks (appOutDir) {
  console.log('Copying networks to folder')
  let networksPath = path.join(__dirname, '../app/networks')
  let networksOutPath = path.join(appOutDir, 'resources/networks')
  fs.ensureDirSync(networksOutPath)
  fs.copySync(networksPath, networksOutPath)
}
