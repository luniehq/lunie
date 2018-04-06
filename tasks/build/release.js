"use strict"

const { cli } = require(`@nodeguy/cli`)
const config = require(`../../config`)
const { createHash } = require("crypto")
const optionsSpecification = require(`./options.json`)
const path = require("path")
const packager = require("electron-packager")
const shell = require(`shelljs`)
const fs = require("fs-extra")
var glob = require("glob")
var JSZip = require("jszip")
const zlib = require("zlib")
var tar = require("tar-stream")
var duplexer = require("duplexer")
const packageJson = require("../../package.json")

/**
 * Build webpack in production
 */
const pack = async options => {
  console.log("\x1b[33mBuilding webpack in production mode...\n\x1b[0m")
  shell.exec("npm run pack")
  build(options)
}

/**
 * Use electron-packager to build electron app
 */
function build({ platform, gaia }) {
  console.log("Using prebuilt binary", gaia)

  const options = Object.assign({}, config.building, {
    afterCopy: [copyBinary("gaia", gaia)],
    platform
  })

  console.log("\x1b[34mBuilding electron app(s)...\n\x1b[0m")
  packager(options, async (err, appPaths) => {
    if (err) {
      console.error(
        "\x1b[31mError from `electron-packager` when building app...\x1b[0m"
      )
      console.error(err)
    } else {
      console.log("Build(s) successful!")
      console.log(appPaths)
      console.log("\n\x1b[34mZipping files...\n\x1b[0m")
      await Promise.all(
        appPaths.map(async appPath => {
          copyConfig(appPath)

          if (platform === "win32") {
            await zipFolder(appPath, options.out, packageJson.version)
          } else {
            await tarFolder(appPath, options.out, packageJson.version).catch(
              err => console.error(err)
            )
          }
        })
      )

      console.log("\n\x1b[34mDONE\n\x1b[0m")
    }
  })
}

function copyBinary(name, binaryLocation) {
  return function(buildPath, electronVersion, platform, arch, cb) {
    let binPath = path.join(buildPath, "bin", name)
    if (platform === "win32") {
      binPath = binPath + ".exe"
    }
    fs.copySync(binaryLocation, binPath)
    cb()
  }
}

function copyConfig(buildFolder) {
  console.log(
    "Copying",
    path.join(__dirname, "config.toml"),
    "into",
    buildFolder
  )
  fs.copySync(path.join(__dirname, "config.toml"), buildFolder)
}

function sha256File(path) {
  let hash = createHash("sha256")
  fs.createReadStream(path).pipe(hash)
  return new Promise((resolve, reject) => {
    hash.on("data", hash => resolve(hash.toString("hex")))
  })
}

function zipFolder(inDir, outDir, version) {
  return new Promise(async (resolve, reject) => {
    let name = path.parse(inDir).name
    let outFile = path.join(outDir, `${name}_${version}.zip`)
    var zip = new JSZip()
    await new Promise(resolve => {
      glob(inDir + "/**/*", (err, files) => {
        if (err) {
          return reject(err)
        }
        files.forEach(file => {
          // make the zip deterministic by changing all file times
          if (fs.lstatSync(file).isDirectory()) {
            zip.file(path.relative(inDir, file), null, {
              dir: true,
              date: new Date("1993-06-16")
            })
          } else {
            zip.file(path.relative(inDir, file), fs.readFileSync(file), {
              date: new Date("1987-08-16")
            })
          }
        })
        resolve()
      })
    })
    zip
      .generateNodeStream({ type: "nodebuffer", streamFiles: true })
      .pipe(fs.createWriteStream(outFile))
      .on("finish", function() {
        sha256File(outFile).then(hash => {
          console.log("Zip successful!", outFile, "SHA256:", hash)
          resolve()
        })
      })
  })
}

async function tarFolder(inDir, outDir, version) {
  let name = path.parse(inDir).name
  let outFile = path.join(outDir, `${name}_${version}.tar.gz`)
  var pack = tar.pack()

  let files = glob(inDir + "/**", { sync: true })

  // add files to tar
  for (let file of files) {
    try {
      let stats = fs.lstatSync(file)

      let contents, linkname, type
      if (stats.isDirectory()) {
        continue
      } else if (stats.isSymbolicLink()) {
        linkname = fs.readlinkSync(file)
        type = "symlink"
      } else {
        contents = fs.readFileSync(file)
        type = "file"
      }
      await new Promise(resolve => {
        pack.entry(
          Object.assign({}, stats, {
            name: path.relative(inDir, file),
            type,
            linkname
          }),
          contents,
          resolve
        )
      })
    } catch (err) {
      console.error(`Couldn't pack file`, file, err)
      // skip this file
    }
  }
  pack.finalize()

  // make tar deterministic
  await new Promise(resolve => {
    pack
      .pipe(deterministicTar())
      // save tar to disc
      .pipe(zlib.createGzip())
      .pipe(fs.createWriteStream(outFile))
      .on("finish", function() {
        console.log("write finished")
        sha256File(outFile).then(hash => {
          console.log("Zip successful!", outFile, "SHA256:", hash)
          resolve()
        })
      })
  })
}

function deterministicTar() {
  var UNIXZERO = new Date(new Date().getTimezoneOffset() * -1)

  var pack = tar.pack()

  var extract = tar
    .extract()
    .on("entry", function(header, stream, cb) {
      header.mtime = header.atime = header.ctime = UNIXZERO
      header.uid = header.gid = 0

      delete header.uname
      delete header.gname

      if (header.type === "file") {
        stream.pipe(pack.entry(header, cb))
      } else {
        pack.entry(header, cb)
      }
    })
    .on("finish", function() {
      pack.finalize()
    })

  return duplexer(extract, pack)
}

cli(optionsSpecification, async options => {
  const { platform, "skip-pack": skipPack } = options

  if (platform === "clean") {
    require("del").sync(["builds/*", "!.gitkeep"])
    console.log("\x1b[33m`builds` directory cleaned.\n\x1b[0m")
  } else {
    console.log(`Building for platform "${platform}".`)

    if (skipPack) {
      console.log("Skipping packaging")
      build(options)
    } else {
      await pack(options)
    }
  }
})
