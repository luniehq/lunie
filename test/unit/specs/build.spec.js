"use strict"

const build = require(`../../../tasks/build/build`)

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
