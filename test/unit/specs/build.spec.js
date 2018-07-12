"use strict"

const build = require(`../../../tasks/build/build`)
const stream = require(`stream`)

test(`generateAppPackageJson`, () => {
  const packageJson = {
    name: "cosmos-voyager",
    productName: "Cosmos Voyager",
    version: "0.7.1"
  }

  expect(build.generateAppPackageJson(packageJson)).toEqual({
    main: "./dist/main.js",
    productName: "Cosmos Voyager",
    version: "0.7.1"
  })
})

test(`sanitizeAssetName`, () => {
  expect(build.sanitizeAssetName(`Cosmos Voyager-v0.7.1-Linux`)).toEqual(
    `Cosmos_Voyager-v0.7.1-Linux`
  )
})

test(`updateConfig`, () => {
  const config = `relay_port_prod = 9061

default_network = "gaia-6002"

google_analytics_uid = "UA-51029217-3"
`

  const updatedConfig = `relay_port_prod = 9061

default_network = "gaia-7000"

google_analytics_uid = "UA-51029217-3"
`

  expect(
    build.updateConfig(config, { network: `app/networks/gaia-7000` })
  ).toEqual(updatedConfig)
})

test(`sha256 string`, async () => {
  expect(await build.sha256(`foobar`)).toEqual(
    `ph3q7ybAaeMr2jiJkc8fB/Cm3UUbxqe9rT407su62zk=`
  )
})

test(`sha256 stream`, async () => {
  const readable = new stream.Readable()
  readable._read = () => {}
  readable.push(`data`)
  readable.push(null)

  expect(await build.sha256(readable)).toEqual(
    `Om6weQ85rIfJTzhWst0sXREOaBFgImGpqSPTuyOt`
  )
})

test(`summary`, async () => {
  expect(
    await build.summary({
      buildHashes: [0, 1, 2],
      end: new _Date(90 * 1000),
      gaiaVersionHash: `gaia`,
      options: { commit: `HEAD`, network: `gaia-6002` },
      start: new _Date(0)
    })
  ).toEqual(
    `inputs hash: Uzl9WQFRK/a7RfAyDFTp91F4AWw2x++DeGUuNxpXWwc=
outputs hash: Q0AmvZj/LYovs0bImuneAG0eKmhigytrPNhuUd421cU=
build time: 1:30`
  )
})
