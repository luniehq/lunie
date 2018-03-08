# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2018-01-15
### Added
- Added a changelog @jolesbi.

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
* Improved error handling by shutting down the application when the are unhandled errors in the main thread. @faboweb

## [0.4.0] - 2018-01-31
### Added
* Added release documentation. @mappum

### Changed
* Updated app version to 0.4.0 in `package.json`
* Updated release script to use `tar-fs` instead of `tar-stream` to support symlinks. @nylira

### Removed
* Removed unused `sass-loader` node dependency. @nylira

## [0.4.0] - 2018-02-01
### Added
* Added button styles for Success, Warning, and Danger states. @nylira
* Added support for image icons. @faboweb

### Changed
* Improved primary button style. @nylira
* Fixed the cut-off text bug in buttons. @nylira
* Improves the `hover-bg` app variable color. @nylira

## [0.4.1] - 2018-02-01
###Fixed
* Fix for Windows build crashing on startup. @faboweb

## [0.4.2] - 2018-02-05
###Added
* Added back button to every page. @jolesbi

###Changed
* Updated transaction history to be more clear and descriptive. @jolesbi
* Improved delegate profile page to accommodate candidates and validators. @jolesbi

## [0.4.3] - 2018-02-05
### Changed
* Renamed Cosmos UI to Cosmos Voyager. @nylira
* Added Google Analytics for testnet versions @faboweb
* Added Sentry error reporting for testnet versions @faboweb
* Fixed reconnection issues @faboweb
* Made Windows builds deterministic @mappum
* Reduced size of OSX builds @mappum

## [0.4.4] - 2018-03-08
* Added `mvp-features.md` to documentation. @nylira
