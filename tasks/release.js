'use strict'

const { exec } = require('child_process')
const { createHash } = require('crypto')
const path = require('path')
const packager = require('electron-packager')
const fs = require('fs-extra')
var glob = require('glob')
var JSZip = require('jszip')
const zlib = require('zlib')
var tar = require('tar-stream')
var duplexer = require('duplexer')
const packageJson = require('../package.json')

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
    build(process.env.PLATFORM_TARGET)
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
      build(process.env.PLATFORM_TARGET)
    }
  })
}

/**
 * Use electron-packager to build electron app
 */
function build (platform) {
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
      console.log('\n\x1b[34mZipping files...\n\x1b[0m')
      await Promise.all(appPaths.map(async appPath => {
        if (platform === 'win32') {
          await zipFolder(appPath, options.out, packageJson.version)
        } else {
          await tarFolder(appPath, options.out, packageJson.version)
          .catch(err => console.error(err))
        }
      }))

      console.log('\n\x1b[34mDONE\n\x1b[0m')
    }
  })
}

function copyBinary (name, binaryLocation) {
  return function (buildPath, electronVersion, platform, arch, cb) {
    let binPath = path.join(buildPath, 'bin', name)
    if (platform === 'win32') {
      binPath = binPath + '.exe'
    }
    fs.copySync(binaryLocation, binPath)
    cb()
  }
}

function sha256File (path) {
  let hash = createHash('sha256')
  fs.createReadStream(path).pipe(hash)
  return new Promise((resolve, reject) => {
    hash.on('data', (hash) =>
      resolve(hash.toString('hex')))
  })
}

function zipFolder (inDir, outDir, version) {
  return new Promise(async (resolve, reject) => {
    let name = path.parse(inDir).name
    let outFile = path.join(outDir, `${name}_${version}.zip`)
    var zip = new JSZip()
    await new Promise((resolve) => {
      glob(inDir + '/**/*', (err, files) => {
        if (err) {
          return reject(err)
        }
        files
        .filter(file => !fs.lstatSync(file).isDirectory())
        .forEach(file => {
          zip.file(path.relative(inDir, file), fs.readFileSync(file), {date: new Date('1987-08-16')}) // make the zip deterministic by changing all file times
        })
        resolve()
      })
    })
    zip.generateNodeStream({type: 'nodebuffer', streamFiles: true})
    .pipe(fs.createWriteStream(outFile))
    .on('finish', function () {
      sha256File(outFile).then((hash) => {
        console.log('Zip successful!', outFile, 'SHA256:', hash)
        resolve()
      })
    })
  })
}

function tarFolder (inDir, outDir, version) {
  return new Promise(async (resolve, reject) => {
    let name = path.parse(inDir).name
    let outFile = path.join(outDir, `${name}_${version}.tar.gz`)
    var pack = tar.pack()

    await new Promise((resolve) => {
      glob(inDir + '/**/*', (err, files) => {
        if (err) {
          return reject(err)
        }
        // add files to tar
        files
        .filter(file => !fs.lstatSync(file).isDirectory())
        .forEach(file => {
          try {
            pack.entry({ name: path.relative(inDir, file) }, fs.readFileSync(file))
          } catch (err) {
            console.error(`Couldn't pack file`, file, err)
            // skip this file
          }
        })
        pack.finalize()
        resolve()
      })
    })

    // make tar deterministic
    pack
    .pipe(deterministicTar())
    // save tar to disc
    .pipe(zlib.createGzip())
    .pipe(fs.createWriteStream(outFile))
    .on('finish', function () {
      console.log('write finished')
      sha256File(outFile).then((hash) => {
        console.log('Zip successful!', outFile, 'SHA256:', hash)
        resolve()
      })
    })
  })
}

function deterministicTar () {
  var UNIXZERO = new Date(new Date().getTimezoneOffset() * -1)

  var pack = tar.pack()

  var extract =
    tar.extract()
      .on('entry', function (header, stream, cb) {
        if (header.type !== 'file') return cb()

        header.mtime = header.atime = header.ctime = UNIXZERO
        header.uid = header.gid = 0

        delete header.uname
        delete header.gname

        header.mode = 0o777

        stream.pipe(pack.entry(header, cb))
      })
      .on('finish', function () {
        pack.finalize()
      })

  return duplexer(extract, pack)
}
