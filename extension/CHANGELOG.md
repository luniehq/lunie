# Changelog
 
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!-- SIMSALA --> <!-- DON'T DELETE, used for automatic changelog updates -->

## [1.0.23] - 2020-06-09

### Fixed

- [#263](https://github.com/cosmos/lunie/issues/263) Handles incorrect password correctly @Bitcoinera

### Repository

- Adjust GitHub Actions for extension @faboweb
- Remove lock files to avoid dependency issues @faboweb

## [1.0.22] - 2020-06-03

### Fixed

- [#268](https://github.com/cosmos/lunie/pull/268) Fixes the publish script (I hope) @Bitcoinera
- Fixed balances not upating in ActionModal @faboweb
- Cache bust dependencies in CircleCI config @faboweb
- Fees where not displaying correctly for Polkadot @faboweb
- Upgrade dependencies to fix build @faboweb

## [1.0.21] - 2020-05-29

### Added

- [#266](https://github.com/cosmos/lunie/pull/266) Adds Dependabot config for weekly updates only @Bitcoinera

### Changed

- [#215](https://github.com/cosmos/lunie/pull/215) Adds loader to SessionApprove @Bitcoinera

### Fixed

- [#177](https://github.com/cosmos/lunie/issues/177) Fixes denom in fees for ClaimRewards not appearing @Bitcoinera
- Fix claim transaction not displaying @faboweb
- Fix publishing to master @faboweb

### Security

- [#219](https://github.com/cosmos/lunie/pull/219) Resolves all dependencies vulnerabilities alerts @Bitcoinera

### Code Improvements

- [#264](https://github.com/cosmos/lunie/pull/264) Refactor using the fees that come straight from the API @Bitcoinera

## [1.0.20] - 2020-05-11

### Changed

- [#216](https://github.com/cosmos/lunie/pull/216) Displays also Kusama fees @Bitcoinera

## [1.0.19] - 2020-05-08

### Changed

- [#206](https://github.com/cosmos/lunie/pull/206) Change the submodule hash to an existing one @Bitcoinera

### Fixed

- [#212](https://github.com/cosmos/lunie/pull/212) Fixes addresses being unreadable when imported because of dark color @Bitcoinera
- Fixes sign approval @faboweb
- Fixes Polkadot signing by allowing unsafe-eval @faboweb
- proper theme colours were missing from approve screen @jbibla

### Security

- Move WASM execution into sandboxed script @faboweb

## [1.0.18] - 2020-05-01

### Added

- [#191](https://github.com/cosmos/lunie/pull/191) Allows Polkadot account creation and restore @Bitcoinera
- Ability to sign with Polkadot @faboweb
- added theme changes for new extension theme @jbibla

### Changed

- [#191](https://github.com/cosmos/lunie/pull/191) Refactor createKey in actions to not depend on store. Create wallet.js for the refactor @Bitcoinera
- [#184](https://github.com/cosmos/lunie/pull/184) Changes submodule for a Lunie version where  ClaimRewardsTxDetails doesn't open inside extension @Bitcoinera
- Adjust allowed pages to new Netlify link schema @faboweb
- Change title of extension @faboweb
- minor style updates, changes to route names @jbibla

### Fixed

- [#188](https://github.com/cosmos/lunie/issues/188) Fixes the deposit transactions parser @Bitcoinera
- Fix session approve styling @faboweb

### Deprecated

- Removed need to set extension environment variable @faboweb

## [1.0.17] - 2020-03-22

### Changed

- preload network capabilities @iambeone

### Fixed

- fixing redirect path after account creation in extension @iambeone
- Parse transactions in new transaction format @faboweb

## [1.0.16] - 2020-03-05

### Added

- sign queue length request added @iambeone

### Repository

- updated circleci publish step @iambeone

## [1.0.15] - 2020-02-28

### Changed

- add a retry if no messages recieved from fe @iambeone

### Code Improvements

- Remove e2e tests for now @faboweb

### Repository

- Added build variables to circle ci script @faboweb

## [1.0.14] - 2020-02-27

### Added

- [#3513](https://github.com/cosmos/lunie/issues/3513) removing signin request in extension on cancel @iambeone

### Changed

- defer contentScript execution to page load @iambeone
- [#148](https://github.com/cosmos/lunie/pull/148) Adds script at building start to check if LUNIE_API is set @Bitcoinera
- Updated keys lib to support network selection @faboweb

### Fixed

- withdraw fix @iambeone
- Replace generating avatars with a standard image to remove unsafe code @faboweb

### Repository

- pr alert added @iambeone
- Fix unsafe-eval being used in development @faboweb
- Added release note to readme @faboweb

## [1.0.11] - 2020-02-04 

### Added

- [#139](https://github.com/cosmos/lunie/issues/139) Sign-in from extension in one click @iambeone

### Changed

- change cosmos-keys package version @iambeone
- getting network by address prefix if no network provided @iambeone
- [#136](https://github.com/cosmos/lunie/pull/136) Adds a getter called connected that always returns true. This is to hack the loading circle in the select network component @Bitcoinera

### Fixed

- Fix validator name in sign transaction step @iambeone
- Use ID of network for network signin @faboweb

## [1.0.10] - 2020-01-31

### Added

- [#108](https://github.com/cosmos/lunie/issues/108) Sentry integration was added @iambeone
- Allow extension in netlify deployment previews @faboweb
- Add stepped create and recover account flows @mariopino

### Changed

- [#125](https://github.com/cosmos/lunie/pull/125) Updates to the latest cosmos-keys version, where we can create accounts for different networks @Bitcoinera
- fixed errors with prefix @iambeone

### Fixed

- [#128](https://github.com/cosmos/lunie/pull/128) Fixes account creation by adding "cosmos" as the default address prefix @Bitcoinera
- [#110](https://github.com/cosmos/lunie/pull/110) Fix e2e tests by using the lunie-backend docker-compose to run the stack @faboweb
- [#45](https://github.com/cosmos/lunie/issues/45) Modify jest command to let it use the testMatch pattern defined in jest.config.js instead of passing paths by param @mariopino

### Repository

- [#134](https://github.com/cosmos/lunie/pull/134) Use new release flow @faboweb

## [1.0.9] - 2019-09-27

### Changed

- updates to approval screen @jbibla

## [1.0.8] - 2019-09-12

### Added

- form and styling improvements @jbibla

## [1.0.7] - 2019-09-06

### Fixed

- [#95](https://github.com/cosmos/lunie/pull/95) Fixed e2e transaction test by switching to send instead of delegation @faboweb

### Repository

- Ignore pending check on release candidate @faboweb
- Updated README to include more detailed info about building and testing the extension. @mariopino

## [1.0.6] - 2019-09-03

### Fixed

- Whitelist actual new lunie URL @faboweb

### Repository

- Use patch version updates instead of beta version updates @faboweb

## [1.0.5] - 2019-09-03

### Changed

- Switched to new logo @faboweb

### Security

- [#90](https://github.com/cosmos/lunie/pull/90) Allow app.lunie.io domain to work with the extension @colw

## [1.0.4] - 2019-08-29

### Fixed

- Fix a bug where the UI would crash 0 fee txs @faboweb

### Code Improvements

- [#83](https://github.com/cosmos/lunie/pull/83) Use new transaction component @colw

## [1.0.3] - 2019-08-06

### Added

- [#58](https://github.com/cosmos/lunie/issues/58) Clicking Reject closes extension via Window.clow() @thebkr7
- [#59](https://github.com/cosmos/lunie/issues/59) Addition of Google Analytics' @thebkr7
- [#78](https://github.com/cosmos/lunie/issues/78) E2E tests and scripts to test a full delegation from the extension @thebkr7
- [#48](https://github.com/cosmos/lunie/pull/48) Add testing for Vue files @colw

### Fixed

- [#76](https://github.com/cosmos/lunie/pull/76) Ui bug showing duplicate session class for SessionFrame in extension @thebkr7
- Updated to latest Lunie hiding backbutton on welcome screen @faboweb

### Code Improvements

- [#77](https://github.com/cosmos/lunie/pull/77) Changing from e2e testing with puppeteer to using nightwatch @thebkr7

### Repository

- Added release helper to npm scripts @faboweb
- Publish the extension right away @faboweb

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