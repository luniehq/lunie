# Changelog
 
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!-- SIMSALA --> <!-- DON'T DELETE, used for automatic changelog updates -->

## [1.0.30] - 2020-06-26

### Added

- [#4281](https://github.com/cosmos/lunie/issues/4281) Add polkadot testnet network (Westend) @mariopino

### Changed

- [#4361](https://github.com/cosmos/lunie/pull/4361) Add Kava tokens to fiat values API @Bitcoinera

### Fixed

- [#4374](https://github.com/cosmos/lunie/pull/4374) Fix the networks icons links for the new polkadot networks @Bitcoinera
- [#4364](https://github.com/cosmos/lunie/pull/4364) Fix the publish flow @Bitcoinera

### Code Improvements

- [#4360](https://github.com/cosmos/lunie/pull/4360) Handle CoinGecko timeouts @Bitcoinera

## [1.0.29] - 2020-06-24

### Added

- [#4334](https://github.com/cosmos/lunie/pull/4334) Adds authorization token in header to apollo context @Bitcoinera

### Fixed

- [#4353](https://github.com/cosmos/lunie/pull/4353) Fix subscriptions breaking @Bitcoinera

## [1.0.28] - 2020-06-23

### Added

- [#4328](https://github.com/cosmos/lunie/issues/4328) Upgrade Polkadot js api to v1.20.1 @mariopino

### Changed

- Send network to script runner to cache per network @faboweb

### Fixed

- [#4324](https://github.com/cosmos/lunie/pull/4324) Fixes polkadot network calculate fees by changing the parameters order @Bitcoinera

## [1.0.27] - 2020-06-19

### Added

- [#4295](https://github.com/cosmos/lunie/issues/4295) Adds some user management to API with the store and getUser functions  @Bitcoinera
- [#3894](https://github.com/cosmos/lunie/issues/3894) Upgrade @polkadot/api to v1.19.1 @Bitcoinera @mariopino
- [#3995](https://github.com/cosmos/lunie/issues/3995) Handle polkadot election period @mariopino

### Changed

- Use script runner instane for CPU intense tasks @faboweb
- Deliver full Terra tax and not trim to avoid bad tax rates @faboweb

### Fixed

- Fix import for firebase credentials @faboweb
- SCRIPT_RUNNER_ENDPOINT was not available when deployed @faboweb
- Remove chain id for validator updates @faboweb

### Deprecated

- [#4310](https://github.com/cosmos/lunie/pull/4310) Delete an unused function, updateDBValidatorProfiles, now living in the store @Bitcoinera

## [1.0.26] - 2020-06-18

### Added

- [#4299](https://github.com/cosmos/lunie/issues/4299) Upgrade polkadot api to v1.19.1 @mariopino

### Fixed

- [#4280](https://github.com/cosmos/lunie/issues/4280) Fixes validator search taking too long @Bitcoinera
- [#4276](https://github.com/cosmos/lunie/pull/4276) Fixes the API release flow by adding the missing GIT_BOT_TOKEN env variable @Bitcoinera
- Fix Polkadot reconnection @faboweb
- Fix Tendermint connections @faboweb

## [1.0.25] - 2020-06-11

### Changed

- [#4268](https://github.com/cosmos/lunie/pull/4268) Disables Polkadot for now @Bitcoinera
- [#4252](https://github.com/cosmos/lunie/pull/4252) Upgrade to Kava-3 @Bitcoinera

### Fixed

- Use correct reward deduping @faboweb
- Fix for websocket connection lost @michielmulders

## [1.0.24] - 2020-06-11

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

## [1.0.23] - 2020-06-03

### Changed

- [#876](https://github.com/cosmos/lunie/pull/876) Add offset to getNotifications query @michielmulders

### Fixed

- Disable Polkadot reconnection logic as not working properly @faboweb

### Deprecated

- [#876](https://github.com/cosmos/lunie/pull/876) Remove /transaction/estimate endpoint @michielmulders

## [1.0.22] - 2020-06-03

### Added

- Track new validators - notification type @michielmulders
- [#855](https://github.com/cosmos/lunie/pull/855) Add websocket mechanism for listening to slashing events @michielmulders

### Changed

- [#861](https://github.com/cosmos/lunie/pull/861) Adds RestakeTx to polkadot-transactions to calculate RestakeTx fees @Bitcoinera
- [#868](https://github.com/cosmos/lunie/pull/868) Use P2P Validator endpoints for terra-mainnet @Bitcoinera
- Reconnect Polkadot API right away to prevent race condition @faboweb
- Add timeout to Github Actions workflows @michielmulders
- Only run slahsing monitor for cosmos based networks @michielmulders

### Fixed

- [#872](https://github.com/cosmos/lunie/pull/872) Fixes Kava ClaimRewards transaction appearing as Unknown @Bitcoinera
- [#870](https://github.com/cosmos/lunie/pull/870) Fixes validators uptimePercentage being NaN in e-Money @Bitcoinera
- [#866](https://github.com/cosmos/lunie/pull/866) Fixes Polkadot ClaimRewards fee @Bitcoinera
- Handle fees if user has 0 balance in that token @faboweb
- Fix memory leaks in Polkadot API by reconnecting every hour @faboweb
- Update Polkadot dependency @faboweb
- [#4161](https://github.com/cosmos/lunie/issues/4161) Fix wrong status detailed in kusama validators  @mariopino
- [#857](https://github.com/cosmos/lunie/issues/857) Fix getOldPolkadotRewardEras.js script @mariopino

### Repository

- Fix merge to master script (publishing) @faboweb

## [1.0.21] - 2020-05-28

### Fixed

- [#859](https://github.com/cosmos/lunie/pull/859) Fixes calculating fees for governance transactions in Tendermint @Bitcoinera
- [#854](https://github.com/cosmos/lunie/pull/854) Fix getPolkadotFee by renaming transactionFees to transactionFee @Bitcoinera

## [1.0.20] - 2020-05-27

### Added

- [#812](https://github.com/cosmos/lunie/issues/812) Moves the whole fee calculation logic to API @Bitcoinera

### Changed

- [#840](https://github.com/cosmos/lunie/pull/840) Adds buttonCaption and linkCaption as fields for Maintenance @Bitcoinera

### Fixed

- [#848](https://github.com/cosmos/lunie/pull/848) Fixes Terra fees by multiplying the Terra tax by amount being transacted @Bitcoinera
- [#847](https://github.com/cosmos/lunie/pull/847) Fix for linebreaks in proposals that cause notification creation to fail @michielmulders
- [#846](https://github.com/cosmos/lunie/pull/846) Validator not found in validator store @michielmulders

## [1.0.19] - 2020-05-27

### Fixed

- [#832](https://github.com/cosmos/lunie/issues/832) Fixes issues with Kava duplicte message types by adding getMessageType to Kava reducers @Bitcoinera
- Update polkadot library @faboweb
- [#803](https://github.com/cosmos/lunie/issues/803) Handle polkadot sub-identities @mariopino
- [#821](https://github.com/cosmos/lunie/issues/821) Fix validator expected returns order in polkadot @mariopino
- [#843](https://github.com/cosmos/lunie/issues/843) Fix getting fees in polkadot for new accounts in staking @mariopino

## [1.0.18] - 2020-05-26

### Added

- [#819](https://github.com/cosmos/lunie/pull/819) Add validator name and picture to notification @michielmulders
- [#817](https://github.com/cosmos/lunie/pull/817) Persist validator data from store to disk @michielmulders

### Changed

- [#734](https://github.com/cosmos/lunie/issues/734) Adds a link field to the maintenance bar to display it in FE @Bitcoinera

### Fixed

- [#822](https://github.com/cosmos/lunie/pull/822) Fix governance transaction fees by including governance tx specific fields in the networkFees schema @Bitcoinera
- [#4142](https://github.com/cosmos/lunie/issues/4142) Fix TransactionDetailsInput in schema @mariopino
- [#823](https://github.com/cosmos/lunie/pull/823) Fix double notification and kusama undefined eventType @michielmulders

## [1.0.17] - 2020-05-23

### Fixed

- Fix claiming not querying fees correctly @faboweb

## [1.0.16] - 2020-05-23

### Added

- [#809](https://github.com/cosmos/lunie/pull/809) Adds fetching Polkadot fees within the networkFees query @Bitcoinera

### Changed

- Add validator event types @michielmulders

## [1.0.15] - 2020-05-21

### Added

- [#774](https://github.com/cosmos/lunie/issues/774) Return delegations for controller addresses in polkadot @mariopino

### Fixed

- [#799](https://github.com/cosmos/lunie/issues/799) Fix amounts in Polkadot to have same decimals as in Tendermint networks @Bitcoinera
- Fix polkadot delegations @mariopino

## [1.0.14] - 2020-05-21

### Added

- [#793](https://github.com/cosmos/lunie/pull/793) Adds Akash incentized testnet validators @Bitcoinera
- Add subscription for live notification updates @michielmulders

### Changed

- [#798](https://github.com/cosmos/lunie/pull/798) Returns undefined on accountRole resolver when network has no getAddressRole method @Bitcoinera
- [#795](https://github.com/cosmos/lunie/pull/795) Enables Akash activiy and proposals @Bitcoinera
- [#801](https://github.com/cosmos/lunie/pull/801) Releases Kava by enabling it  @Bitcoinera
- [#797](https://github.com/cosmos/lunie/pull/797) Fetches e-Money gas prices dynamically @Bitcoinera
- [#791](https://github.com/cosmos/lunie/pull/791) Update Kava-testnet to kava-testnet-6000 @Bitcoinera

## [1.0.13] - 2020-05-19

### Changed

- [#788](https://github.com/cosmos/lunie/pull/788) Fetch Terra tax rate dynamically @Bitcoinera

## [1.0.12] - 2020-05-18

### Added

- [#730](https://github.com/cosmos/lunie/pull/730) Adds Kava testnet @Bitcoinera
- [#764](https://github.com/cosmos/lunie/issues/764) Address role detection in polkadot @mariopino
- Remove push and add notification service @michielmulders

### Changed

- [#738](https://github.com/cosmos/lunie/pull/738) Adds dependabot config to automatically open PRs on @polkadot/api releases @Bitcoinera
- [#754](https://github.com/cosmos/lunie/pull/754) Adds experimental flag to the networks Object @Bitcoinera
- [#730](https://github.com/cosmos/lunie/pull/730) Enables remaining actions and feats for kava-mainnet @Bitcoinera
- Add docker secret for hasura key and remove port secret @michielmulders

### Fixed

- [#740](https://github.com/cosmos/lunie/issues/740) Fixes property 0 of undefined in depositDetailsReducer for kava-testnet @Bitcoinera
- [#782](https://github.com/cosmos/lunie/issues/782) Fixes duplicate notifications @Bitcoinera
- [#762](https://github.com/cosmos/lunie/pull/762) Fixes Kusama portfolio claimedRewards of undefined error @Bitcoinera
- [#768](https://github.com/cosmos/lunie/issues/768) Detect transaction success in polkadot @mariopino

### Code Improvements

- Format according to new standards for updated linting libraries @faboweb

### Repository

- Restart the lunie-api docker container always to account for memory outage @faboweb

## [1.0.11] - 2020-05-12

### Changed

- [#721](https://github.com/cosmos/lunie/pull/721) Switches to the new Polkadot reward claiming model after era 718 @faboweb

### Fixed

- Fix publish to master script @faboweb
- [#727](https://github.com/cosmos/lunie/issues/727) Fix NaN expected returns in certain cases in polkadot @mariopino

### Security

- [#726](https://github.com/cosmos/lunie/pull/726) Resolves all current dependencies vulnerabilities alerts @Bitcoinera

## [1.0.10] - 2020-05-10

### Changed

- [#722](https://github.com/cosmos/lunie/pull/722) Adjust e-Money fees following Martin's advice and testing on mainnet @Bitcoinera

### Fixed

- [#719](https://github.com/cosmos/lunie/issues/719) Fixes wrong Kusama fiat value by correctly showing the totalStakeFiatValue @Bitcoinera
- Filter delegations correctly @faboweb

## [1.0.9] - 2020-05-07

### Added

- [#679](https://github.com/cosmos/lunie/issues/679) Upgrade polkadot api to v1.12.2 @mariopino
- [#681](https://github.com/cosmos/lunie/issues/681) Create and persist caches dir @mariopino
- [#688](https://github.com/cosmos/lunie/issues/688) Enable claim rewards feature in Polkadot network @mariopino
- [#696](https://github.com/cosmos/lunie/issues/696) Add annualized validator rewards percent in polkadot @mariopino
- [#678](https://github.com/cosmos/lunie/pull/678) Add ability to update push registration @michielmulders

### Changed

- [#387](https://github.com/cosmos/lunie/issues/387) Adds chainAppliedFees to the networkFees query @Bitcoinera
- [#387](https://github.com/cosmos/lunie/issues/387) Adds the transactionMetadata query to query for networkFees as well as an account sequence and accountNumber @Bitcoinera
- [#676](https://github.com/cosmos/lunie/pull/676) Add the e-Money env variables to the docker-compose files @Bitcoinera
- [#609](https://github.com/cosmos/lunie/pull/609) Adds fiat values to all networks (with tokens in the fiat markets i.e. CoinGecko API) @Bitcoinera
- [#686](https://github.com/cosmos/lunie/pull/686) Now Kusama also has fiatValues @Bitcoinera
- [#691](https://github.com/cosmos/lunie/pull/691) Disable emoney testnet @Bitcoinera
- [#713](https://github.com/cosmos/lunie/pull/713) Rename in Network's schema unstakingPeriod to lockUpPeriod @Bitcoinera
- [#677](https://github.com/cosmos/lunie/pull/677) Add current CircleCI PR tests to our GH Actions @Bitcoinera
- [#653](https://github.com/cosmos/lunie/pull/653) Runs getOldPolkadotRewards script only when data has not yet been stored @Bitcoinera
- [#642](https://github.com/cosmos/lunie/issues/642) Sets Kusama as mainnet @Bitcoinera
- Disable push notifications @michielmulders
- [#669](https://github.com/cosmos/lunie/pull/669) Remove pm2 @faboweb
- [#711](https://github.com/cosmos/lunie/issues/711) Upgrade polkadot api to v1.13.1 @mariopino

### Fixed

- [#683](https://github.com/cosmos/lunie/pull/683) Fixes validators on Portfolio with virtually no stake @Bitcoinera
- [#700](https://github.com/cosmos/lunie/issues/700) Update nodemon ignore to avoid api restarts @mariopino
- [#695](https://github.com/cosmos/lunie/issues/695) Fix for unknown transaction in push notifications @michielmulders

### Code Improvements

- [#701](https://github.com/cosmos/lunie/pull/701) Renames polkadot-testnet to kusama @Bitcoinera

### Repository

- [#609](https://github.com/cosmos/lunie/pull/609) Adds fiatValues API and moves all fiatValue calculation logic there @Bitcoinera

## [1.0.8] - 2020-04-30

### Added

- [#576](https://github.com/cosmos/lunie/issues/576) Add endpoint to query all staking users @faboweb

### Changed

- [#666](https://github.com/cosmos/lunie/pull/666) Now network icons are served from DO @Bitcoinera
- [#664](https://github.com/cosmos/lunie/pull/664) Update e-Money gas prices adding the nordic coins prices @Bitcoinera

### Fixed

- Store caches in folder to properly use docker volumes @faboweb
- Update terra testnet chainId @faboweb
- Attach docker PORT to lunie-api service in docker-compose.yml @michielmulders

### Repository

- Persist Polkadot eras in a docker volume @faboweb

## [1.0.7] - 2020-04-29

### Changed

- [#659](https://github.com/cosmos/lunie/pull/659) Disable Kava network for the second time @Bitcoinera
- [#658](https://github.com/cosmos/lunie/pull/658) Raises e-Money RestakeTx gas estimate @Bitcoinera

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
