# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!-- SIMSALA --> <!-- DON'T DELETE, used for automatic changelog updates -->

## [1.0.59] - 2020-11-04

### Changed

- [#5183](https://github.com/cosmos/lunie/pull/5183) Upgrade to emoney-2 @Bitcoinera

### Fixed

- [#5182](https://github.com/cosmos/lunie/pull/5182) Fix e-Money gasprices by changing column name from gasPrice to price @Bitcoinera
- [#5184](https://github.com/cosmos/lunie/pull/5184) Fix the last gasPrice @Bitcoinera
- [#5165](https://github.com/cosmos/lunie/issues/5165) Handle Kava vesting accounts @faboweb
- [#5166](https://github.com/cosmos/lunie/issues/5166) Handle unknown coins @faboweb
- [#5164](https://github.com/cosmos/lunie/issues/5164) Fix claim rewards in polkadot @mariopino

## [1.0.58] - 2020-10-23

### Fixed

- Handle Polkadot batch failure @faboweb
- [#5132](https://github.com/cosmos/lunie/issues/5132) Fix unstake amount being added for low balance for fee calculation @faboweb

## [1.0.57] - 2020-10-21

### Added

- [#4613](https://github.com/cosmos/lunie/issues/4613) Add substrate transaction error @mariopino

## [1.0.56] - 2020-10-21

### Added

- [#4821](https://github.com/cosmos/lunie/issues/4821) Add events for claiming txs @faboweb @bitcoinera @mariopino
- [#5127](https://github.com/cosmos/lunie/issues/5127) Update polkadot-js/api to release v2.3.1 @mariopino

### Changed

- [#4337](https://github.com/cosmos/lunie/issues/4337) Add the new validator profile endpoint @Bitcoinera
- [#5121](https://github.com/cosmos/lunie/issues/5121) Handle case of missing eMoney variables in FiatValuesAPI for scriptRunner @Bitcoinera
- [#4989](https://github.com/cosmos/lunie/pull/4989) Add votes to Treasury metada @Bitcoinera

### Fixed

- [#5141](https://github.com/cosmos/lunie/issues/5141) Fix mem leak produced by validators profiles @Bitcoinera
- [#5133](https://github.com/cosmos/lunie/issues/5133) Fix missing Polkadot undelegations @Bitcoinera
- [#5134](https://github.com/cosmos/lunie/issues/5134) Fix fiat value error in getOldPolkadotRewardEras.js @mariopino

## [1.0.55] - 2020-10-16

### Added

- Reenable substrate sidecar @mariopino

### Changed

- [#5096](https://github.com/cosmos/lunie/pull/5096) Remove the validator picture update notification @Bitcoinera
- [#5098](https://github.com/cosmos/lunie/issues/5098) Receive networkId field for MaintenanceBar @Bitcoinera

### Fixed

- [#5082](https://github.com/cosmos/lunie/issues/5082) Fix Terra validators expectedReturns being all 0 @Bitcoinera
- [#5120](https://github.com/cosmos/lunie/pull/5120) Try to fix slow mem leak @Bitcoinera
- Proposal notifications would not be stored for Cosmos chains as the resource id was not a string @faboweb
- [#5112](https://github.com/cosmos/lunie/issues/5112) Don't fetch polkadot proposals if feature is not enabled @mariopino

## [1.0.54] - 2020-10-13

### Changed

- [#5053](https://github.com/cosmos/lunie/issues/5053) Send only one notification even when the notification originates from a multi-message transaction (avoid using involvedAddresses) @Bitcoinera
- [#4429](https://github.com/cosmos/lunie/issues/4429) Get gas prices and gas estimates from DB @Bitcoinera
- [#5084](https://github.com/cosmos/lunie/pull/5084) Upgrate to polkadot/api-2.2.1 @Bitcoinera
- [#5040](https://github.com/cosmos/lunie/pull/5040) Upgrade to polkadot/api-2.1.1 @Bitcoinera

### Fixed

- [#5055](https://github.com/cosmos/lunie/issues/5055) Fix Akash balance query: lunieCoin.amount.plus is not a function @Bitcoinera
- [#5044](https://github.com/cosmos/lunie/issues/5044) Fix eMoney PageValidator by fixing validator uptimePercentage @Bitcoinera
- [#5045](https://github.com/cosmos/lunie/pull/5045) Fix objectObject in Polkadot referendum description @Bitcoinera

## [1.0.53] - 2020-10-07

- [#5069](https://github.com/cosmos/lunie/pull/5069) adding missing API fixes for e-Money @jbibla

## [1.0.53] - 2020-10-06

### Changed

- [#5040](https://github.com/cosmos/lunie/pull/5040) Upgrade to polkadot/api-2.1.1 @Bitcoinera

### Fixed

- [#5055](https://github.com/cosmos/lunie/issues/5055) Fix Akash balance query: lunieCoin.amount.plus is not a function @Bitcoinera
- [#5044](https://github.com/cosmos/lunie/issues/5044) Fix eMoney PageValidator by fixing validator uptimePercentage @Bitcoinera
- [#5041](https://github.com/cosmos/lunie/pull/5041) Fix e-Money correcting the Terra Columbus-4 upgrade to make it the proper way @Bitcoinera
- [#5045](https://github.com/cosmos/lunie/pull/5045) Fix objectObject in Polkadot referendum description @Bitcoinera

## [1.0.52] - 2020-10-03

### Changed

- [#5025](https://github.com/cosmos/lunie/pull/5025) Revert polkadot sidecar @Bitcoinera

### Fixed

- [#5017](https://github.com/cosmos/lunie/pull/5017) Prevent coinLookup of undefined when not running emoney network @Bitcoinera

## [1.0.51] - 2020-10-02

### Changed

- [#5033](https://github.com/cosmos/lunie/pull/5033) Upgrade Terra to Columbus-4 (Cosmos-Hub 4) @Bitcoinera

### Fixed

- [#5017](https://github.com/cosmos/lunie/pull/5017) Prevent coinLookup of undefined when not running emoney network @Bitcoinera

## [1.0.50] - 2020-10-01

### Added

- [#4974](https://github.com/cosmos/lunie/issues/4974) Implement substrate API sidecar @mariopino

### Changed

- [#5011](https://github.com/cosmos/lunie/pull/5011) Update to polkadot/api-2.0.1 @Bitcoinera

### Fixed

- [#5000](https://github.com/cosmos/lunie/pull/5000) Fixes Akash mainnet fees @Bitcoinera
- [#4977](https://github.com/cosmos/lunie/pull/4977) Fix rpc_url being null on API launch @Bitcoinera

### Code Improvements

- [#4771](https://github.com/cosmos/lunie/issues/4771) Remove hardcoded denomLookup @Bitcoinera

## [1.0.49] - 2020-09-25

### Fixed

- [#4994](https://github.com/cosmos/lunie/pull/4994) Fix cannot read AKT of undefined @Bitcoinera

## [1.0.48] - 2020-09-24

### Fixed

- Notifications were not showing in some cases @faboweb
- Fix transaction reducer in polling for tx success failing @faboweb
- Id was not unique for undelegations @faboweb

## [1.0.47] - 2020-09-22

### Added

- [#4873](https://github.com/cosmos/lunie/issues/4873) Allow to query Polkadot rewards by era @faboweb
- [#4878](https://github.com/cosmos/lunie/issues/4878) Allow new withdraw unstaked tx type @faboweb
- Create events for Polkadot proposals @faboweb
- Add staked to BalanceV2 @mariopino

### Changed

- [#4954](https://github.com/cosmos/lunie/pull/4954) Fix displaying deposits for Polkadot in FE @Bitcoinera
- [#4812](https://github.com/cosmos/lunie/issues/4812) Change Proposals timelines titles @Bitcoinera
- [#4916](https://github.com/cosmos/lunie/issues/4916) Council members voting power is a percentage @Bitcoinera
- [#4917](https://github.com/cosmos/lunie/issues/4917) Add parameter as a field for Polkadot democracy proposals @Bitcoinera
- [#4897](https://github.com/cosmos/lunie/pull/4897) Add ID field to type Deposit @Bitcoinera
- [#4955](https://github.com/cosmos/lunie/pull/4955) Add message about council members for Polkadot Treasury proposals summaries @Bitcoinera
- [#4861](https://github.com/cosmos/lunie/pull/4861) Cache Substrate identities in blockStore to make AllProposals query faster @Bitcoinera
- [#4812](https://github.com/cosmos/lunie/issues/4812) Beneficiary is also a NetworkAccount Object @Bitcoinera
- [#4926](https://github.com/cosmos/lunie/pull/4926) Make name for NetworkAccount nullable @Bitcoinera
- [#4566](https://github.com/cosmos/lunie/pull/4566) Lots of small fixes and adjustment to wrap up governance @Bitcoinera
- [#4978](https://github.com/cosmos/lunie/pull/4978) Fix display picture for topVoters @Bitcoinera
- [#4884](https://github.com/cosmos/lunie/pull/4884) Update to @polkadot/api 1.33.1 @Bitcoinera
- [#4952](https://github.com/cosmos/lunie/pull/4952) Update to polkadot/api-1.34.1 @Bitcoinera
- Show parameters as description @faboweb
- Show all proposal step always @faboweb
- switched "preliminary" proposals to "democracy" proposals to reduce concepts @jbibla
- [#4935](https://github.com/cosmos/lunie/pull/4935) Add changes/parameters to Cosmos proposals. Also to Treasury and Referendum in Polkadot @jbibla
- changed timeline language again for optimal grammar @jbibla

### Fixed

- [#4913](https://github.com/cosmos/lunie/pull/4913) Fix unknown proposal type in Terra @Bitcoinera
- [#4897](https://github.com/cosmos/lunie/pull/4897) Fix duplicate voters for Cosmos @Bitcoinera
- [#4905](https://github.com/cosmos/lunie/pull/4905) Fix democracy proposals progress bar for Polkadot by adding percentageDepositsNeeded @Bitcoinera
- [#4907](https://github.com/cosmos/lunie/pull/4907) Fix Polkadot undelegations endTime @Bitcoinera
- [#4937](https://github.com/cosmos/lunie/pull/4937) Fix proposer being null for Cosmos @Bitcoinera
- [#4872](https://github.com/cosmos/lunie/pull/4872) Fix referendum timeline @Bitcoinera
- [#4812](https://github.com/cosmos/lunie/issues/4812) Fix voter cache in proposal -> detailedVotes query for FE by adding a distinct ID @Bitcoinera
- don't query for proposals of past chains in Cosmos @faboweb
- Do not show depositors double @faboweb
- Fix new polkadot node subscriptions @faboweb
- Do not retry proposer queries as they usually fail @faboweb
- Fix overview token displaying by looking for stakingDenom instead of random position 1 token @faboweb
- Handle early deposit end in Cosmos proposals @faboweb
- Handle unknown future timeline items in Cosmos @faboweb
- Fix breaking balance query for users without stake @faboweb
- Fix validators not showing correctly in governance participation @faboweb
- Get validator pictures in governance correctly @faboweb
- Show undelegations when they are ready to claim instead of hiding them @faboweb
- Fix the staked balance @faboweb
- Add staked balance also for Cosmos @faboweb

### Code Improvements

- [#4879](https://github.com/cosmos/lunie/issues/4879) Reuse messageCreator file from APP (polkadot-transactions.js) in API @Bitcoinera
- Reduced code for getting proposals @faboweb
- Standardize the node subscription leveraging the source classes @faboweb

## [1.0.46] - 2020-09-08

### Changed

- [#4812](https://github.com/cosmos/lunie/issues/4812) Proposer, voter and depositer have new type NetworkAccount @Bitcoinera
- [#4834](https://github.com/cosmos/lunie/pull/4834) Update to @polkadot/api-1.32.1 @Bitcoinera
- [#4791](https://github.com/cosmos/lunie/issues/4791) Disable liveness events as not used rn @faboweb
- Remove council proposals and handle council voting for treasury propsals @faboweb

### Fixed

- [#4822](https://github.com/cosmos/lunie/issues/4822) Fix negative staking balance in Substrate by filtering only active undelegations @Bitcoinera
- [#4824](https://github.com/cosmos/lunie/pull/4824) Fix voter as Object in the proposal query @Bitcoinera
- [#4823](https://github.com/cosmos/lunie/pull/4823) Fix single proposal query missing return @Bitcoinera
- [#4813](https://github.com/cosmos/lunie/issues/4813) Show validator name in commission change notification @faboweb
- [#4832](https://github.com/cosmos/lunie/issues/4832) Terra balances show double denoms for some rewards @faboweb
- [#4799](https://github.com/cosmos/lunie/issues/4799) Fix polkadot total balance @mariopino

## [1.0.45] - 2020-09-01

### Added

- [#4445](https://github.com/cosmos/lunie/issues/4445) Add detailedVotes to the proposal object @Bitcoinera
- [#4445](https://github.com/cosmos/lunie/issues/4445) Add the governance overview endpoint @Bitcoinera
- [#4667](https://github.com/cosmos/lunie/issues/4667) Add undelegations to Polkadot @Bitcoinera
- [#4445](https://github.com/cosmos/lunie/issues/4445) Polkadot api governance endpoints @mariopino

### Changed

- [#4667](https://github.com/cosmos/lunie/issues/4667) Undelegations in Polkadot now display correct endTime in human date @Bitcoinera
- [#4752](https://github.com/cosmos/lunie/pull/4752) Add lockedBalance and conviction fields in TransactionDetailsInput @Bitcoinera
- [#4808](https://github.com/cosmos/lunie/pull/4808) erasPerDay field is not required in type Network @Bitcoinera
- [#4784](https://github.com/cosmos/lunie/pull/4784) Add networkId field to TransactionV2 @Bitcoinera
- [#4724](https://github.com/cosmos/lunie/pull/4724) Update to polkadot/api 1.29.1 @Bitcoinera
- [#4756](https://github.com/cosmos/lunie/pull/4756) Update to polkadot/api 1.30.1 @Bitcoinera
- [#4788](https://github.com/cosmos/lunie/pull/4788) Update to polkadot/api-1.31.2 @Bitcoinera
- Add transaction receive to the topics for pushed notifications @faboweb

### Fixed

- [#4743](https://github.com/cosmos/lunie/pull/4743) Fix available balance in Polkadot by removing miscFrozen @Bitcoinera
- [#4737](https://github.com/cosmos/lunie/pull/4737) Fix balance query getCoinLookup @Bitcoinera
- [#4740](https://github.com/cosmos/lunie/pull/4740) Fixes topVoters for GovernanceOverview in Cosmos @Bitcoinera
- Notifications were not showing in some cases @faboweb
- Fix transaction reducer in polling for tx success failing @faboweb
- Id was not unique for undelegations @faboweb

## [1.0.44] - 2020-08-14

### Changed

- [#4679](https://github.com/cosmos/lunie/issues/4679) Add field icon to coinLookup @Bitcoinera

### Fixed

- Notifications were not showing in some cases @faboweb
- Fix transaction reducer in polling for tx success failing @faboweb
- Id was not unique for undelegations @faboweb

## [1.0.43] - 2020-08-14

### Added

- Send push notification and register devices for push notifications @faboweb
- [# 4518](https://github.com/cosmos/lunie/issues/ 4518) Add sessions to allow multiple sign ins @faboweb

### Changed

- [#4691](https://github.com/cosmos/lunie/pull/4691) Update to @polkadot/api 1.28.1 @Bitcoinera
- Disable voting power notifications @faboweb
- change language for notification messages @jbibla

### Fixed

- [#4682](https://github.com/cosmos/lunie/pull/4682) Fix querying for single validator in Akash @Bitcoinera
- Undelegations were not counted towards total balance in Cosmos @faboweb

### Code Improvements

- removed console logs as it's considered a best practice @jbibla

## [1.0.42] - 2020-08-03

### Changed

- [#4646](https://github.com/cosmos/lunie/pull/4646) Update to @polkadot/api-1.27.1 @Bitcoinera

### Fixed

- [#4641](https://github.com/cosmos/lunie/issues/4641) Fix sending BNB transactions in Kava failing due to fees @Bitcoinera

## [1.0.41] - 2020-07-30

### Added

- added support for multiple curves or HD Paths for different networks @bitcoinera

### Changed

- Limit missed blocks on Kava to min 5 as the chain is too fast @faboweb

### Fixed

- [#4592](https://github.com/cosmos/lunie/issues/4592) Fix multi denom rewards not displaying correctly by taking rewards into account when querying for balances @Bitcoinera
- Total was not showing frozen token in Polkadot @faboweb
- Handle failing fiat values query gracefully @faboweb
- Catch firebase error if the uid is not registered @faboweb
- Fix Transaction meta data query (missing parameter) @faboweb
- Handle batch transactions failing @faboweb

## [1.0.40] - 2020-07-29

### Added

- added support for multiple curves or HD Paths for different networks @bitcoinera

### Changed

- Limit missed blocks on Kava to min 5 as the chain is too fast @faboweb

### Fixed

- [#4592](https://github.com/cosmos/lunie/issues/4592) Fix multi denom rewards not displaying correctly by taking rewards into account when querying for balances @Bitcoinera
- Total was not showing frozen token in Polkadot @faboweb
- Handle failing fiat values query gracefully @faboweb
- Fix Transaction meta data query (missing parameter) @faboweb
- Handle batch transactions failing @faboweb

## [1.0.39] - 2020-07-27

### Added

- [#4596](https://github.com/cosmos/lunie/pull/4596) Add accountTypes array and defaultAccountType to the Network Object @Bitcoinera

### Changed

- [#4558](https://github.com/cosmos/lunie/pull/4558) CoinReducer and rewardCoinReducer now work using coinLookup to get chainToViewConversionFactor @Bitcoinera
- [#4595](https://github.com/cosmos/lunie/pull/4595) Upgrade to polkadot api 1.26.1 @Bitcoinera

### Fixed

- [#4536](https://github.com/cosmos/lunie/issues/4536) Fix inaccurate Kava BNB balances @Bitcoinera

### Deprecated

- [#4558](https://github.com/cosmos/lunie/pull/4558) Deprecate overview query @Bitcoinera

## [1.0.38] - 2020-07-23

### Added

- [#4541](https://github.com/cosmos/lunie/issues/4541) Upgrade Polkadot js api to v1.25.1 @mariopino

### Changed

- [#4525](https://github.com/cosmos/lunie/issues/4525) Filter validator added notifications out @Bitcoinera
- [#4525](https://github.com/cosmos/lunie/issues/4525) Fix voting power changes messages displaying less decimals and percentage symbols @Bitcoinera
- [#4568](https://github.com/cosmos/lunie/pull/4568) Add DOT to supported fiatValues @Bitcoinera

### Fixed

- [#4537](https://github.com/cosmos/lunie/issues/4537) Fix Kava BNB SendModal by fixing gas price denom @Bitcoinera
- [#4556](https://github.com/cosmos/lunie/pull/4556) Fix storing statistics due to invalid numeric type for amount @Bitcoinera
- [#4568](https://github.com/cosmos/lunie/pull/4568) Fix transaction by making fee an iterable @Bitcoinera
- [#4544](https://github.com/cosmos/lunie/issues/4544) Parse extrinsic result properly in polkadot @mariopino

## [1.0.37] - 2020-07-17

### Added

- Register users for email notifications and send email notifications @faboweb

### Fixed

- [#4532](https://github.com/cosmos/lunie/pull/4532) Fix dashboard/statistics for Substrate transactions @Bitcoinera

### Code Improvements

- [#4533](https://github.com/cosmos/lunie/pull/4533) Refactored accounts logic into own file @faboweb

## [1.0.36] - 2020-07-16

### Added

- [#4524](https://github.com/cosmos/lunie/pull/4524) Reintroduce really disabling networks by filtering out (i.e. not running) disabled networks @Bitcoinera
- Added slashing events @faboweb
- [#4497](https://github.com/cosmos/lunie/issues/4497) Upgrade polkadot api to v1.24.1 @mariopino

### Fixed

- [#3512](https://github.com/cosmos/lunie/issues/3512) Fix dashboard by deprecating the overview query and using balances and rewards queries instead @Bitcoinera
- [#4506](https://github.com/cosmos/lunie/pull/4506) Fix double balances in Tendermint networks @Bitcoinera
- [#4470](https://github.com/cosmos/lunie/issues/4470) Takes always onchain names to fix amp; issue @faboweb
- [#4515](https://github.com/cosmos/lunie/issues/4515) Show staking balance of 0 if user has no delegations and no tokens @faboweb
- [#4490](https://github.com/cosmos/lunie/issues/4490) Total was not showing if no staking denom in balances @faboweb
- [#4511](https://github.com/cosmos/lunie/issues/4511) Added denom to rewards id to prevent caching issues @faboweb
- [#4510](https://github.com/cosmos/lunie/issues/4510) Fix polkadot rewards @mariopino

## [1.0.35] - 2020-07-08

### Added

- [#4365](https://github.com/cosmos/lunie/issues/4365) Store blockStore in DB and boosts API startup by taking initial values from DB. Delete now deprecated validators cache @Bitcoinera

### Changed

- [#4458](https://github.com/cosmos/lunie/pull/4458) Add the new Substrate networks RPC endpoints to our CSP @Bitcoinera
- [#4469](https://github.com/cosmos/lunie/pull/4469) Deactivate store blockStore in DB and retrieve it for now @Bitcoinera
- [#4409](https://github.com/cosmos/lunie/pull/4409) Upgrade Akash to Phase 2 @Bitcoinera

### Fixed

- Only escape values of objects when writing to db @faboweb
- Remove serialization fix for notifications @faboweb

### Code Improvements

- [#4367](https://github.com/cosmos/lunie/issues/4367) Add id field to all the relevant Object types @Bitcoinera

## [1.0.34] - 2020-07-06

### Added

- Store validator keybase hash and twitter handle @faboweb
- [#4430](https://github.com/cosmos/lunie/issues/4430) Upgrade @polkadot/api to v1.23.1 @mariopino

### Changed

- [#4373](https://github.com/cosmos/lunie/pull/4373) Use Polkadot connection script @faboweb
- [#4235](https://github.com/cosmos/lunie/pull/4235) Enabled field in network can be overwritten by its value on DB table "networks" @Bitcoinera

### Fixed

- Pass networks to getNotifications @faboweb
- [#4400](https://github.com/cosmos/lunie/issues/4400) Fix all delegators query in polkadot @mariopino

## [1.0.33] - 2020-07-02

### Added

- Store slashes in DB @faboweb

### Changed

- Remove Polkadot API disconnection as memory leak has been fixed @faboweb
- Switch to Figment full node for Cosmos Hub and add Pengs as Tendermint @faboweb

### Fixed

- [#4402](https://github.com/cosmos/lunie/issues/4402) Fix annualizedValidatorReward in Polkadot mainnet @mariopino
- [#4406](https://github.com/cosmos/lunie/issues/4406) Fix polkadot testnet (westend) lock-up period @mariopino

## [1.0.32] - 2020-07-02

### Fixed

- Updated Polkadot @faboweb

## [1.0.31] - 2020-06-30

### Changed

- [#4377](https://github.com/cosmos/lunie/pull/4377) Update polkadot api to v1.21.1 @Bitcoinera

### Repository

- [#4375](https://github.com/cosmos/lunie/pull/4375) Release of API v1.0.30 @Bitcoinera

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

- [#4295](https://github.com/cosmos/lunie/issues/4295) Adds some user management to API with the store and getUser functions @Bitcoinera
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
- [#4161](https://github.com/cosmos/lunie/issues/4161) Fix wrong status detailed in kusama validators @mariopino
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
- [#801](https://github.com/cosmos/lunie/pull/801) Releases Kava by enabling it @Bitcoinera
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
-     Handle no delegations in Polkadot better @faboweb
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
