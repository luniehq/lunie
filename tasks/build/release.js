"use strict"

const { cli } = require(`@nodeguy/cli`)
const { createHash } = require("crypto")
const zip = require(`deterministic-zip`)
const optionsSpecification = require(`./optionsSpecification.json`)
const path = require("path")
const packager = require("electron-packager")
const shell = require(`shelljs`)
const fs = require("fs-extra")
var glob = require("glob")
const zlib = require("zlib")
var tar = require("tar-stream")
var duplexer = require("duplexer")
const packageJson = require("../../package.json")
const util = require(`util`)

const rewriteConfig = ({ network }) => {
  const file = path.join(__dirname, `../../app`, `config.toml`)
  const config = fs.readFileSync(file, { encoding: `utf8` })
  const networkName = path.basename(network)

  const newConfig = config.replace(
    /default_network = ".*"/,
    `default_network = "${networkName}"`
  )

  console.log(`Changed default network to "${networkName}".`)
  fs.writeFileSync(file, newConfig)
}

// electron-packager options
// Docs: https://simulatedgreg.gitbooks.io/electron-vue/content/docs/building_your_app.html
const building = {
  arch: "x64",
  asar: false,
  dir: path.join(__dirname, "../../app"),
  icon: path.join(__dirname, "../../app/icons/icon"),
  ignore: /^\/(src|index\.ejs|icons)/,
  out: path.join(__dirname, "../../builds"),
  overwrite: true,
  packageManager: "yarn"
}

/**
 * Use electron-packager to build electron app
 */
function build({ platform, gaia }) {
  console.log("Using prebuilt binary", gaia)

  const options = Object.assign({}, building, {
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

/**
 * Build webpack in production
 */
const pack = () => {
  console.log("\x1b[33mBuilding webpack in production mode...\n\x1b[0m")
  shell.exec("npm run pack")
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

function sha256File(path) {
  let hash = createHash("sha256")
  fs.createReadStream(path).pipe(hash)
  return new Promise((resolve, reject) => {
    hash.on("data", hash => resolve(hash.toString("hex")))
  })
}

const zipFolder = async (inDir, outDir, version) => {
  const { name } = path.parse(inDir)
  const outFile = path.join(outDir, `${name}_${version}.zip`)
  await util.promisify(zip)(inDir, outFile, { cwd: inDir })
  const hash = await sha256File(outFile)
  console.log("Zip successful!", outFile, "SHA256:", hash)
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

cli(optionsSpecification, options => {
  const { network, platform, "skip-pack": skipPack } = options

  if (platform === "clean") {
    require("del").sync(["builds/*", "!.gitkeep"])
    console.log("\x1b[33m`builds` directory cleaned.\n\x1b[0m")
  } else {
    console.log(`Building for platform "${platform}".`)
    rewriteConfig(options)
    shell.cp(`-r`, `/mnt/network`, `app/networks/${path.basename(network)}`)

    if (skipPack) {
      console.log("Skipping packaging")
    } else {
      pack()
    }

    build(options)
  }
})
