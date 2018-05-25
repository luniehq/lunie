# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

* Added linting check and unit tests to the git prepush hook @faboweb
* Added basic validation for wallet send @okwme
* Added COSMOS_MOCKED env variable to allow overwriting mocked mode from the command line @faboweb

### Changed

* Simplify pull request and issue templates. @nylira
* Add CONTRIBUTING.md with contributing tips. @nylira
* Build process now builds for all three platforms at the same time. @NodeGuy

## [0.6.1] - 2018-05-22

### Changed

* Removed some defaults when building a release to reduce confusion. @NodeGuy
* CircleCI no times out after 5 mins to free workers from bad runs. @faboweb
* Fixed a bug where errors that occurred while sending a transaction would prevent further sends from succeeding. @mappum

### Fixed

* Reconnection when coming back from mocked connection works again @faboweb
* Fixed accounts not available after switching back from a mocked connection. @faboweb

## [0.6.0]

### Added

* Added a toggle to switch between a mocked blockchain connector and the live connector @faboweb
* A check for updating the changelog (also pre-push) @faboweb
* Added automatic Prettier formatting on commits @faboweb
* The build process now builds the Cosmos SDK from source code. @NodeGuy

### Changed

* Upgraded many dependencies. @NodeGuy
* Upgraded to new SDK. @mappum
* Improved design of light theme. @nylira
* Improved design on Windows. @nylira
* Disabled the changelog check on develop @faboweb

### Fixed

* Windows build now compresses `zip` file. @NodeGuy
* Fixed block explorer @faboweb
* An error showing after a reconnect @faboweb
* Fixed onboarding window appearing everytime @faboweb

## [0.5.0]

### Added

* The following file types are now formatted with [Prettier](https://prettier.io/): css, js, json, vue.
* Staked tokens are now shown on the wallet page.

### Changed

* If app crashes, a full page error is shown @faboweb
* New Voyager logo @nylira
* The application is now built in a Docker container for increased reproducibility.

## [0.4.4] - 2018-03-08

### Added

* Added `mvp-features.md` to documentation. @nylira
* Added full page error @nylira
* Added receive button and receive modal @jolesbi
* The validator hash now has to be approved by the user for security @faboweb
* Transitioned to Docker for easier cross platform builds. @NodeGuy
* New light theme for day time Voyaging 😎 🚀 @nylira
* Users can now opt in or out of remote error collection. @faboweb
* Ability to send over IBC @mappum

### Changed

* The primary staking token is now set in configuration - Fermion during development, Atom for launch.

## [0.4.3] - 2018-02-05

### Changed

* Renamed Cosmos UI to Cosmos Voyager. @nylira
* Added Google Analytics for testnet versions @faboweb
* Added Sentry error reporting for testnet versions @faboweb
* Fixed reconnection issues @faboweb
* Made Windows builds deterministic @mappum
* Reduced size of OSX builds @mappum

## [0.4.2] - 2018-02-05

### Added

* Added back button to every page. @jolesbi

### Changed

* Updated transaction history to be more clear and descriptive. @jolesbi
* Improved delegate profile page to accommodate candidates and validators. @jolesbi

## [0.4.1] - 2018-02-01

### Fixed

* Fix for Windows build crashing on startup. @faboweb

## [0.4.0] - 2018-02-01

### Added

* Added button styles for Success, Warning, and Danger states. @nylira
* Added support for image icons. @faboweb
* Added release documentation. @mappum

### Changed

* Improved primary button style. @nylira
* Fixed the cut-off text bug in buttons. @nylira
* Improves the `hover-bg` app variable color. @nylira
* Updated release script to use `tar-fs` instead of `tar-stream` to support symlinks. @nylira

### Removed

* Removed unused `sass-loader` node dependency. @nylira

## [0.3.1] - 2018-01-30

### Added

* Check to ensure gaia version is correct for the current network @mappum

### Changed

* Added a callback and console output when Vue app has finished loading to test build apps on successful startup. @faboweb
* Resolved notifications error on NiSessionLoading.vue. @nylira
* Resolved old saved prevAccountKey being used in NiSessionSignIn.vue. @nylira
* Improved performance of amountBonded in LiDelegate.vue./ @nylira
* Prevented user from going to PageBond if they don't have any atoms. @nylira
* Hid the bonding interface on PageDelegates if the user doesn't have any atoms. @nylira
* Improved error handling by shutting down the application when there are unhandled errors in the main thread. @faboweb

## [0.3.0] - 2018-01-15

### Added

* Added a changelog @jolesbi.
