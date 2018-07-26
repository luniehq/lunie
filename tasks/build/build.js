"use strict"

const canonicalJson = require(`canonical-json`)
const stream = require(`stream`)
const util = require(`util`)
const childProcess = require(`child_process`)
const { cli } = require(`@nodeguy/cli`)
const { createHash } = require("crypto")
const fp = require(`lodash/fp`)
const zip = require(`deterministic-zip`)
const path = require("path")
const packager = util.promisify(require("electron-packager"))
const fs = require("fs-extra")
var glob = require("glob")
const zlib = require("zlib")
var tar = require("tar-stream")
var duplexer = require("duplexer")
const packageJson = require("../../package.json")

const optionsSpecification = {
  network: ["name of the default network to use"]
}

const generateAppPackageJson = packageJson =>
  Object.assign({}, fp.pick([`productName`, `version`], packageJson), {
    main: `./dist/main.js`
  })

const updateConfig = (config, { network }) =>
  config.replace(
    /default_network = ".*"/,
    `default_network = "${path.basename(network)}"`
  )

const copyGaia = (buildPath, electronVersion, platform, arch, callback) => {
  const platformPath = platform === `win32` ? `windows` : platform

  fs.copy(
    path.join(__dirname, `../../builds/Gaia/${platformPath}_amd64`),
    `${buildPath}/bin`,
    callback
  )
}

/**
 * Build webpack in production
 */
const pack = () => {
  console.log("\x1b[33mBuilding webpack in production mode...\n\x1b[0m")
  childProcess.execSync(`npm run pack`, { stdio: `inherit` })
}

const sha256 = async data => {
  const hash = createHash(`sha256`).setEncoding(`base64`)

  return data instanceof stream.Readable
    ? new Promise((resolve, reject) => {
        data
          .pipe(hash)
          .once(`data`, resolve)
          .once(`error`, reject)
      })
    : hash.update(canonicalJson(data)).digest(`base64`)
}

const zipFolder = async (inDir, outDir) => {
  const outFile = path.join(outDir, `${path.basename(inDir)}.zip`)
  await util.promisify(zip)(inDir, outFile, { cwd: inDir })
  return outFile
}

async function tarFolder(inDir, outDir) {
  let outFile = path.join(outDir, `${path.basename(inDir)}.tar.gz`)
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
      .once(`finish`, resolve)
  })

  return outFile
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

const platformNames = {
  darwin: `macOS`,
  linux: `Linux`,
  win32: `Windows`
}

// GitHub doesn't allow spaces in release asset names.  :-(
const sanitizeAssetName = name => name.replace(` `, `_`)

// Choose better names than Electron Packager does for the application paths.
const packagerWrapper = async ({ productName, version }, options) => {
  const source = (await packager(options))[0]

  const destination = sanitizeAssetName(
    `${productName}-v${version}-${platformNames[options.platform]}`
  )

  await fs.move(source, destination, {
    overwrite: true
  })

  return destination
}

/**
 * Use electron-packager to build electron app
 */
const build = async platform => {
  // electron-packager options
  // Docs: https://simulatedgreg.gitbooks.io/electron-vue/content/docs/building_your_app.html
  const options = {
    afterCopy: [copyGaia],
    arch: "x64",
    asar: false,
    dir: path.join(__dirname, "../../app"),
    icon: path.join(__dirname, "../../app/icons/icon"),
    ignore: /^\/(src|index\.ejs|icons)/,
    out: path.join(__dirname, "../../builds/Voyager"),
    overwrite: true,
    packageManager: "yarn",
    platform
  }

  console.log(
    `\x1b[34mBuilding electron app(s) for platform ${platform}...\n\x1b[0m`
  )

  const appPath = await packagerWrapper(packageJson, options)
  console.log("Build(s) successful!")
  console.log(appPath)
  console.log("\n\x1b[34mArchiving files...\n\x1b[0m")

  const outFile = await (platform === `linux` ? tarFolder : zipFolder)(
    appPath,
    options.out
  )

  const hash = await sha256(fs.createReadStream(outFile))
  console.log("Archive successful!", outFile, "SHA256:", hash)
  console.log("\n\x1b[34mDONE\n\x1b[0m")
  return hash
}

const summary = async ({
  buildHashes,
  end,
  gaiaVersionHash,
  options,
  start
}) => {
  const inputsHash = await sha256([gaiaVersionHash, options])
  const outputsHash = await sha256(buildHashes)
  const duration = end - start
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  return `inputs hash: ${inputsHash}
outputs hash: ${outputsHash}
build time: ${minutes}:${seconds % 60}`
}

const buildAllPlatforms = async (options = {}) => {
  const start = new Date()
  console.log("--- Building all platforms ---")

  const gaiaVersionHash = await sha256(
    fs.createReadStream(path.join(__dirname, `Gaia/COMMIT.sh`))
  )

  // Generate package.json for the app directory.
  fs.writeFileSync(
    path.join(__dirname, `../../app/package.json`),
    JSON.stringify(generateAppPackageJson(packageJson))
  )

  pack()
  const buildHashes = await Promise.all([`darwin`, `linux`, `win32`].map(build))
  const end = new Date()

  console.log(
    await summary({ buildHashes, end, gaiaVersionHash, options, start })
  )
}

const main = () =>
  cli(optionsSpecification, async options => {
    // Rewrite config file.
    const configFile = path.join(__dirname, `../../app`, `config.toml`)
    const config = fs.readFileSync(configFile, { encoding: `utf8` })
    fs.writeFileSync(configFile, updateConfig(config, options))

    buildAllPlatforms(options)
  })

if (require.main === module) {
  main()
} else {
  module.exports = {
    buildAllPlatforms,
    generateAppPackageJson,
    sanitizeAssetName,
    sha256,
    summary,
    updateConfig
  }
}
