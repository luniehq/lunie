"use strict"

const release = require(`../../../tasks/pullRequest`)

test(`bumpVersion`, () => {
  expect(release.bumpVersion(`0.6.1`)).toEqual(`0.6.2`)
})

test(`updateChangeLog`, () => {
  const previous = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
`

  const newVersion = `0.6.2`
  const now = new _Date(`2018-05-25`)

  const updated = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.2] - 2018-05-25

### Added
`

  expect(release.updateChangeLog(previous, newVersion, now)).toEqual(updated)
})

test(`updatePackageJson`, () => {
  const previous = {
    name: "cosmos-voyager",
    productName: "Cosmos Voyager",
    version: "0.6.1"
  }

  const newVersion = `0.6.2`

  const updated = {
    name: "cosmos-voyager",
    productName: "Cosmos Voyager",
    version: "0.6.2"
  }

  expect(release.updatePackageJson(previous, newVersion)).toEqual(updated)
})
