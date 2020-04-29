# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!-- SIMSALA --> <!-- DON'T DELETE, used for automatic changelog updates -->

## [1.0.6] - 2020-04-29

### Changed

- Add env vars for push notifications to Docker-Compose @michielmulders

### Fixed

- [#655](https://github.com/cosmos/lunie/pull/655) Adds networkId back to the networks sourceClasses @Bitcoinera
- [#654](https://github.com/cosmos/lunie/pull/654) Fixes "token not supported" error in e-Money by adding the nordic coins gas prices @Bitcoinera
- [#648](https://github.com/cosmos/lunie/issues/648) Fix API restarting itself in polkadot rewards calculation @mariopino

## [1.0.5] - 2020-04-28

### Changed

- [#631](https://github.com/cosmos/lunie/pull/631) Disable Kava for production @Bitcoinera
- [#633](https://github.com/cosmos/lunie/issues/633) Returns 0 instead of NaN when a delegation doesn't exist in cosmosV2-reducers @Bitcoinera
- [#627](https://github.com/cosmos/lunie/pull/627) Enables most of Kava features and actions. Adds kavaV0-reducers @Bitcoinera
- [#616](https://github.com/cosmos/lunie/issues/616) Deliver blocks from store @mariopino

### Fixed

- [#634](https://github.com/cosmos/lunie/issues/634) Fixes denom.toUpperCase is not a function @Bitcoinera
- 	Handle no delegations in Polkadot better @faboweb
- Inactive Polkadot delegation where not showing correctly @faboweb
- [#637](https://github.com/cosmos/lunie/issues/637) Fix empty polkadot rewards @mariopino

### Repository

- Added CI step to publish @faboweb

## [1.0.4] - 2020-04-26

### Added

- Added better logging for polkadot rewards scripts @faboweb
- Detect proposal additions for push notifications @michielmulders

### Changed

- [#624](https://github.com/cosmos/lunie/pull/624) Adds Kava mainnet as a network and enables the validator feature @Bitcoinera

### Fixed

- [#614](https://github.com/cosmos/lunie/pull/614) Fixes delegation query when there are no delegations @Bitcoinera
- [#622](https://github.com/cosmos/lunie/issues/622) Fixes Polkadot overview for 0 balance accounts @Bitcoinera
- [#613](https://github.com/cosmos/lunie/pull/613) Fixes transactionClaimEvents is undefined in cosmosV2-reducers @Bitcoinera
- Add missing scripts folder to docker @faboweb
- Rewrite the rewards query to not time out the API @faboweb
- Secrets file was not copyed to the Docker file @faboweb

### Security

- Add Docker secrets @michielmulders

## [1.0.3] - 2020-04-22

### Fixed

- [#606](https://github.com/cosmos/lunie/pull/606) Fixes Polkadot delegations in a hacky way @Bitcoinera
- [#607](https://github.com/cosmos/lunie/issues/607) Handles case with no delegations in Polkadot @faboweb

## [1.0.2] - 2020-04-20

### Changed

- [#598](https://github.com/cosmos/lunie/pull/598) Adds powered to Kusama with stake.fish infos @Bitcoinera
- Switch back memory limit as we shrunk the instance @faboweb
- Add link paramter and formatting for push notifications @michielmulders

### Fixed

- [#588](https://github.com/cosmos/lunie/issues/588) Handles succesful withdraws without rewards @faboweb
- Add denom to transaction statistics @faboweb

### Deprecated

- Removed transaction statistic prestoring @faboweb
- Removed tracking of totalRewards @faboweb
- [#560](https://github.com/cosmos/lunie/pull/560) Removes deprecated code from old block resolver, getTransactionByHeight and getBlockByHeight @michielmulders

### Repository

- Set version of API in Sentry for easier tracking @faboweb

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