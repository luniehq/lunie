"use strict"

const release = require(`../../../ci/release`)

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

describe(`release process`, () => {
  jest.doMock("simple-git", () => {
    let git = () => git
    git.addConfig = () => git
    git.addRemote = () => git
    git.commit = () => git
    git.tag = () => git
    git.raw = () => git

    return git
  })
  jest.doMock("publish-release", () => (...args) => {
    const cb = args[args.length - 1]
    cb(null, true)
  })
  jest.doMock("child_process", () => ({ execSync: () => {} }))
  jest.doMock("fs")
  jest.resetModules()
  let release = require(`../../../ci/release`)

  it("should release on master", done => {
    release
      .releaseProcess(
        "master",
        "",
        { version: "0.0.1" },
        { SDK_COMMIT: "abc" },
        {}
      )
      .then(released => {
        expect(released).toBe(true)
        done()
      }, done.fail)
  })

  it("should not release if not on master", done => {
    release
      .releaseProcess(
        "develop",
        "",
        { version: "0.0.1" },
        { SDK_COMMIT: "abc" },
        {}
      )
      .then(released => {
        expect(released).toBe(false)
        done()
      }, done.fail)
  })
})
