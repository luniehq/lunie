# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!-- SIMSALA --> <!-- DON'T DELETE, used for automatic changelog updates -->

## [2.0.1] - 2020-06-11

### Added

- [#890](https://github.com/cosmos/lunie/pull/890) Enables all Akash testnet actions @Bitcoinera
- Track validator popularity @faboweb
- Add whitelisting for origins @faboweb
- BalancesV2 on Polkadot @faboweb
- [#4230](https://github.com/cosmos/lunie/issues/4230) Add Polkadot CC1 network @mariopino
- Fix Error: Cannot use GraphQLSchema in frontend @mariopino
- Add flag to enable notifications @michielmulders
- [#884](https://github.com/cosmos/lunie/pull/884) Add logic for handling lunie type notifications @michielmulders

### Changed

- [#4207](https://github.com/cosmos/lunie/pull/4207) Adds the popularity field to validators @Bitcoinera
- [#889](https://github.com/cosmos/lunie/issues/889) Overwrites Tendermint networks chain-id with the blockchain one in cosmos-node-subscription @Bitcoinera
- [#891](https://github.com/cosmos/lunie/issues/891) Set transaction success for Akash and Kava testnet checking if code field is present @Bitcoinera
- [#4250](https://github.com/cosmos/lunie/pull/4250) Adds CAD to fiat currencies @Bitcoinera
- [#4223](https://github.com/cosmos/lunie/pull/4223) Enables Akash testnet @Bitcoinera
- [#896](https://github.com/cosmos/lunie/pull/896) Copy common folder to Docker tar @michielmulders

### Fixed

- [#4217](https://github.com/cosmos/lunie/pull/4217) Fixes empty Portfolio when querying balances with balancesV2 @Bitcoinera
- Deploy to the correct folder in instance @faboweb
- Delegates would be returned multiple times @faboweb
- Validators in node subscription had the wrong format causing double events @faboweb
- Deploy correct Caddy file @faboweb
- Make rewards uniq to not crash insert into db @faboweb
- Add Polkadot nodes to CSP @faboweb

### Security

- Update Polkadot library @faboweb

### Code Improvements

- [#895](https://github.com/cosmos/lunie/pull/895) Adds KavaV1 files for kava-testnet @Bitcoinera
- [#4216](https://github.com/cosmos/lunie/pull/4216) Move dependabot config to root folder of monorepo @Bitcoinera
- Removed some old unneeded files @faboweb

### Repository

- [#4214](https://github.com/cosmos/lunie/pull/4214) Adjusted GitHub Actions to new mono repo @faboweb