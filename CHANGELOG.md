# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!-- SIMSALA --> <!-- DON'T DELETE, used for automatic changelog updates -->

## [1.0.2] - 2019-07-19

### Repository

- Fixed unpredictable build by not updating submodule on init @faboweb

## [1.0.1] - 2019-07-18

### Added

- [#15](https://github.com/cosmos/lunie/issues/15) Adds e2e tests @thebkr7
- [#30](https://github.com/cosmos/lunie/issues/30) Fetch and display monikers in extension @thebkr7
- [#54](https://github.com/cosmos/lunie/pull/54) Transaction succecss screen @colw
- [#55](https://github.com/cosmos/lunie/pull/55) Inform user password is incorrect if rejected by extension @colw
- [#17](https://github.com/cosmos/lunie/issues/17) Working communication with Lunie website @faboweb
- [#10](https://github.com/cosmos/lunie/issues/10) Show list of accounts @thebkr7
- Whitelist receiving messages to come from Lunie.io @faboweb

### Changed

- [#43](https://github.com/cosmos/lunie/pull/43) Set accounts using mutation @colw
- [#43](https://github.com/cosmos/lunie/pull/43) Use guards to usher user to correct view @colw
- [#39](https://github.com/cosmos/lunie/pull/39) Return true for async behaviour in message handling @colw
- Remove pending sign requests if a tab closes or changes the URL @faboweb
- [#18](https://github.com/cosmos/lunie/issues/18) new user flow @jbibla

### Fixed

- e2e tests now failing CI trying to update npm scripts @thebkr7
- [#53](https://github.com/cosmos/lunie/pull/53) Guard accounts route with proper check @colw
- Contentscript was not loaded on live Lunie @faboweb
- [#64](https://github.com/cosmos/lunie/issues/64) Fix failures if the popup opens and closes (due to async response handling) @faboweb
- [#62](https://github.com/cosmos/lunie/pull/62) Sent was showing as received @faboweb
- [#50](https://github.com/cosmos/lunie/pull/50) Forward the approved route to welcome as it doesn't exist @faboweb
- using an svg logo that doesn't include a reference to a font that needs to be imported @jbibla

### Security

- Remove localhost as allowed target for content script in production @faboweb

### Repository

- [#35](https://github.com/cosmos/lunie/pull/35) Style and linting rules @colw
- [#35](https://github.com/cosmos/lunie/pull/35) Upgrade dependencies @colw
- [#23](https://github.com/cosmos/lunie/pull/23) Added JS and style linting @faboweb
- [#23](https://github.com/cosmos/lunie/pull/23) Added CircleCI configuration @faboweb
- [#63](https://github.com/cosmos/lunie/issues/63) Automatic releases @faboweb