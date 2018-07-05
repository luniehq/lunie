"use strict"

const release = require(`../../../tasks/release`)

test(`bumpVersion`, () => {
  expect(release.bumpVersion(`0.6.1`)).toEqual(`0.6.2`)
})

test(`createNotes`, () => {
  const changeLog = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

* Configs for the gaia-6002 testnet @faboweb

### Changes

* Use persistent peers and seeds from tendermint config @faboweb

### Fixed

* Fixed bug in yarn build:gaia @zramsay

## [0.7.0] - 2018-06-13

### Changes
`

  const notes = `NOTE: DO NOT ENTER YOUR FUNDRAISER SEED. THIS SOFTWARE HAS NOT BEEN AUDITED.
NEVER ENTER YOUR FUNDRAISER SEED 12 WORDS ONTO AN ONLINE COMPUTER.

Even when we do start supporting fundraiser seeds, don't use it except for
testing or with small amounts. We will release a CLI to use for offline signing
of transactions, and we will also add hardware support for this UI.

### Added

* Configs for the gaia-6002 testnet @faboweb

### Changes

* Use persistent peers and seeds from tendermint config @faboweb

### Fixed

* Fixed bug in yarn build:gaia @zramsay
`

  expect(release.createNotes(changeLog)).toEqual(notes)
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
