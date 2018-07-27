# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

* Added reload button to transaction history page @faboweb
* added page views for google analytics @faboweb

### Changed

* Showing uniq transactions by their hash in history @faboweb
* Extracted components into @tendermint/ui for use in explorer @okwme
* using new old testnet repo for getting genesis files @faboweb
* switched to Gaia-7003 @faboweb
* Message for empty accounts @faboweb

### Fixed

* fixed block explorer always showing "syncing" @faboweb
* fixed not pushing to master (caused by me ;P) @faboweb
* Publish script now builds release artifacts. @NodeGuy
* fixed tx subscription @faboweb
* fixed hanging if initial nodes are offline @faboweb

### Added

* staking e2e tests @faboweb

## [0.8.2] - 2018-07-23

### Fixed

* fixed release process and documentation @faboweb
* Showing weird characters @faboweb

## [0.8.1] - 2018-07-23

### Added

* Indicate if a validator has been revoked in the Staking UI @mappum
* Information about current connection attempts @faboweb
* Release published on GitHub now including changes from CHANGELOG. @NodeGuy
* Added ESLint errors: no-undef and no-unused-vars. @NodeGuy
* Modal when a node doesn't signal any new blocks @faboweb
* Checking the SDK version of the node Voyager connects to against an expected SDK version for the network @faboweb
* Added post checkout yarn @okwme

### Changed

* Copy the network configuration only during local builds. @NodeGuy
* Ignoring the potential local-testnet folder that is used in the README for local testnets @faboweb
* Moved the changelog check to a GitHub status check @faboweb
* Moved to SDK v0.21.1 @faboweb
* Using vue-jest for transpiling in tests for better code coverage output @faboweb
* Default to gaia-7001 @okwme
* Changed `yarn testnet` to `yarn start` @okwme
* Updated colors throughout @jolesbi

### Fixed

* Voyager hanging after reloading in development mode @faboweb
* Bad Boy Back Button Back @okwme
* Unable to bond just to already bonded candidates @faboweb
* Staking tokens showing NaN @faboweb
* Staking page showing old shares after bonding @faboweb
* Made linting work on Windows. @NodeGuy
* Renamed some ni- class identifiers to tm- to be consistent @faboweb
* Fixed the theme switcher @faboweb
* Fixed various building bugs. @NodeGuy
* Development CLI tools handle exceptions better. @NodeGuy

## [0.7.1] - 2018-07-04

### Added

* Configs for the gaia-6002 testnet @faboweb
* Bot which returns money to sender in mock mode @mappum
* Introduced addressbook to store found peers and to select nodes round robin @faboweb
* Tutorial how to start a local node @faboweb
* Added versions to Preference Page @okwme
* Send confirmation popup @faboweb
* Checking known nodes round robin and signaling an error if none are available @faboweb
* Help menu with links to report a bug or view the log @faboweb
* build duration and input/output hashes to build process @NodeGuy

### Changed

* Use persistent peers and seeds from tendermint config @faboweb
* Updated loading icon and loading states @jolesbi
* more components moved to `@tendermint/ui` @okwme
* Removed COSMOS_MOCKED flag @faboweb
* Improved readability and accessibility @jolesbi
* Significant style and UI updates for dark and light themes @jolesbi
* Doesn't show loading screen when validators are still stored @okwme
* Improved CI @faboweb
* Search bar fixed to top @okwme
* Hide block subscription errors @mappum
* Fixed css editing in devtools @faboweb
* Added history and disabled backbutton on no history @okwme
* Network configuration files are now taken from the SDK repo. @NodeGuy

### Fixed

* Fixed bug in yarn build:gaia @zramsay
* Increased version of localtestnet used for testing to match gaia @faboweb
* Fixed padding issue in main container @faboweb
* Unit tests work with new components @okwme
* Wait for LCD to start serving at app startup to prevent timing errors @mappum
* Fixed white flash on startup @okwme
* Fixed critical dependency warning @okwme
* Fixed theme bg bug @okwme
* Fixed sorting bug on staking page @okwme
* "About Cosmos Voyager" menu item is now responsive on Windows and Linux @mappum
* Fixed preference page style bug @okwme
* Fixed missing node-ip in connection indicator @faboweb
* Launch sequence for dev improved @okwme
* E2E test maybe fix @okwme
* Login in to restricted page bug @okwme
* Send with an empty wallet bug @okwme
* Readme formatting @okwme

## [0.7.0] - 2018-06-13

### Changes

* Disabled error reporting in development @faboweb
* Removed ci files from code coverage as they are badly testable @faboweb
* Update genesis.json when conflicts are detected @jolesbi
* Hide IBC as it will not be ready for launch @faboweb
* Updated e2e tests to not rely on flags to run @okwme
* Not shrinking stacktrace anymore @faboweb
* Improved the visibility and readability of the current network connection. @nylira
* Updated electron to v2.0.2 @okwme
* The release builds now have more sensible names. @NodeGuy
* Transactions use the account number to prevent attacks @faboweb
* Building Voyager now builds Gaia if not found @NodeGuy

### Added

* Bech32 address validation @okwme
* Notification for dev error collection toggle behavior @okwme
* Added automatic releases @faboweb @NodeGuy
* Added staking functionality! @mappum
* Export all testing config on CI @faboweb

### Fixed

* Blocks not updating in block explorer when switching network @faboweb
* Fixed minor typo in README.md @nylira
* Tx bug where state wasn't updated @okwme
* Persisting e2e failure screenshots as artifact on circleci @faboweb
* Theme switching bug @okwme
* Electron dev tool version bug @okwme
* Update delegations also in the wallet view @faboweb
* The release builds forgot to include the network configuration. @NodeGuy
* Skip changelog update check on release branches @faboweb

## [0.6.2] - 2018-05-23

### Added

* Added linting check and unit tests to the git prepush hook @faboweb
* Added basic validation for wallet send @okwme
* Added COSMOS_MOCKED env variable to allow overwriting mocked mode from the command line @faboweb
* User will now be logged out if switching between mocked and live connector @faboweb
* recovery seed form validation & tests @okwme
* added tx view to block explorer @okwme

### Changed

* Simplify pull request and issue templates. @nylira
* Add CONTRIBUTING.md with contributing tips. @nylira
* Build process now builds for all three platforms at the same time. @NodeGuy
* The config.toml is now mocked to guarantee consistent unit tests @faboweb
* The binary is now accepted if it has the same minor version instead of the path version. @faboweb
* Hid staking button on wallet page @jolesbi
* Increment version in package.json @jolesbi
* Profile page now settings with forked ni-vue-field @okwme @nylira
* Added proper voyager logo to readme @jolesbi
* Made search consistent @okwme
* Change gaia-2 to gaia-5001 in readme @jolesbi
* Improved readme with better prerequisite instructions @nylira

### Fixes

* Error messages from main thread are now displayed correctly in the view @faboweb

### Fixed

* Re-enabled staking and transactions pages for mocked network. @nylira
* Revealed the password for the default account on the mocked network. @nylira
* Fixed not being able to reconnect to a live network if started in mocked mode. @faboweb

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
