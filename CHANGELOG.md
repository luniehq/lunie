# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!-- SIMSALA --> <!-- DON'T DELETE, used for automatic changelog updates -->

## [1.0.1] - 2020-04-15

### Added

- [#437](https://github.com/cosmos/lunie/issues/437) Adds balancesV2 and cleans up some code @faboweb
- Push notifications and registration for topics @michielmulders

### Changed

- [#583](https://github.com/cosmos/lunie/pull/583) Polkadot rewards amounts stored in DB have now a fixed number of decimals of 9 @Bitcoinera
- Query era rewards in chunks to not block the API @faboweb
- Enable Polkadot @faboweb
- [#591](https://github.com/cosmos/lunie/pull/591) Run the getOldPolkadotRewardsEras script as a separate process. Remove the whole updateRewards logic from polkadot-node-subscription @faboweb
- Use Bitfish provided Kusama node @faboweb

### Fixed

- [#579](https://github.com/cosmos/lunie/pull/579) Fix Polkadot rewards not updating by fixing the reducer logic @Bitcoinera
- [#583](https://github.com/cosmos/lunie/pull/583) Perhaps fixes storing empty rewards bug ("store rewards 0") @Bitcoinera
- Era rewards in Polkadot would not have access to the validators yet so there would be a lot of console errors @faboweb
- Export correct module for push notifications @michielmulders

### Security

- Updated dependencies @faboweb

### Deprecated

- removes logging for emoney price updates @faboweb

### Code Improvements

- Added logging for polkadot rewards script @faboweb

### Repository

- Added Simsala changelog system @faboweb