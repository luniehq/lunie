# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!-- SIMSALA --> <!-- DON'T DELETE, used for automatic changelog updates -->

## [1.0.234] - 2020-11-04

### Changed

- [#5183](https://github.com/cosmos/lunie/pull/5183) Upgrade to emoney-2 @Bitcoinera

## [1.0.233] - 2020-10-23

### Added

- [#5143](https://github.com/cosmos/lunie/issues/5143) Add Show Seed feature to UserMenu @Bitcoinera
- [#5117](https://github.com/cosmos/lunie/issues/5117) Lunie supports now IOV starnames @faboweb

### Changed

- [#5098](https://github.com/cosmos/lunie/issues/5098) Make possible for MaintenanceBar to be network specific @Bitcoinera
- [#5119](https://github.com/cosmos/lunie/issues/5119) Don't encourage proposal creation for Polkadot networks @Bitcoinera
- [#5147](https://github.com/cosmos/lunie/pull/5147) Some little improvements from suggestions regarding the Manage address feature on UserMenu @Bitcoinera
- remove intercom capacitor from mobile to resolve build issue @jbibla
- bump capacitor version @jbibla
- [#5127](https://github.com/cosmos/lunie/issues/5127) Update polkadot-js/api to release v2.3.1 @mariopino

### Fixed

- [#4989](https://github.com/cosmos/lunie/pull/4989) Fix vote display on PageProposal @Bitcoinera

### Deprecated

- [#5114](https://github.com/cosmos/lunie/pull/5114) Remove unused publish.sh from tasks folder @Bitcoinera

## [1.0.232] - 2020-10-13

### Added

- [#4513](https://github.com/cosmos/lunie/issues/4513) Add "Forget Account" feature to AccountMenu @Bitcoinera

### Changed

- [#5066](https://github.com/cosmos/lunie/pull/5066) Add the kava-testnet network icon @Bitcoinera
- [#5079](https://github.com/cosmos/lunie/pull/5079) Lint the whole app subrepo (22 files) @Bitcoinera
- [#5084](https://github.com/cosmos/lunie/pull/5084) Upgrate to polkadot/api-2.2.1 @Bitcoinera
- [#5040](https://github.com/cosmos/lunie/pull/5040) Upgrade to polkadot/api-2.1.1 @Bitcoinera

### Fixed

- [#5071](https://github.com/cosmos/lunie/pull/5071) Fix ActionModal opening when in Explore mode @Bitcoinera

### Repository

- [#3699](https://github.com/cosmos/lunie/issues/3699) Delete the components/wallet folder @Bitcoinera
- [#5068](https://github.com/cosmos/lunie/pull/5068) Add the components/session folder @Bitcoinera

## [1.0.231] - 2020-10-06

### Changed

- [#5066](https://github.com/cosmos/lunie/pull/5066) Add the kava-testnet network icon @Bitcoinera 
- [#5040](https://github.com/cosmos/lunie/pull/5040) Upgrade to polkadot/api-2.1.1 @Bitcoinera

## [1.0.230] - 2020-10-02

### Changed

- [#5018](https://github.com/cosmos/lunie/pull/5018) Use the correct Kava USDX icon @Bitcoinera

## [1.0.229] - 2020-10-01

### Added

- added another app ID to app site association @jbibla

### Changed

- [#5011](https://github.com/cosmos/lunie/pull/5011) Update to polkadot/api-2.0.1 @Bitcoinera

### Fixed

- [#4986](https://github.com/cosmos/lunie/pull/4986) Fix ModalPropose when no governance parameters query @Bitcoinera
- [#4991](https://github.com/cosmos/lunie/issues/4991) Fix loader constantly appearing on PageTransactions @Bitcoinera
- [#5001](https://github.com/cosmos/lunie/pull/5001) Fix missing Akash Mainnet icon for accounts on UserMenu @Bitcoinera
- [#5012](https://github.com/cosmos/lunie/pull/5012) Fix displaying only 15 validators on TableValidators when filters are used @Bitcoinera
- [#5002](https://github.com/cosmos/lunie/pull/5002) Fix signing for Akash Mainnet not enabled @Bitcoinera
- [#4627](https://github.com/cosmos/lunie/pull/4627) Fix navigation duplicated in recover flow by deleting duplicate goToNetwork logic @Bitcoinera
- Accounts would not be created in desired network @faboweb

## [1.0.228] - 2020-09-22

### Added

- [#4870](https://github.com/cosmos/lunie/issues/4870) Added message about rewards being automatically claimed by validators @faboweb
- [#4878](https://github.com/cosmos/lunie/issues/4878) Add withdraw unstaked button @faboweb
- Adds tracking of address to Sentry for easier debugging of queries @faboweb
- new components for page proposal @jbibla
- [#4902](https://github.com/cosmos/lunie/issues/4902) New governance layout date format @mariopino
- [#4923](https://github.com/cosmos/lunie/issues/4923) Governance number formats @mariopino
- [#4925](https://github.com/cosmos/lunie/issues/4925) Add anchors to governance @mariopino

### Changed

- [#4899](https://github.com/cosmos/lunie/issues/4899) Use ModalDeposit for Polkadot Democracy proposals @Bitcoinera
- [#4903](https://github.com/cosmos/lunie/issues/4903) Use loadMore logic to load participants in batches in ParticipantList if the user clicks a button @Bitcoinera
- [#4917](https://github.com/cosmos/lunie/issues/4917) Add parameters to Polkadot Democracy proposals @Bitcoinera
- [#4930](https://github.com/cosmos/lunie/pull/4930) Remove the no-scroll plugin @Bitcoinera
- [#4926](https://github.com/cosmos/lunie/pull/4926) Format addresses on ParticipantList when participants have no name @Bitcoinera
- [#4939](https://github.com/cosmos/lunie/pull/4939) Fix the showAmounts logic for ParticipantList @Bitcoinera
- [#4940](https://github.com/cosmos/lunie/pull/4940) Improve loading logic for PageProposals @Bitcoinera
- [#4857](https://github.com/cosmos/lunie/pull/4857) Recover Browser Extension sign in for now on CardSignInRequired @Bitcoinera
- [#4978](https://github.com/cosmos/lunie/pull/4978) Query for topVoter picture @Bitcoinera
- [#4884](https://github.com/cosmos/lunie/pull/4884) Update to @polkadot/api 1.33.1 @Bitcoinera
- [#4952](https://github.com/cosmos/lunie/pull/4952) Update to polkadot/api-1.34.1 @Bitcoinera
- [#4805](https://github.com/cosmos/lunie/issues/4805) Notifications are now the homepage when user is signed in @faboweb
- [#4873](https://github.com/cosmos/lunie/issues/4873) Use our API to stitch Polkadot claim txs to improve performance @faboweb
- Sort participants to show validators first @faboweb
- [#4960](https://github.com/cosmos/lunie/pull/4960) Remove New Parameter in ProposalDescription @faboweb
- hide vote summary on deposit proposals @jbibla
- [#4935](https://github.com/cosmos/lunie/pull/4935) Fix ProposalDescription to display changes. Also for other proposal types @Bitcoinera

### Fixed

- [#4954](https://github.com/cosmos/lunie/pull/4954) Fix Polkadot deposits not displaying on FE @Bitcoinera
- [#4913](https://github.com/cosmos/lunie/pull/4913) Fix Polkadot voting having wrong proposalId (text with proposal type) @Bitcoinera
- [#4912](https://github.com/cosmos/lunie/pull/4912) Fix currencies icons in BalanceRow component @Bitcoinera
- [#4976](https://github.com/cosmos/lunie/pull/4976) Fix old proposalId messing up proposal query and co. @Bitcoinera
- [#4930](https://github.com/cosmos/lunie/pull/4930) Fixes the weird CSS bug appearing when opening ActionModal and not being on the top @Bitcoinera
- Show actual deposit for seconding in Polkadot @faboweb
- Show network images for participants with images @faboweb
- Handle unknown future timeline items @faboweb
- Show images for validators in participation @faboweb
- Show validator images in governance for Polkadot @faboweb
- [#4858](https://github.com/cosmos/lunie/issues/4858) Show that unstaking balance is claimable @faboweb
- changed colors on vote modal to improve visibility of text @jbibla
- styling and layout fixes for governance @jbibla
- proposal status bar and tally should display correct data for all proposal types @jbibla
- [#4849](https://github.com/cosmos/lunie/issues/4849) Change Westend RPC @mariopino
- [#4885](https://github.com/cosmos/lunie/issues/4885) Fix Google Analytics CSP error @mariopino

### Code Improvements

- Use staked balance from API @faboweb
- skip querying proposals to avoid console errors when switching networks @jbibla

## [1.0.227] - 2020-09-08

### Added

- [#4665](https://github.com/cosmos/lunie/issues/4665) UserMenu now displays also local and extension accounts @Bitcoinera
- [#4828](https://github.com/cosmos/lunie/issues/4828) Allow signout from ledger and explore addresses @faboweb
- Handle errors in boot process to make debugging easier for us and users @faboweb

### Changed

- [#4773](https://github.com/cosmos/lunie/issues/4773) Display Stake button on Portfolio for Substrate networks @Bitcoinera
- [#4787](https://github.com/cosmos/lunie/pull/4787) Make sure stake button displays properly on Portfolio for Substrate networks @Bitcoinera
- [#4783](https://github.com/cosmos/lunie/pull/4783) Show Select and Deselect on PageValidator instead of Stake and Unstake for Substrate networks @Bitcoinera
- [#4819](https://github.com/cosmos/lunie/pull/4819) Proposer is now an Object ({address, name, picture}) @Bitcoinera
- [#4807](https://github.com/cosmos/lunie/pull/4807) Document the use of the network flag for E2E tests @Bitcoinera
- [#4826](https://github.com/cosmos/lunie/pull/4826) Disable Vote button for treasury proposals @Bitcoinera
- [#4834](https://github.com/cosmos/lunie/pull/4834) Update to @polkadot/api-1.32.1 @Bitcoinera

### Security

- Check sign in redirect links for correct domain @faboweb

## [1.0.226] - 2020-09-01

### Added

- [#4738](https://github.com/cosmos/lunie/issues/4738) Enable voting in Polkadot/Substrate @Bitcoinera
- [#4760](https://github.com/cosmos/lunie/issues/4760) Add Unstake button for Substrate in Porfolio @Bitcoinera
- added another app ID to app site association @jbibla

### Changed

- [#4667](https://github.com/cosmos/lunie/issues/4667) Display Polkadot undelegations with the LiBalance component @Bitcoinera
- [#4679](https://github.com/cosmos/lunie/issues/4679) Redenominate DOT adding the icon field to coinLookup @Bitcoinera
- [#4746](https://github.com/cosmos/lunie/issues/4746) Add LiBalance component @Bitcoinera
- [#4775](https://github.com/cosmos/lunie/pull/4775) Avoid displaying staked balance in Your Stake that is already unbonding in Polkadot @Bitcoinera
- [#4724](https://github.com/cosmos/lunie/pull/4724) Update to polkadot/api 1.29.1 @Bitcoinera
- [#4756](https://github.com/cosmos/lunie/pull/4756) Update to polkadot/api 1.30.1 @Bitcoinera
- [#4788](https://github.com/cosmos/lunie/pull/4788) Update to polkadot/api 1.31.2 @Bitcoinera
- [#4507](https://github.com/cosmos/lunie/pull/4507) Accomodate Substrate proposals as new governance interface first step @Bitcoinera

### Fixed

- [#4774](https://github.com/cosmos/lunie/pull/4774) Fix lockUpPeriod missing from Network query @Bitcoinera
- [#4744](https://github.com/cosmos/lunie/pull/4744) Fixes wasm-crypto not initialized in extension @Bitcoinera
- [#4627](https://github.com/cosmos/lunie/pull/4627) Fix navigation duplicated in recover flow by deleting duplicate goToNetwork logic @Bitcoinera
- [#4784](https://github.com/cosmos/lunie/pull/4784) Fix transaction details validators links @Bitcoinera
- [#4784](https://github.com/cosmos/lunie/pull/4784) Fix transaction size too big due to Polkadot validators names @Bitcoinera
- Accounts would not be created in desired network @faboweb
- [#4778](https://github.com/cosmos/lunie/issues/4778) Fix Polkadot e2e tests @mariopino
- intercom links need a class for web!  @jbibla

### Repository

- setting up iOS push notifications @jbibla
- changed a bunch of names of CI jobs and disabled polkadot e2e and codecov @jbibla

## [1.0.225] - 2020-08-14

### Added

- Added another App ID to app site association @jbibla

### Fixed

- [#4627](https://github.com/cosmos/lunie/pull/4627) Fix navigation duplicated in recover flow by deleting duplicate goToNetwork logic @Bitcoinera
- Accounts would not be created in desired network @faboweb

### Deprecated

- fixed manifest image routes for Android @jbibla

## [1.0.224] - 2020-08-14

### Added

- [#4496](https://github.com/cosmos/lunie/pull/4496) Enable deep linking to allow magic link signIn on app @Bitcoinera
- Add Polkadot account type to user menu address @faboweb
- [#4518](https://github.com/cosmos/lunie/issues/4518) Add sessions to allow multiple sign ins @faboweb

### Changed

- [#4679](https://github.com/cosmos/lunie/issues/4679) Rename the DOT icon file @Bitcoinera
- [#4684](https://github.com/cosmos/lunie/issues/4684) Remove AppMenu Sign In/Sign Up button @Bitcoinera
- [#4685](https://github.com/cosmos/lunie/issues/4685) Remove experimentalMode wall for notification & UserMenu @Bitcoinera
- [#4691](https://github.com/cosmos/lunie/pull/4691) Update to @polkadot/api 1.28.1 @Bitcoinera
- [#4646](https://github.com/cosmos/lunie/pull/4646) Update to @polkadot/api-1.27.1 @Bitcoinera
- [#4701](https://github.com/cosmos/lunie/pull/4701) Deactivate transactions notifications links @Bitcoinera
- [#4701](https://github.com/cosmos/lunie/pull/4701) Watch immediately for userSignedIn in Paywall @Bitcoinera
- fixes for email auth modal showing more than one message at a time @jbibla
- adjusted session frame click handler @jbibla

### Fixed

- [#4626](https://github.com/cosmos/lunie/pull/4626) Fix navigation duplicated in recover flow by deleting duplicate goToNetwork logic @Bitcoinera
- Handle account creation in extension not showing insecure warning @faboweb
- Magic links were not handled on desktop @faboweb
- Use Polkadot API signing to fix signing on mainet @faboweb
- the magic link error modal button redirected to the wrong modal @jbibla
- removed emoji in favour of more standardized material-icon @jbibla

### Security

- [#4639](https://github.com/cosmos/lunie/pull/4639) Twitter images should come from HTTPS @Bitcoinera
- [#4639](https://github.com/cosmos/lunie/pull/4639) Add upgrade-insecure-requests directive to CSP @Bitcoinera

### Deprecated

- [#4659](https://github.com/cosmos/lunie/pull/4659) Remove web3-utils module @Bitcoinera

## [1.0.223] - 2020-07-30

### Added

- [#3929](https://github.com/cosmos/lunie/issues/3929) It is possible to restore an account using different algos / derivation paths. In polkadot you sign transactions with it @Bitcoinera
- added an apple app site association file @jbibla

### Changed

- [#4570](https://github.com/cosmos/lunie/pull/4570) When selecting a network in PageNetworks user is taken to that network's porfolio @Bitcoinera
- Update the account role after bonding @faboweb
- the account list styles were broken. the show seed option is hidden on web now. style improvements.  @jbibla
- after a user clicks the magic link they will now see a modal instead of a page - also updated the copy @jbibla
- cleaning up some style inconsistencies and side effects @jbibla

### Deprecated

- removing redundant content pages @jbibla

## [1.0.222] - 2020-07-29

### Added

- [#3929](https://github.com/cosmos/lunie/issues/3929) It is possible to restore an account using different algos / derivation paths. In polkadot you sign transactions with it @Bitcoinera
- added an apple app site association file @jbibla

### Changed

- [#4570](https://github.com/cosmos/lunie/pull/4570) When selecting a network in PageNetworks user is taken to that network's porfolio @Bitcoinera
- Update the account role after bonding @faboweb
- cleaning up some style inconsistencies and side effects @jbibla

## [1.0.221] - 2020-07-27

### Added

- [#4496](https://github.com/cosmos/lunie/pull/4496) Enable deep linking to allow magic link signIn on app @Bitcoinera
- added an apple app site association file @jbibla

### Changed

- [#4570](https://github.com/cosmos/lunie/pull/4570) When selecting a network in PageNetworks user is taken to that network's porfolio @Bitcoinera
- [#4595](https://github.com/cosmos/lunie/pull/4595) Upgrade to polkadot api 1.26.1 @Bitcoinera

### Fixed

- [#4580](https://github.com/cosmos/lunie/issues/4580) Fix the NavigationDuplicated error @Bitcoinera
- [#4591](https://github.com/cosmos/lunie/pull/4591) Fix extension adding setNetwork to the selectNetworkHandler @Bitcoinera
- Fix issue in Safari about exports @faboweb

### Deprecated

- [#4558](https://github.com/cosmos/lunie/pull/4558) Deprecate overview in action modals @Bitcoinera

## [1.0.220] - 2020-07-23

### Added

- Register clients for Email notifications @faboweb
- [#4541](https://github.com/cosmos/lunie/issues/4541) Upgrade Polkadot js api to v1.25.1 @mariopino

### Changed

- [#4525](https://github.com/cosmos/lunie/issues/4525) CardSignIn is now a modal @Bitcoinera
- [#4525](https://github.com/cosmos/lunie/issues/4525) Notifications page becomes landing page when user is signed in with email @Bitcoinera
- [#4562](https://github.com/cosmos/lunie/pull/4562) Change close action in SessionFrame to make sense @Bitcoinera
- [#4568](https://github.com/cosmos/lunie/pull/4568) Make block height in TmConnectedNetwork non-clickable if feature Activity is disabled @Bitcoinera
- [#4525](https://github.com/cosmos/lunie/issues/4525) ux improvements for notifications page @jbibla

### Fixed

- [#4518](https://github.com/cosmos/lunie/issues/4518) Fix sending an expired idToken from localStorage to API (Apollo) @Bitcoinera
- [#4534](https://github.com/cosmos/lunie/pull/4534) Fix the loading for notifications in PageNotifications bringing back the lunie SVG loader @Bitcoinera
- [#4548](https://github.com/cosmos/lunie/pull/4548) Fix network item continuously displaying as loading @Bitcoinera
- some route names were lowercase and some were uppercase and some router.push's were failing as a result @jbibla
- router guard was sending user to an invalid route @jbibla

## [1.0.219] - 2020-07-16

### Added

- [#4392](https://github.com/cosmos/lunie/issues/4392) Polkadot e2e tests @mariopino
- [#4497](https://github.com/cosmos/lunie/issues/4497) Upgrade polkadot api to v1.24.1 @mariopino

### Changed

- [#3660](https://github.com/cosmos/lunie/issues/3660) Add the guide link to the memo field @Bitcoinera
- cleaning up initial version of email auth and new user menu @jbibla

### Fixed

- [#4489](https://github.com/cosmos/lunie/issues/4489) Fix Paywall overflow and colors not using variables @Bitcoinera
- Fix Android build @faboweb
- Fix interface E2E tests @faboweb
- Stored sessions had old network not the new one from the desired target network @faboweb
- Connect to the first found network if desired network not found (fixes issues with local API) @faboweb

### Deprecated

- removed a bunch of unused components and associated tests @jbibla

### Code Improvements

- [#4042](https://github.com/cosmos/lunie/issues/4042) cleaning up TmPage part 1 @jbibla

## [1.0.218] - 2020-07-09

### Added

- [#4399](https://github.com/cosmos/lunie/issues/4399) Add the Paywall componen to restrict access to notifications @Bitcoinera

### Changed

- [#4472](https://github.com/cosmos/lunie/pull/4472) Display signIn error with Firebase on SignInModal @Bitcoinera
- [#4466](https://github.com/cosmos/lunie/pull/4466) Adapt AccountMenu styles to extension @Bitcoinera
- [#4409](https://github.com/cosmos/lunie/pull/4409) Rename Akash token icon to akash.png @Bitcoinera

### Fixed

- [#4367](https://github.com/cosmos/lunie/issues/4367) Fix GraphQL queries not coming from cache @Bitcoinera
- [#4422](https://github.com/cosmos/lunie/issues/4422) Fix missing active validators in Westend when filtering for "Active" @Bitcoinera
- [#4457](https://github.com/cosmos/lunie/issues/4457) Fix wrong network detected for substrate address in explore mode @mariopino

## [1.0.217] - 2020-07-06

### Added

- [#4275](https://github.com/cosmos/lunie/pull/4275) Adds the user menu with the new sign in and sign out logic  @team
- [#4430](https://github.com/cosmos/lunie/issues/4430) Upgrade @polkadot/api to v1.23.1 @mariopino

### Fixed

- [#4426](https://github.com/cosmos/lunie/issues/4426) Fix Polkadot expectedRewards being shown as NaN @Bitcoinera
- [#4432](https://github.com/cosmos/lunie/issues/4432) Fix addressObjects being invalid NotificationInput type @Bitcoinera
- [#4376](https://github.com/cosmos/lunie/pull/4376) Fix many little old Polkadot-related bugs such as reward.filter, filterStakingDenomReward... @Bitcoinera
- [#4428](https://github.com/cosmos/lunie/pull/4428) Fix the network ordering by using the default field @Bitcoinera
- [#4421](https://github.com/cosmos/lunie/pull/4421) Fixes icon circle showing on SessionFrame when no icon @Bitcoinera
- [#4421](https://github.com/cosmos/lunie/pull/4421) Fixes TmSelectNetwork leaving networks out in the Sign Up/Create account flow @Bitcoinera
- Deploy app in develop on every change @faboweb
- [#4406](https://github.com/cosmos/lunie/issues/4406) Fix wrong lockup period in susbtrate networks @mariopino

### Code Improvements

- [#4369](https://github.com/cosmos/lunie/issues/4369) Refactor connecting to polkadot API directly on network connection and saving it to store (connection) @Bitcoinera

### Repository

- Removing Capacitor libraries to only add them when actually building the apps @faboweb

## [1.0.216] - 2020-07-02

### Changed

- [#4326](https://github.com/cosmos/lunie/issues/4326) Add tests for all the new account components and module @Bitcoinera

### Security

- Updated Polkadot @faboweb

## [1.0.215] - 2020-06-30

### Added

- [#4281](https://github.com/cosmos/lunie/issues/4281) Add polkadot testnet network (Westend) @mariopino

### Changed

- [#4149](https://github.com/cosmos/lunie/issues/4149) Adds the user authentication token to ApolloClient @Bitcoinera
- [#4372](https://github.com/cosmos/lunie/pull/4372) Add TmDataLoading to PageNotifications and a spinner for the dynamic notifications loading @Bitcoinera
- [#4372](https://github.com/cosmos/lunie/pull/4372) Hide 0 fiat values in TmBalance @Bitcoinera
- [#4361](https://github.com/cosmos/lunie/pull/4361) Add Kava token icons for BNB and USDX @Bitcoinera
- [#4377](https://github.com/cosmos/lunie/pull/4377) Update polkadot api to v1.21.1 @Bitcoinera
- Add develop preview and change to nice URLs @faboweb

### Code Improvements

- Optimize initial loading of the app by splitting dependencies @faboweb

## [1.0.214] - 2020-06-23

### Added

- [#4147](https://github.com/cosmos/lunie/issues/4147) Adds sign in and sign out using Firebase auth and store @Bitcoinera
- Register users in DB @faboweb
- [#3894](https://github.com/cosmos/lunie/issues/3894) Validator list UX improvements @Bitcoinera @mariopino
- [#3995](https://github.com/cosmos/lunie/issues/3995) Handle polkadot election period @mariopino
- [#4328](https://github.com/cosmos/lunie/issues/4328) Upgrade Polkadot js api to v1.20.1 @mariopino
- [#4233](https://github.com/cosmos/lunie/issues/4233) Adds the seed export feature @team

### Changed

- [#4324](https://github.com/cosmos/lunie/pull/4324) Styles the action modal so there is not too much space between header and body @Bitcoinera

### Fixed

- Fix location of capacitor plugins for mobile builds @faboweb
- Update Capacitor to fix build issues @faboweb

## [1.0.213] - 2020-06-17

### Added

- akash theme @jbibla
- [#4299](https://github.com/cosmos/lunie/issues/4299) Upgrade polkadot api to v1.19.1 @mariopino

### Changed

- remove default message from lunie send transactions @jbibla

### Security

- Update node-addon-api because of a security issue @faboweb

## [1.0.212] - 2020-06-11

### Added

- [#771](https://github.com/cosmos/lunie/issues/771) Adds a bubble on the notifications icon counting every new notification until user visits PageNotification @Bitcoinera
- [#4207](https://github.com/cosmos/lunie/pull/4207) Adds the popularity selector to TableValidators @Bitcoinera
- Add pagination to page notifications  @faboweb
- Add subscription for new notifications to page notifications @faboweb
- [#4230](https://github.com/cosmos/lunie/issues/4230) Add Polkadot CC1 network @mariopino
- Improve polkadot address validation, fix 'Cannot use GraphQLSchema' error in frontend @mariopino

### Changed

- [#4250](https://github.com/cosmos/lunie/pull/4250) Adds CAD as a fiat currency @Bitcoinera

### Fixed

- [#4236](https://github.com/cosmos/lunie/pull/4236) Fixes experimental flag not working @Bitcoinera
- Fix naming of currency icons @faboweb
- Update Polkadot library @faboweb

### Code Improvements

- [#4216](https://github.com/cosmos/lunie/pull/4216) Move dependabot config to root folder of monorepo @Bitcoinera
- Use BalancesV2 enpoint in TmBalance @faboweb
- Refactor list logic into own component @faboweb

### Repository

- [#4211](https://github.com/cosmos/lunie/pull/4211) Adjusted GitHub Actions for app @faboweb
- Fix e2e @faboweb

## [1.0.211] - 2020-06-03

### Fixed

- Fix balances showing in other denom (network id would change internally) @faboweb
- Fix show is undefined on validator page @faboweb

## [1.0.210] - 2020-06-02

### Added

- [#4134](https://github.com/cosmos/lunie/pull/4134) Now maintenance bar can display links and a button to visit that link @Bitcoinera
- Allow testing fees in development for any address @faboweb

### Changed

- [#4190](https://github.com/cosmos/lunie/pull/4190) Adds module @vue/babel-preset-app to fix unit tests @Bitcoinera
- [#4175](https://github.com/cosmos/lunie/pull/4175) Removes the 718 era warning and the Ledger limitation message on ModalWithdrawRewards for Polkadot @Bitcoinera

### Fixed

- [#4169](https://github.com/cosmos/lunie/issues/4169) Fixes Kava voting modal not having the right styles to highlight the selection @Bitcoinera
- [#4183](https://github.com/cosmos/lunie/pull/4183) Fixes selectedToken being undefined in SendModal in second load @Bitcoinera
- Fix balances not updating in ActionModal when switching networks @faboweb
- [#4188](https://github.com/cosmos/lunie/issues/4188) Some routes would cause an error as we would detect features on non network routes @faboweb

## [1.0.209] - 2020-05-29

### Added

- [#4071](https://github.com/cosmos/lunie/issues/4071) Adds RestakeTx for Kusama @Bitcoinera

### Changed

- [#4154](https://github.com/cosmos/lunie/pull/4154) Fees in ActionModal are now fetched from API @Bitcoinera

### Fixed

- [#4168](https://github.com/cosmos/lunie/issues/4168) Fix error in staking using controller address in Polkadot @mariopino

## [1.0.208] - 2020-05-28

### Fixed

- [#4160](https://github.com/cosmos/lunie/issues/4160) Fixes staking for 'none' accounts in Polkadot @Bitcoinera

## [1.0.207] - 2020-05-27

### Fixed

- [#4145](https://github.com/cosmos/lunie/issues/4145) Fix bugs in unstake using controller address in polkadot @mariopino

## [1.0.206] - 2020-05-27

### Changed

- [#4146](https://github.com/cosmos/lunie/pull/4146) Fixes ActionModal z-index and closes it every time the AppMenu gets opened @Bitcoinera

### Fixed

- [#4142](https://github.com/cosmos/lunie/issues/4142) Fix bug in stake using stash address in polkadot @mariopino

## [1.0.205] - 2020-05-26

### Changed

- [#4050](https://github.com/cosmos/lunie/issues/4050) Adds an alternative fee logic for e-Money @Bitcoinera
- [#4110](https://github.com/cosmos/lunie/issues/4110) Apply Jordan's UX improvements to Kusama @Bitcoinera
- [#4135](https://github.com/cosmos/lunie/issues/4135) ActionModal does not overlap anymore AppMenu @Bitcoinera

### Fixed

- [#4125](https://github.com/cosmos/lunie/pull/4125) Fixes "Show address on ledger" link styles @Bitcoinera
- [#4127](https://github.com/cosmos/lunie/issues/4127) Fixes network not available in router featureAvailable @Bitcoinera
- [#4135](https://github.com/cosmos/lunie/issues/4135) Fixes ActionModal having balances from previous network when switching networks @Bitcoinera
- Improve E2E tests further @faboweb
- [#4109](https://github.com/cosmos/lunie/issues/4109) Disable next button in Unstake using a stash account in polkadot @mariopino
- [#4140](https://github.com/cosmos/lunie/issues/4140) Fix graphql error in validator page when user has not signed in yet @mariopino

### Deprecated

- [#4136](https://github.com/cosmos/lunie/pull/4136) Deletes TmNotification and TmNotifications components @Bitcoinera

### Repository

- [#4124](https://github.com/cosmos/lunie/pull/4124) Handle e2e temporary account funding race condition @faboweb

## [1.0.204] - 2020-05-23

### Fixed

- Readd handling of root route to forward to network @faboweb

## [1.0.203] - 2020-05-23

### Fixed

- Fix claiming not getting fees @faboweb

### Repository

- Updated Nightwatch to 1.3 @faboweb

## [1.0.202] - 2020-05-23

### Added

- added new network selector @jbibla

### Changed

- [#4106](https://github.com/cosmos/lunie/pull/4106) Adds Dependabot config to check only weekly for updates @Bitcoinera
- [#4091](https://github.com/cosmos/lunie/pull/4091) Add missing links to notifications in PageNotifications @Bitcoinera
- [#4115](https://github.com/cosmos/lunie/pull/4115) Polkadot fee is now fetched from API in ActionModal @Bitcoinera

### Fixed

- Make sure networks are loaded before router @faboweb

### Code Improvements

- Remove not needed dep @faboweb
- Updated ledger library @faboweb

## [1.0.201] - 2020-05-21

### Added

- [#3996](https://github.com/cosmos/lunie/issues/3996) Add Polkadot unstaking @faboweb

### Changed

- [#4081](https://github.com/cosmos/lunie/pull/4081) Adds a default Lunie theme (lunie-dark) @Bitcoinera
- [#4102](https://github.com/cosmos/lunie/pull/4102) Hide zero rewards on PageValidator @Bitcoinera

### Fixed

- [#4094](https://github.com/cosmos/lunie/issues/4094) Fixes account role detection on switching networks @Bitcoinera
- [#4103](https://github.com/cosmos/lunie/pull/4103) Fixes Kusama nominations replacing each other @Bitcoinera

### Code Improvements

- Updated avatar library @faboweb
- updated linting and removed unused tm-toggle component @jbibla

## [1.0.200] - 2020-05-19

### Added

- [#4017](https://github.com/cosmos/lunie/issues/4017) Detect polkadot address role and store in session @mariopino
- [#4017](https://github.com/cosmos/lunie/issues/4017) Allow actions based on the account role in Polkadot @mariopino
- [#4041](https://github.com/cosmos/lunie/pull/4041) Adds the notifications page @Team

### Changed

- [#4028](https://github.com/cosmos/lunie/pull/4028) Aims to fix numeric keyboard on some mobile devices lacking of decimal point @Bitcoinera
- [#3997](https://github.com/cosmos/lunie/pull/3997) Now the Success step in ActionModal shows a link to Activity page @Bitcoinera
- [#4034](https://github.com/cosmos/lunie/pull/4034) Makes the Back to Validators Button "smart" @Bitcoinera
- [#4070](https://github.com/cosmos/lunie/pull/4070) Remove Dawn network from coming soon @Bitcoinera

### Fixed

- [#3965](https://github.com/cosmos/lunie/issues/3965) Fixes getting insufficient fees error in e-Money and Kava mainnet by not applying adjustFeesToMaxPayable in those @Bitcoinera
- [#4024](https://github.com/cosmos/lunie/issues/4024) Fixes claim rewards denoms misplaces on ModalWithdrawRewards (multi-denom) @Bitcoinera
- [#4031](https://github.com/cosmos/lunie/issues/4031) Fixes Activity proposals links in Vote and Deposit details @Bitcoinera
- [#4032](https://github.com/cosmos/lunie/pull/4032) Fixes the Page404 links @Bitcoinera
- toggle buttons were broken @jbibla
- [#4067](https://github.com/cosmos/lunie/issues/4067) Disable "Set Max" button in stake for controller accounts in polkadot @mariopino

### Security

- Resolve security warning with http-proxy dependency @faboweb

### Code Improvements

- Applied linting due to package updates @faboweb
- Remove push notifications firebase @michielmulders

### Repository

- Fix a missing snap @faboweb

## [1.0.199] - 2020-05-12

### Changed

- [#4008](https://github.com/cosmos/lunie/issues/4008) Send Polkadot/Kusama fees to extension @Bitcoinera
- [#4018](https://github.com/cosmos/lunie/pull/4018) Adds kava-testnet to networkMessages @Bitcoinera
- buttons now have an optional loading state @jbibla

### Fixed

- [#3750](https://github.com/cosmos/lunie/issues/3750) Fixes selected fiat currency not being persisted @Bitcoinera
- [#4005](https://github.com/cosmos/lunie/issues/4005) Fixes Bad Proof error for Claiming Rewards in Kusama by claiming only rewards from era 718 onwards @Bitcoinera
- [#4023](https://github.com/cosmos/lunie/pull/4023) Fixes Terra fees for sending alt-tokens after async gasEstimate @Bitcoinera

### Security

- [#4015](https://github.com/cosmos/lunie/pull/4015) Fixes all dependencies vulnerabilities (for now) @Bitcoinera
- [#3992](https://github.com/cosmos/lunie/pull/3992) Change dynamic script tags to nonce instead of hash for CSP @michielmulders

## [1.0.198] - 2020-05-10

### Fixed

- [#4007](https://github.com/cosmos/lunie/pull/4007) Fix Next button in ActionModal always enabled even without Polkadot fees @Bitcoinera
- [#4013](https://github.com/cosmos/lunie/pull/4013) Remove firebase init as it breaks apps and doesn't work in Brave @faboweb

## [1.0.197] - 2020-05-08

### Changed

- Disable push notification registration in production @faboweb

### Fixed

- Wait for wasm to have been loaded @faboweb

## [1.0.196] - 2020-05-07

### Added

- Show Polkadot fees @faboweb
- proper kava theme colors and related style improvements @jbibla
- [#3972](https://github.com/cosmos/lunie/issues/3972) Upgrade polkadot api to v1.12.2 @mariopino
- [#3924](https://github.com/cosmos/lunie/issues/3924) Add claiming rewards in Polkadot @mariopino
- Add push notifications support @michielmulders

### Changed

- [#3956](https://github.com/cosmos/lunie/pull/3956) Applies same Polkadot seed validation as the one used in PolkadotUI @Bitcoinera
- [#3977](https://github.com/cosmos/lunie/issues/3977) Changes the hardcoded 21 days for unstaking period to a computed to change according to the network @Bitcoinera
- [#3955](https://github.com/cosmos/lunie/pull/3955) Adds a specific warning for Polkadot seed import: only Schnorrkel supported. Also adds a specific seed placeholder @Bitcoinera
- [#4001](https://github.com/cosmos/lunie/pull/4001) Disable Polkadot fees calculation in development @bitcoinera
- [#3950](https://github.com/cosmos/lunie/pull/3950) Now fiatValues are only displayed on mainnets and also 0 fiatValues are shown @Bitcoinera
- [#3957](https://github.com/cosmos/lunie/pull/3957) Brings webpack-internal back @Bitcoinera
- [#3990](https://github.com/cosmos/lunie/pull/3990) Changes the Schnorrkel warning color to warning color @Bitcoinera
- Refactor communication with extension so we can sign easily Polkadot @faboweb
- cleaned up action modals especially on mobile @jbibla
- [#3976](https://github.com/cosmos/lunie/pull/3976) Change push registration flow using upsert @michielmulders

### Fixed

- [#3938](https://github.com/cosmos/lunie/issues/3938) Fixes the arrow links between proposals @Bitcoinera
- [#3964](https://github.com/cosmos/lunie/issues/3964) Fixes claim rewards transactions in Terra after the signing refactor @Bitcoinera
- [#3933](https://github.com/cosmos/lunie/issues/3933) Skip total staked query in delegation modal correctly @faboweb
- Allow CSP to connect to Kusama API @faboweb
- Fix styling of address when importing account @faboweb
- seed screen was missing proper variables @jbibla
- [#3931](https://github.com/cosmos/lunie/issues/3931) Fix wrong Self Stake percentage in inactive validators in polkadot  @mariopino
- [#3948](https://github.com/cosmos/lunie/pull/3948) Add more CSP fixes for push registrations @michielmulders
- Remove Firebase import warning @michielmulders

### Security

- Add CSP hash for preloader script @michielmulders
- [#3923](https://github.com/cosmos/lunie/pull/3923) Avoid unsafe inline scripts in build and secure the remaining with CSP hash @michielmulders

### Code Improvements

- [#3977](https://github.com/cosmos/lunie/issues/3977) Changes polkadot-testnet to kusama for themes, tests, and also refactors where network.startsWith('polkadot') was being used @Bitcoinera
- Reuse apollo for push notification registration @faboweb

## [1.0.195] - 2020-04-29

### Added

- added lunie dark theme @jbibla

### Changed

- [#3908](https://github.com/cosmos/lunie/pull/3908) Enables insecure signups in development. Adds productionMode to session @Bitcoinera
- [#3904](https://github.com/cosmos/lunie/pull/3904) Adds what Kava needs to work in the FE and its images @Bitcoinera
- Always show currency selector @faboweb
- [#3927](https://github.com/cosmos/lunie/issues/3927) Add a loading spinner icon in import account @mariopino

### Fixed

- [#3919](https://github.com/cosmos/lunie/issues/3919) Fixes block links in transaction details in Activity @Bitcoinera
- [#3939](https://github.com/cosmos/lunie/pull/3939) Fixes opening proposals after the signing refactor @Bitcoinera
- [#3939](https://github.com/cosmos/lunie/pull/3939) Fixes making a deposit in Lunie after the signing refactor @Bitcoinera
- Fix polkadot signing @faboweb
- Remove fiat symbols for simplicity @faboweb

### Security

- [#3912](https://github.com/cosmos/lunie/pull/3912) Add intercom wss path to CSP @michielmulders

### Repository

- Allow staging-api in production builds @faboweb
- Deactivate Sentry in development (also deployed) @faboweb
- Better source maps in branch previews @faboweb
- Updated vue to reenable vue devtools @faboweb

## [1.0.194] - 2020-04-27

### Changed

- [#3906](https://github.com/cosmos/lunie/pull/3906) Adds the nordic coins (DKK, SEK, NOK) to the currency selector in Portfolio @Bitcoinera

### Fixed

- [#3913](https://github.com/cosmos/lunie/issues/3913) Fix account import @mariopino

## [1.0.193] - 2020-04-26

### Added

- [#3887](https://github.com/cosmos/lunie/issues/3887) Use schnorrkel (sr25519) in Polkadot @mariopino
- Some additional testing for address import in polkadot @mariopino

### Changed

- [#3867](https://github.com/cosmos/lunie/pull/3867) Adds the Coinbase referral link to Tutorials @Bitcoinera
- implemented theme switching and cleaned up a lot of css variables @jbibla
- [#3557](https://github.com/cosmos/lunie/issues/3557) Check testnet checkbox if current network is a testnet in explore mode @mariopino

### Fixed

- [#3897](https://github.com/cosmos/lunie/issues/3897) Fixes operation with 0 balance by removing the unnecessary validations for both gasPrice and invoiceTotal in ActionModal @Bitcoinera
- [#3901](https://github.com/cosmos/lunie/issues/3901) Fixes Polkadot account import with Schnorrkel on first run @Bitcoinera
- Extension accounts where not loaded in the ActionModal so the error of not existing account would always show @faboweb
- [#3902](https://github.com/cosmos/lunie/issues/3902) Fix broken tx sign with Schnorrkel accounts in polkadot @mariopino

### Security

- [#3871](https://github.com/cosmos/lunie/pull/3871) Adds the missing security headers and options recommented by observatory.mozilla.org @Bitcoinera

### Code Improvements

- [#3875](https://github.com/cosmos/lunie/pull/3875) Refactored signing flow to be reused in the extension @faboweb

## [1.0.192] - 2020-04-22

### Fixed

- Delegations query got wrong argument @faboweb

## [1.0.191] - 2020-04-21

### Added

- [#3835](https://github.com/cosmos/lunie/issues/3835) Not about not showing some transactions @faboweb
- Added loader for the app start @faboweb
- [#3793](https://github.com/cosmos/lunie/issues/3793) Allow 12 words seeds import in Polkadot @mariopino

### Changed

- [#3860](https://github.com/cosmos/lunie/pull/3860) Refactor createKey to avoid using store so it can be usable in extension @Bitcoinera
- Add ability to not track certain statistics in development mode @faboweb

### Fixed

- [#3738](https://github.com/cosmos/lunie/issues/3738) Fixes ActionModal getting stuck in loading @Bitcoinera
- [#3863](https://github.com/cosmos/lunie/pull/3863) Fixes $address is null in the ActionModal queries @Bitcoinera
- [#3855](https://github.com/cosmos/lunie/issues/3855) Fixes broken link in ActionModal redirecting to staking/validators/porfolio. Also fixes some other broken link @Bitcoinera
- [#3865](https://github.com/cosmos/lunie/pull/3865) Fixes single proposals routing @Bitcoinera
- [#3771](https://github.com/cosmos/lunie/issues/3771) Always hide cookies bar after closing it @mariopino

## [1.0.190] - 2020-04-13

### Fixed

- Propper upgrade to AndroidX @faboweb

### Repository

- Move changelog check and release to GithubActions @faboweb

## [1.0.189] - 2020-04-09

### Added

- [#3804](https://github.com/cosmos/lunie/issues/3804) Improve error messaging if users send more tokens then they have @faboweb
- Allow staking and bonding in Polkadot @faboweb

### Changed

- [#3760](https://github.com/cosmos/lunie/issues/3760) Now there is a running script on production that will check if there has been any new Lunie version deployed while the user had Lunie open on the browser and, in that case, reload the page to update. Fixes the chunk error @Bitcoinera
- significant changes to session screens including an update to card sign in to be more of a welcome screen @jbibla

### Fixed

- [#3843](https://github.com/cosmos/lunie/issues/3843) Improves de validation of seed phrases in account restore and removes extra spaces @Bitcoinera
- [#3853](https://github.com/cosmos/lunie/pull/3853) Fix the bug I had created myself of this.setNetwork is not a function in connection.js @Bitcoinera
- [#3848](https://github.com/cosmos/lunie/issues/3848) Fixes currencySelector not appearing for e-Money accounts with just NGM balance. Simply deletes isMultiDenomNetwork checker @Bitcoinera
- [#3854](https://github.com/cosmos/lunie/pull/3854) Fixes the amount required validation for Polkadot in DelegationModal @Bitcoinera

### Code Improvements

- Remove unused totalRewards from actionmodal query @faboweb

### Repository

- Updated capacitor and configuration for Android @faboweb
- Linting is now faster as it only lints changed files on PRs @faboweb

## [1.0.188] - 2020-04-06

### Added

- [#3806](https://github.com/cosmos/lunie/issues/3806) Split rewards from overview query @mariopino

### Changed

- [#3842](https://github.com/cosmos/lunie/pull/3842) Adds the governance messages for Terra @Bitcoinera

### Fixed

- [#3825](https://github.com/cosmos/lunie/issues/3825) Fixes fees being added on top of max amount for any transaction @Bitcoinera

### Repository

- Change location of netlify.config to be picked up properly @faboweb
- Readd the release logic until GitHub actions work @faboweb
- Switch to release via GitHub actions @faboweb

## [1.0.187] - 2020-04-01

### Fixed

- [#3820](https://github.com/cosmos/lunie/pull/3820) Fixes undelegations disappearing one day before the funds getting released (i.e. undelegations too short for one day) @Bitcoinera

### Deprecated

- [#3760](https://github.com/cosmos/lunie/issues/3760) Add handler to kill outstanding service workers @faboweb

### Code Improvements

- Moved address logic to store (cleanup old code) @faboweb

## [1.0.186] - 2020-04-01

### Fixed

- [#3819](https://github.com/cosmos/lunie/pull/3819) Fixes the getTop5RewardsValidators function logic, to pick unique validators with the highest total rewards balances @Bitcoinera
- Fixed e2e tests failing for restake as selection wouldn't be waited for @faboweb

## [1.0.185] - 2020-04-01

### Added

- [#3475](https://github.com/cosmos/lunie/pull/3475) Adds a feature not present component when the feature just doesn't exist in the network @Bitcoinera

### Changed

- [#3794](https://github.com/cosmos/lunie/pull/3794) Now network capabilities can be handled both as String and as Boolean @Bitcoinera
- [#3795](https://github.com/cosmos/lunie/pull/3795) Now we query the specifig network gas estimate from the API instead of hardcoding it @Bitcoinera
- [#3792](https://github.com/cosmos/lunie/pull/3792) Displays on WithdrawRewards modal other tokens rewards when there are no staking denom rewards @Bitcoinera
- [#3808](https://github.com/cosmos/lunie/pull/3808) Adds coinLookup to the NetworksAll query, necessary in ActionManager for toMicroUnit @Bitcoinera
- Show all balances the user has rewards with @faboweb
- [#3676](https://github.com/cosmos/lunie/issues/3676) changed copy in activity footer directing to helpcenter link about viewing past chain data @jrmoreau
- [#3797](https://github.com/cosmos/lunie/pull/3797) Add Akash bech32 prefix validation and network images @michielmulders

### Fixed

- defaulting to cosmos slug fixed @iambeone
- [#3805](https://github.com/cosmos/lunie/pull/3805) Fixes routing for both not available and not present components @Bitcoinera
- Explore mode didn't select the right network @faboweb
- Fix submitted rewards to extension being too long @faboweb
- Fix staking denom showing double in balances if rewards present @faboweb

### Code Improvements

- Switched pre sign message number conversion to always use API provided conversion rates @faboweb

## [1.0.184] - 2020-03-30

### Changed

- [#3801](https://github.com/cosmos/lunie/pull/3801) Chnages the query block in TmConnectedNetwork to blockV2 @Bitcoinera
- [#3789](https://github.com/cosmos/lunie/pull/3789) Leaves the default gas estimate, 550000, on e-Money when it is a Claim Rewards action @Bitcoinera
- reduced complexity of rewards claim tx @jbibla
- added copy icon to address copyable links and widened empty portfolio message @jbibla

### Fixed

- [#3802](https://github.com/cosmos/lunie/pull/3802) Fixes the unit tests for release candidate 1.0.184 @Bitcoinera

## [1.0.183] - 2020-03-27

### Changed

- [#3731](https://github.com/cosmos/lunie/pull/3731) Now LUNA fees are handled differently, not applying the Terra tax and adding the multiply by 1.5 suggestion @Bitcoinera
- [#3758](https://github.com/cosmos/lunie/pull/3758) Prevents ClaimRewardsTxDetails component from "opening" in the extension @Bitcoinera
- Allow sending to and from whitelisted accounts in emoney @faboweb

### Fixed

- [#3784](https://github.com/cosmos/lunie/issues/3784) Hide staking rewards if 0 @faboweb

## [1.0.182] - 2020-03-25

### Changed

- [#3773](https://github.com/cosmos/lunie/pull/3773) Fixed the gas estimates for emoney @bitcoinera
- Prevent sending of NGM on emoney mainnet @faboweb

## [1.0.181] - 2020-03-25

### Fixed

- fixing blockHeight update after several staking @iambeone
- changing cache policy @iambeone
- Prevent stale networks cache @faboweb

### Repository

- clearing sentry variables to prevent sentry usage during e2e-tests @iambeone

## [1.0.180] - 2020-03-25

### Added

- Added emoney mainnet related files @faboweb
- Added new emoney tokens @faboweb

### Changed

- [#3748](https://github.com/cosmos/lunie/pull/3748) Now ClaimRewardsTxDetails displays all claimed rewards and validators are shown a row below @Bitcoinera

### Fixed

- [#3761](https://github.com/cosmos/lunie/issues/3761) Fix polkadot amount conversion @mariopino

### Repository

- Fix hot reloading for css @faboweb

## [1.0.179] - 2020-03-23

### Fixed

- subscribeToMore should contain document instead of query @iambeone
- [#3747](https://github.com/cosmos/lunie/issues/3747) added loaded property to search bar on validator page to stop reloading and unfocussed input @jbibla

### Repository

- removed the docker section and changed some grammar of readme for readability  @jrmoreau

## [1.0.178] - 2020-03-20

### Added

- Added apollo cache persistence to improve initial load times @faboweb

### Changed

- change action denom depending on selected send button @iambeone
- [#3736](https://github.com/cosmos/lunie/pull/3736) Now ModalWithdrawRewards returns the claimed rewards amount in transactionData and sends it to the extension @Bitcoinera
- [#3728](https://github.com/cosmos/lunie/pull/3728) Updates the polkadot/api package to latest @Bitcoinera
- Use TransactionsV2 in subscriptions @faboweb
- modified loading graphics and improved loading styles @jbibla
- updated Luna icon for Terra @jbibla

### Fixed

- page height for big screens fixed @iambeone
- [#3737](https://github.com/cosmos/lunie/issues/3737) sign-in with extension fixed @iambeone
- [#3700](https://github.com/cosmos/lunie/issues/3700) fixing subscribeToMore usage @iambeone
- Show correct addresses for Polkadot @faboweb
- Remove service worker completely @faboweb
- [#3654](https://github.com/cosmos/lunie/issues/3654) scrollbar height needs to be adjusted to avoid cutting off network link @jbibla

### Code Improvements

- Select signing methods per network type @faboweb

### Repository

- add retries to e2e tests @iambeone

## [1.0.177] - 2020-03-18

### Fixed

- [#3725](https://github.com/cosmos/lunie/pull/3725) Fixes Ledger signin @Bitcoinera

## [1.0.176] - 2020-03-17

### Added

- added isExtension getter to identify extension use and use other pathes @iambeone
- [#3689](https://github.com/cosmos/lunie/issues/3689) Allow explore with polkadot address @faboweb

### Changed

- [#3714](https://github.com/cosmos/lunie/pull/3714) Adds the currency icon for the KSM token @Bitcoinera
- [#3718](https://github.com/cosmos/lunie/pull/3718) Adds the icon for MUON @Bitcoinera
- [#3641](https://github.com/cosmos/lunie/issues/3641) super duper multi denom support @jbibla

### Fixed

- account creation steps should be disabled by default  @iambeone
- await preloadNetworkCapabilities as we need networks loaded right after this function call @iambeone
- removed networks loading from checkForPersistedNetwork @iambeone
- [#3709](https://github.com/cosmos/lunie/pull/3709) Fixes networks being undefined in TmSessionSignIn due to incorrect use of networks getter @Bitcoinera
- [#3711](https://github.com/cosmos/lunie/pull/3711) Allows signing in with an existing Lunie Polkadot account by adding a couple of hack in TmSessionSignIn @Bitcoinera
- [#3688](https://github.com/cosmos/lunie/pull/3688) Fixes getting extra fees on Send in Terra when sending Max Amount @Bitcoinera
- [#3707](https://github.com/cosmos/lunie/pull/3707) Fixes the validators list link on Portfolio when delegations is empty @Bitcoinera
- Make select network responsive to network updates @faboweb

### Security

- Updated minimist because of security issue @faboweb

### Deprecated

- transaction-utils moved to extension @iambeone

### Repository

- e2e fixes @iambeone
- Adjusted release script to new release flow @faboweb

## [1.0.175] - 2020-03-14

### Added

- checking extension queue length before new transaction @iambeone
- Allow to use Polkadot raw seed as seed phrase in recovery @faboweb

### Security

- Updated dep because of security issue @faboweb

### Repository

- fixed arch value replaced with arch result @iambeone

## [1.0.174] - 2020-03-12

### Added

- Add message creation on terra mainnet @faboweb

### Changed

- default to USD for fiat selection, changed styles of fiat display @jbibla
- disabled network list item interactivity @jbibla

### Fixed

- fix creating new account record on sign-in with extension @iambeone
- [#3680](https://github.com/cosmos/lunie/pull/3680) Fixes amount of undefined in totalRewards in ModalWithdrawRewards @Bitcoinera

### Repository

- ignore build warnings @iambeone

## [1.0.173] - 2020-03-11

### Changed

- [#3649](https://github.com/cosmos/lunie/pull/3649) Now the memo field is always displayed on SendModal @Bitcoinera
- [#3664](https://github.com/cosmos/lunie/pull/3664) Now to pay fees in Claim Rewards, if there is no staking denom balance available, fees will be paid in the first token with positive balance @Bitcoinera
- [#3663](https://github.com/cosmos/lunie/pull/3663) Now it is possible to claim rewards from any token despite not having any staking denom reward @Bitcoinera
- [#3661](https://github.com/cosmos/lunie/pull/3661) Now amounts are displayed in the TransactionItem component for all ClaimRewards transactions @Bitcoinera
- [#3658](https://github.com/cosmos/lunie/pull/3658) Filters all "Unknown" transactions in PageBlock @Bitcoinera
- [#3657](https://github.com/cosmos/lunie/pull/3657) For Terra networks it changes the fee for an action according to the amount of tokens being handled. Fix in ActionModal @Bitcoinera

### Fixed

- [#3650](https://github.com/cosmos/lunie/pull/3650) Fixes the Back to Lunie button @Bitcoinera
- [#3665](https://github.com/cosmos/lunie/pull/3665) Handles checks in TmBalance when balances are not yet loaded @Bitcoinera
- [#3653](https://github.com/cosmos/lunie/pull/3653) Fixes the PoweredBy component inside the NetworkItem @Bitcoinera
- [#3669](https://github.com/cosmos/lunie/pull/3669) Fix concat property of undefined in ClaimRewardsTxDetails as it now wait for getValidators array to be filled @Bitcoinera
- [#3659](https://github.com/cosmos/lunie/pull/3659) Fix signin routing with Ledger @Bitcoinera
- [#3656](https://github.com/cosmos/lunie/pull/3656) Fixes Terra microdenoms in the toMicroDenom function @Bitcoinera
- [#3651](https://github.com/cosmos/lunie/pull/3651) Fixes all the signins and signup routing @Bitcoinera
- [##3666](https://github.com/cosmos/lunie/issues/#3666) fixed css bug width set to 1023px @jrmoreau

### Repository

- sending sourcemaps to sentry @iambeone
- netlify config for production build @iambeone

## [1.0.172] - 2020-03-05

### Added

- [#3626](https://github.com/cosmos/lunie/pull/3626) Adds the "Powered by" span to both NetworkItem and TmConnectedNetwork promoting our node provider @Bitcoinera
- Added address creation for Polkadot @faboweb
- Query for experimental networks @faboweb
- Added back the fingerprint header @faboweb

### Changed

- [#3640](https://github.com/cosmos/lunie/pull/3640) Checks if the staking denom has a fiat value and in only in that case displays the currency selector. Good for Terra. @Bitcoinera
- [#3639](https://github.com/cosmos/lunie/pull/3639) Adds more networks to Coming Soon. Style and logic improvements: now these networks are disabled @Bitcoinera

### Fixed

- [#3638](https://github.com/cosmos/lunie/pull/3638) Checks if fiatValue is null in TmBalance before checking other conditions @Bitcoinera
- Show subtotal correctly instead of using amount @faboweb
- Fixed extension sign in deeplinking sometimes not working @faboweb
- Added other Terra tokens to microdenom lookup @faboweb
- [#3489](https://github.com/cosmos/lunie/issues/3489) now we register users for the intercom messenger before the messenger is opened to ensure the messenger doesn't fail @jbibla

### Code Improvements

- add back subscribeToMore function to transaction page @iambeone
- Refactored address component to support Polkadot @faboweb
- Use proper bech32 addresses in tests @faboweb
- Remove old tx submit logic code @faboweb
- Select signing methods per network type @faboweb

### Repository

- Fix publish.sh not working due to bad syntax @iambeone

## [1.0.171] - 2020-03-02

### Added

- [#3627](https://github.com/cosmos/lunie/pull/3627) Adds a coming soon network list in PageNetworks where depicts Polkadot (Kusama) @Bitcoinera

### Fixed

- Fixed extension sign in deeplinking sometimes not working @faboweb
- Fixed issue with undelegating counting amount as subtotal @faboweb

## [1.0.170] - 2020-02-29

### Fixed

- Revert analytics header PR to fix extension compatibility @faboweb

## [1.0.169] - 2020-02-28

### Added

- [#3213](https://github.com/cosmos/lunie/issues/3213) add network name in url for some pages @iambeone
- [#3584](https://github.com/cosmos/lunie/pull/3584) Adds  currency selector back to TmBalance and applies Charlies design @Bitcoinera

### Changed

- prevent multiple requests of transaction pages @iambeone

### Fixed

- [#3616](https://github.com/cosmos/lunie/pull/3616) Fix routing issues when exploring an account @faboweb
- Remove reloading logic as buggy @faboweb

### Repository

- Use both possible release commit messages @faboweb

## [1.0.168] - 2020-02-28

### Added

- [#3573](https://github.com/cosmos/lunie/issues/3573) Integrate new transaction abstraction @mariopino

### Changed

- add pageNumber variable to tx request @iambeone

### Deprecated

- Remove fiat code as not used and conflicting with API upgrade @faboweb

## [1.0.167] - 2020-02-27

### Changed

- [#3610](https://github.com/cosmos/lunie/pull/3610) Adds a small check in WithdrawRewardsMessageDetails necessary for extension @Bitcoinera
- [#3592](https://github.com/cosmos/lunie/pull/3592) Deletes gas prices dictionary in ActionModal @Bitcoinera

## [1.0.166] - 2020-02-26

### Changed

- add fingerprint header to fetch @iambeone

### Fixed

- [#3606](https://github.com/cosmos/lunie/pull/3606) Fixes having the rewards from the previous session hanging on TableValidators once the user disconnects @Bitcoinera
- Fix publish not triggering as the expected commit message was outdated @faboweb
- Remove service worker as it produced issues with caching @faboweb

## [1.0.165] - 2020-02-26

### Added

- adding fingerpring header @iambeone
- [#3513](https://github.com/cosmos/lunie/issues/3513) sending cancel message to extension on cancel @iambeone
- [#3565](https://github.com/cosmos/lunie/pull/3565) Now it is possible to pay gas fees in any token (multidenom networks) @Bitcoinera
- [#3559](https://github.com/cosmos/lunie/pull/3559) Now rewards for multidenom networks are displayed in TmBalance and staking denom is especified in validators' components @Bitcoinera

### Changed

- [#3578](https://github.com/cosmos/lunie/pull/3578) Add new multi denom send denom selection @iambeone
- Initial activity page load loads only first chunk of all transactions and then after scroll end reached loads more @iambeone
- [#3553](https://github.com/cosmos/lunie/pull/3553) Adds check in SessionSignIn to verify the signin address belongs to an existing mainnet. Otherwise displays an error message @Bitcoinera
- [#3583](https://github.com/cosmos/lunie/pull/3583) Adds the isExtension flag for extension @Bitcoinera
- [#3583](https://github.com/cosmos/lunie/pull/3583) Hides the transaction meta data fold out in the extension @Bitcoinera @faboweb

### Fixed

- [#3580](https://github.com/cosmos/lunie/pull/3580) Fixes the displayed amount in the Claim Rewards modal for multidenom networks @Bitcoinera
- Fix success screen showing different denom in multi denom setup @faboweb
- Fix e2e tests failing because it can't find an element for querying for it's text @faboweb
- [#3455](https://github.com/cosmos/lunie/issues/3455) Improve action modal layout in mobile and extension @mariopino
- [#3568](https://github.com/cosmos/lunie/issues/3568) Show tutorial buttons only in cosmos main & testnet @mariopino

### Code Improvements

- [#3581](https://github.com/cosmos/lunie/pull/3581) Drops the temporary hack for claim rewards gas prices in e-Money @Bitcoinera
- remove rpc url from gql @faboweb

### Repository

- updated ios pods @jbibla

## [1.0.164] - 2020-02-18

### Added

- [#3563](https://github.com/cosmos/lunie/issues/3563) Prevent Google Translate to translate material icons @mariopino
- [#3540](https://github.com/cosmos/lunie/pull/3540) Format big percentages as needed for e-money @mariopino

### Changed

- [#3542](https://github.com/cosmos/lunie/pull/3542) Now it is possible to create an account in Lunie when connected to a testnet @Bitcoinera

### Fixed

- analytics data sent fix @iambeone

### Code Improvements

- [#3551](https://github.com/cosmos/lunie/pull/3551) Improves the testnet checkbox styles @Bitcoinera

### Repository

- remove alert action @iambeone

## [1.0.163] - 2020-02-09

### Added

- apollo error handling @iambeone
- [#3537](https://github.com/cosmos/lunie/issues/3537) add custom metrics for GA @iambeone
- [#3383](https://github.com/cosmos/lunie/issues/3383) Added message about past chain transactions not being present @faboweb
- [#3532](https://github.com/cosmos/lunie/issues/3532) Added note about emailing us when validator image is missing @faboweb

### Changed

- pass local error to console @iambeone

### Fixed

- network list fetching fixed @iambeone
- [#3244](https://github.com/cosmos/lunie/issues/3244) Fixes claiming transactions considering only the first claiming tx @Bitcoinera
- [#3530](https://github.com/cosmos/lunie/issues/3530) Fix Safari bug where variable is not available in context @faboweb
- Fix script to fund e2e master account @faboweb
- [#3476](https://github.com/cosmos/lunie/issues/3476) Prevent bad amounts to be send to backend @mariopino

### Repository

- pr alert fixed @iambeone
- [#3547](https://github.com/cosmos/lunie/pull/3547) Adds a script to serve the app without using kill-port. Especially good for Windows. @Bitcoinera
- Fix release process as tags are not merged to develop @faboweb

## [1.0.162] - 2020-02-03

### Added

- Network change on login with extension @iambeone
- sign-in with the url parameters @iambeone

### Changed

- passing network id to extension in sign flow @iambeone
- Change transactionGroup getting method @iambeone
- Add no accounts alert on use extension step @iambeone
- change create new account flow, remove select network step in default mode @iambeone
- rewrite networkSort to fix network order change after selection @iambeone
- [#3488](https://github.com/cosmos/lunie/pull/3488) Adds the isANetworkAddress validatin to the sign in with account @Bitcoinera
- [#3488](https://github.com/cosmos/lunie/pull/3488) Adds the link to networks as part of the validation error message for isANetworkAddress @Bitcoinera
- [#3505](https://github.com/cosmos/lunie/pull/3505) Logs Ledger connection errors to Sentry @Bitcoinera

### Fixed

- [#3488](https://github.com/cosmos/lunie/pull/3488) Fixes accounts not loading on refresh in TmSessionSignIn @Bitcoinera
- Handle ledger app not being defined @faboweb
- Fix tests not running @faboweb
- Force refresh of the app if the local files are outdated @faboweb
- Trying to fix transport undefined bug by updating ledger library @faboweb
- correctly throw unknown ledger errors for webusb @faboweb

### Code Improvements

- [#3521](https://github.com/cosmos/lunie/pull/3521) Removes the hack used in NetworkItem to avoid displaying the loader in extension in SelectNetwork @Bitcoinera
- [#3510](https://github.com/cosmos/lunie/pull/3510) Refactored NetworkItem to use network getter to be compatible with extension @bitcoinera
- [#3526](https://github.com/cosmos/lunie/pull/3526) Updates the micro denom for e-Money to ungm @Bitcoinera

### Repository

- [#3517](https://github.com/cosmos/lunie/issues/3517) Wait for deploy preview to be available before starting e2e tests @faboweb

## [1.0.161] - 2020-01-28

### Added

- add terra network to tests @iambeone
- [#3439](https://github.com/cosmos/lunie/pull/3439) Allow for network selection on account creation and import @bitcoinera
- [#3432](https://github.com/cosmos/lunie/issues/3432) Finish tutorials @mariopino
- [#3483](https://github.com/cosmos/lunie/issues/3483) Dont register Intercom user at init in mobile apps  @mariopino

### Fixed

- bugfix on creating and restoring account in different networks @iambeone
- Bugs around networks sign-in in extension @iambeone
- bugfix in tests @iambeone
- [#3484](https://github.com/cosmos/lunie/pull/3484) Fixes missing denom when there are no balances in SendModal @Bitcoinera
- Fix restaking using wrong subtotal for calculations @faboweb
- [#3447](https://github.com/cosmos/lunie/issues/3447) Handle some failing GraphQL queries @faboweb
- Handle network not being set in network selector (like in the extension) @faboweb

### Repository

- [#3468](https://github.com/cosmos/lunie/issues/3468) Do not track issues in Sentry for deploy previews @faboweb
- Check for changelog updates on release-candidates @faboweb
- Added script to add version to build files @faboweb
- Deploy previews in development mode @faboweb
- Fix publish was always triggered on develop @faboweb

## [1.0.160] - 2020-01-25

### Added

- [#3415](https://github.com/cosmos/lunie/issues/3415) added a parameter to persist API change @iambeone
- [#3362](https://github.com/cosmos/lunie/pull/3362) Adds "Back to Validators" button in PageValidator @Bitcoinera
- Show multiple wallet balances in UI @faboweb
- [#3370](https://github.com/cosmos/lunie/pull/3370) Now it is possible to select different tokens to send in the SendModal for networks with multiple tokens @Bitcoinera
- [#3365](https://github.com/cosmos/lunie/pull/3365) TmBalance now displays multiple tokens balances and has a currency selector to display total value in the selected fiat currency @Bitcoinera
- Added EMoney account handling @faboweb
- Allow address creation in all cosmos networks @faboweb
- [#3392](https://github.com/cosmos/lunie/issues/3392) Use Ledger across networks @faboweb
- Allow signing for Terra @faboweb
- [#3364](https://github.com/cosmos/lunie/pull/3364) Track failing transactions clientside in Sentry @faboweb
- Retry graphql fetches on failed attempts @faboweb
- [#3375](https://github.com/cosmos/lunie/pull/3375) Allow user to show address on Ledger Nano @faboweb
- [#3423](https://github.com/cosmos/lunie/issues/3423) Implement mobile Intercom using vuex store @mariopino
- [#3425](https://github.com/cosmos/lunie/issues/3425) Refactor script to add Intercom API keys at the top-level capacitor config file. @mariopino
- [#3440](https://github.com/cosmos/lunie/issues/3440) Upgrade capacitor-intercom module to v0.2.3  @mariopino
- [#3450](https://github.com/cosmos/lunie/issues/3450) Update activity icons @mariopino

### Changed

- [#3415](https://github.com/cosmos/lunie/issues/3415) graphql url parameter changed to 'api' @iambeone
- [#3398](https://github.com/cosmos/lunie/pull/3398) Replaces a phantom div in the "Back to Validators" button for padding, as it should have been from the beginning @Bitcoinera
- [#3443](https://github.com/cosmos/lunie/pull/3443) Enables more networks in MessageConstructor and ledger.js @Bitcoinera
- [#3438](https://github.com/cosmos/lunie/pull/3438) Now the session explore component filters for addresses belonging to the current network we are connected to  @Bitcoinera
- [#3366](https://github.com/cosmos/lunie/pull/3366) Fix link in ActionModal for lunie browser extension  @Bitcoinera
- [#3282](https://github.com/cosmos/lunie/issues/3282) Now the block links in the activity section are active or not depending on the feature_explorer feature flag of the network @Bitcoinera
- [#3371](https://github.com/cosmos/lunie/pull/3371) Strengthen the validation for cosmos addresses signin @Bitcoinera
- [#3349](https://github.com/cosmos/lunie/pull/3349) Now it is possible to also sign in with an Ethereum address @Bitcoinera
- [#3349](https://github.com/cosmos/lunie/pull/3349) Now the Undelegations component filters for only pending undelegations @Bitcoinera
- [#3454](https://github.com/cosmos/lunie/pull/3454) Deletes everything regarding the validator transactions message details @Bitcoinera
- display ledger and extension instructions when these signing options are selected @jbibla

### Fixed

- [#3460](https://github.com/cosmos/lunie/pull/3460) Fix blocks query, delete amount field @Bitcoinera
- [#3384](https://github.com/cosmos/lunie/pull/3384) Now fees in action modals for all enabled networks work. Micro denoms are properly set @Bitcoinera
- [#3405](https://github.com/cosmos/lunie/issues/3405) Fixes sign out so the user is not signed back in upon refreshing the page @Bitcoinera
- [#3306](https://github.com/cosmos/lunie/issues/3306) Fixes the waiting for extension button in the ActionModal. Now the captions don't overflow @Bitcoinera
- [#3359](https://github.com/cosmos/lunie/pull/3359) Fixes address undefined for the "To address" in multisends @Bitcoinera
- [#3390](https://github.com/cosmos/lunie/pull/3390) Fix ActionModal data being out of date if a live update of data happened @faboweb
- Fix balances not in overview query anymore @faboweb
- [#3364](https://github.com/cosmos/lunie/pull/3364) Improve handling of sequence querying in ActionModal @faboweb
- Fixed denom not selected if only one balance @faboweb
- [#3412](https://github.com/cosmos/lunie/issues/3412) Show transactions on EMoney and Terra @faboweb
- Force index.html to not be cached @faboweb
- Fix modals closing and reopening (issue with waiting for content to be loaded) @faboweb
- [#3330](https://github.com/cosmos/lunie/issues/3330) send button is now disabled if extension is not installed @jbibla
- there was a styling issue with the "show on ledger" button and it was being displayed for all signed in sessions, not just ledger sessions @jbibla
- [#3096](https://github.com/cosmos/lunie/issues/3096) Fix redelegation to and from fields @mariopino
- [#3280](https://github.com/cosmos/lunie/issues/3280) Replace toggles in all and active buttons in validators page. @mariopino
- [#3326](https://github.com/cosmos/lunie/issues/3326) Enable Intercom in mobile apps @mariopino
- [#3333](https://github.com/cosmos/lunie/issues/3333) Fix gas price input deselects itself after typing @mariopino
- [#3339](https://github.com/cosmos/lunie/issues/3339) Fix session modal validation triggers on closing @mariopino
- [#3376](https://github.com/cosmos/lunie/issues/3376) Round total rewards to 6 decimal places @mariopino

### Security

- Add X-Frame header @faboweb

### Code Improvements

- [#3402](https://github.com/cosmos/lunie/issues/3402) Get network information like address creation method and address prefixes from the API @faboweb

### Repository

- Add script to add intercom keys to capacitor @faboweb
- [#3071](https://github.com/cosmos/lunie/issues/3071) Release on a new version from develop instead of merging master back to develop @faboweb
- Cleaned packages @faboweb
- Lint before push @faboweb
- Set Lunie version for Sentry @faboweb

## [1.0.159] - 2020-01-18

### Added

- [#3415](https://github.com/cosmos/lunie/issues/3415) added a parameter to persist API change @iambeone
- [#3362](https://github.com/cosmos/lunie/pull/3362) Adds "Back to Validators" button in PageValidator @Bitcoinera
- Show multiple wallet balances in UI @faboweb
- [#3370](https://github.com/cosmos/lunie/pull/3370) Now it is possible to select different tokens to send in the SendModal for networks with multiple tokens @Bitcoinera
- [#3365](https://github.com/cosmos/lunie/pull/3365) TmBalance now displays multiple tokens balances and has a currency selector to display total value in the selected fiat currency @Bitcoinera
- Added EMoney account handling @faboweb
- Allow address creation in all cosmos networks @faboweb
- [#3392](https://github.com/cosmos/lunie/issues/3392) Use Ledger across networks @faboweb
- Allow signing for Terra @faboweb
- [#3364](https://github.com/cosmos/lunie/pull/3364) Track failing transactions clientside in Sentry @faboweb
- Retry graphql fetches on failed attempts @faboweb
- [#3375](https://github.com/cosmos/lunie/pull/3375) Allow user to show address on Ledger Nano @faboweb
- [#3423](https://github.com/cosmos/lunie/issues/3423) Implement mobile Intercom using vuex store @mariopino
- [#3425](https://github.com/cosmos/lunie/issues/3425) Refactor script to add Intercom API keys at the top-level capacitor config file. @mariopino

### Changed

- [#3415](https://github.com/cosmos/lunie/issues/3415) graphql url parameter changed to 'api' @iambeone
- [#3398](https://github.com/cosmos/lunie/pull/3398) Replaces a phantom div in the "Back to Validators" button for padding, as it should have been from the beginning @Bitcoinera
- [#3366](https://github.com/cosmos/lunie/pull/3366) Fix link in ActionModal for lunie browser extension  @Bitcoinera
- [#3282](https://github.com/cosmos/lunie/issues/3282) Now the block links in the activity section are active or not depending on the feature_explorer feature flag of the network @Bitcoinera
- [#3371](https://github.com/cosmos/lunie/pull/3371) Strengthen the validation for cosmos addresses signin @Bitcoinera
- [#3349](https://github.com/cosmos/lunie/pull/3349) Now it is possible to also sign in with an Ethereum address @Bitcoinera
- [#3349](https://github.com/cosmos/lunie/pull/3349) Now the Undelegations component filters for only pending undelegations @Bitcoinera

### Fixed

- [#3384](https://github.com/cosmos/lunie/pull/3384) Now fees in action modals for all enabled networks work. Micro denoms are properly set @Bitcoinera
- [#3405](https://github.com/cosmos/lunie/issues/3405) Fixes sign out so the user is not signed back in upon refreshing the page @Bitcoinera
- [#3306](https://github.com/cosmos/lunie/issues/3306) Fixes the waiting for extension button in the ActionModal. Now the captions don't overflow @Bitcoinera
- [#3359](https://github.com/cosmos/lunie/pull/3359) Fixes address undefined for the "To address" in multisends @Bitcoinera
- [#3390](https://github.com/cosmos/lunie/pull/3390) Fix ActionModal data being out of date if a live update of data happened @faboweb
- Fix balances not in overview query anymore @faboweb
- [#3364](https://github.com/cosmos/lunie/pull/3364) Improve handling of sequence querying in ActionModal @faboweb
- Fixed denom not selected if only one balance @faboweb
- [#3412](https://github.com/cosmos/lunie/issues/3412) Show transactions on EMoney and Terra @faboweb
- Force index.html to not be cached @faboweb
- there was a styling issue with the "show on ledger" button and it was being displayed for all signed in sessions, not just ledger sessions @jbibla
- [#3096](https://github.com/cosmos/lunie/issues/3096) Fix redelegation to and from fields @mariopino
- [#3280](https://github.com/cosmos/lunie/issues/3280) Replace toggles in all and active buttons in validators page. @mariopino
- [#3326](https://github.com/cosmos/lunie/issues/3326) Enable Intercom in mobile apps @mariopino
- [#3339](https://github.com/cosmos/lunie/issues/3339) Fix session modal validation triggers on closing @mariopino
- [#3376](https://github.com/cosmos/lunie/issues/3376) Round total rewards to 6 decimal places @mariopino

### Security

- Add X-Frame header @faboweb

### Repository

- Add script to add intercom keys to capacitor @faboweb
- Cleaned packages @faboweb
- Lint before push @faboweb

## [1.0.158] - 2020-01-18

### Added

- [#3415](https://github.com/cosmos/lunie/issues/3415) added a parameter to persist API change @iambeone
- [#3362](https://github.com/cosmos/lunie/pull/3362) Adds "Back to Validators" button in PageValidator @Bitcoinera
- Show multiple wallet balances in UI @faboweb
- [#3370](https://github.com/cosmos/lunie/pull/3370) Now it is possible to select different tokens to send in the SendModal for networks with multiple tokens @Bitcoinera
- [#3365](https://github.com/cosmos/lunie/pull/3365) TmBalance now displays multiple tokens balances and has a currency selector to display total value in the selected fiat currency @Bitcoinera
- Added EMoney account handling @faboweb
- Allow address creation in all cosmos networks @faboweb
- [#3392](https://github.com/cosmos/lunie/issues/3392) Use Ledger across networks @faboweb
- Allow signing for Terra @faboweb
- [#3364](https://github.com/cosmos/lunie/pull/3364) Track failing transactions clientside in Sentry @faboweb
- Retry graphql fetches on failed attempts @faboweb
- [#3375](https://github.com/cosmos/lunie/pull/3375) Allow user to show address on Ledger Nano @faboweb
- [#3423](https://github.com/cosmos/lunie/issues/3423) Implement mobile Intercom using vuex store @mariopino
- [#3425](https://github.com/cosmos/lunie/issues/3425) Refactor script to add Intercom API keys at the top-level capacitor config file. @mariopino

### Changed

- [#3415](https://github.com/cosmos/lunie/issues/3415) graphql url parameter changed to 'api' @iambeone
- [#3398](https://github.com/cosmos/lunie/pull/3398) Replaces a phantom div in the "Back to Validators" button for padding, as it should have been from the beginning @Bitcoinera
- [#3366](https://github.com/cosmos/lunie/pull/3366) Fix link in ActionModal for lunie browser extension  @Bitcoinera
- [#3282](https://github.com/cosmos/lunie/issues/3282) Now the block links in the activity section are active or not depending on the feature_explorer feature flag of the network @Bitcoinera
- [#3371](https://github.com/cosmos/lunie/pull/3371) Strengthen the validation for cosmos addresses signin @Bitcoinera
- [#3349](https://github.com/cosmos/lunie/pull/3349) Now it is possible to also sign in with an Ethereum address @Bitcoinera
- [#3349](https://github.com/cosmos/lunie/pull/3349) Now the Undelegations component filters for only pending undelegations @Bitcoinera

### Fixed

- [#3384](https://github.com/cosmos/lunie/pull/3384) Now fees in action modals for all enabled networks work. Micro denoms are properly set @Bitcoinera
- [#3405](https://github.com/cosmos/lunie/issues/3405) Fixes sign out so the user is not signed back in upon refreshing the page @Bitcoinera
- [#3306](https://github.com/cosmos/lunie/issues/3306) Fixes the waiting for extension button in the ActionModal. Now the captions don't overflow @Bitcoinera
- [#3359](https://github.com/cosmos/lunie/pull/3359) Fixes address undefined for the "To address" in multisends @Bitcoinera
- [#3390](https://github.com/cosmos/lunie/pull/3390) Fix ActionModal data being out of date if a live update of data happened @faboweb
- Fix balances not in overview query anymore @faboweb
- [#3364](https://github.com/cosmos/lunie/pull/3364) Improve handling of sequence querying in ActionModal @faboweb
- [#3412](https://github.com/cosmos/lunie/issues/3412) Show transactions on EMoney and Terra @faboweb
- Force index.html to not be cached @faboweb
- there was a styling issue with the "show on ledger" button and it was being displayed for all signed in sessions, not just ledger sessions @jbibla
- [#3096](https://github.com/cosmos/lunie/issues/3096) Fix redelegation to and from fields @mariopino
- [#3280](https://github.com/cosmos/lunie/issues/3280) Replace toggles in all and active buttons in validators page. @mariopino
- [#3326](https://github.com/cosmos/lunie/issues/3326) Enable Intercom in mobile apps @mariopino
- [#3339](https://github.com/cosmos/lunie/issues/3339) Fix session modal validation triggers on closing @mariopino
- [#3376](https://github.com/cosmos/lunie/issues/3376) Round total rewards to 6 decimal places @mariopino

### Security

- Add X-Frame header @faboweb

### Repository

- Add script to add intercom keys to capacitor @faboweb
- Cleaned packages @faboweb
- Lint before push @faboweb

## [1.0.157] - 2020-01-10

### Added

- [#3362](https://github.com/cosmos/lunie/pull/3362) Adds "Back to Validators" button in PageValidator @Bitcoinera
- [#3358](https://github.com/cosmos/lunie/pull/3358) Adds the e-Money network icon @Bitcoinera
- [#3314](https://github.com/cosmos/lunie/issues/3314) Keep sessions per network @faboweb
- Allow address creation in all cosmos networks @faboweb
- [#3364](https://github.com/cosmos/lunie/pull/3364) Track failing transactions clientside in Sentry @faboweb
- Retry graphql fetches on failed attempts @faboweb
- [#3375](https://github.com/cosmos/lunie/pull/3375) Allow user to show address on Ledger Nano @faboweb
- added little x back to action modal @jbibla
- [#3345](https://github.com/cosmos/lunie/issues/3345) New tutorial component @mariopino

### Changed

- [#3313](https://github.com/cosmos/lunie/issues/3313) Now when Linux users go to sign in with Ledger they get a warning message with a link to the Ledger documentation to fix connection issues @Bitcoinera
- [#3289](https://github.com/cosmos/lunie/pull/3289) Now PageValidator handles empty fields more uniformly, always displaying `--` @Bitcoinera
- [#3398](https://github.com/cosmos/lunie/pull/3398) Replaces a phantom div in the "Back to Validators" button for padding, as it should have been from the beginning @Bitcoinera
- [#3366](https://github.com/cosmos/lunie/pull/3366) Fix link in ActionModal for lunie browser extension  @Bitcoinera
- [#3371](https://github.com/cosmos/lunie/pull/3371) Strengthen the validation for cosmos addresses signin @Bitcoinera
- [#3349](https://github.com/cosmos/lunie/pull/3349) Now it is possible to also sign in with an Ethereum address @Bitcoinera
- [#3349](https://github.com/cosmos/lunie/pull/3349) Now the Undelegations component filters for only pending undelegations @Bitcoinera
- success screen icon is green instead of orange @jbibla
- delegation and undelegation are now "stake" and "unstake" @jbibla

### Fixed

- [#3384](https://github.com/cosmos/lunie/pull/3384) Now fees in action modals for all enabled networks work. Micro denoms are properly set @Bitcoinera
- [#3354](https://github.com/cosmos/lunie/pull/3354) Fix session per network so it signs in to the current network @Bitcoinera
- [#3323](https://github.com/cosmos/lunie/pull/3323) Fixes the userTransactionAdded subscription and deletes the double TmLoadingComponent @Bitcoinera
- [#3359](https://github.com/cosmos/lunie/pull/3359) Fixes address undefined for the "To address" in multisends @Bitcoinera
- [#3350](https://github.com/cosmos/lunie/pull/3350) Remove field not present in API schema @colw
- [#3351](https://github.com/cosmos/lunie/pull/3351) A typo @colw
- [#3390](https://github.com/cosmos/lunie/pull/3390) Fix ActionModal data being out of date if a live update of data happened @faboweb
- [#3364](https://github.com/cosmos/lunie/pull/3364) Improve handling of sequence querying in ActionModal @faboweb
- Show failing txs in action modal @faboweb
- there was a styling issue with the "show on ledger" button and it was being displayed for all signed in sessions, not just ledger sessions @jbibla
- [#3096](https://github.com/cosmos/lunie/issues/3096) Fix redelegation to and from fields @mariopino
- [#3277](https://github.com/cosmos/lunie/issues/3277) Update proposals every 10 blocks @mariopino
- [#3280](https://github.com/cosmos/lunie/issues/3280) Replace toggles in all and active buttons in validators page. @mariopino
- [#3328](https://github.com/cosmos/lunie/issues/3328) Fix error 404 in validator links from transactions in page block @mariopino
- [#3339](https://github.com/cosmos/lunie/issues/3339) Fix session modal validation triggers on closing @mariopino
- [#3376](https://github.com/cosmos/lunie/issues/3376) Round total rewards to 6 decimal places @mariopino

### Repository

- Merge back master into develop before releasing @faboweb
- Cleaned packages @faboweb
- Lint before push @faboweb

## [1.0.156] - 2020-01-08

### Added

- [#3358](https://github.com/cosmos/lunie/pull/3358) Adds the e-Money network icon @Bitcoinera
- [#3314](https://github.com/cosmos/lunie/issues/3314) Keep sessions per network @faboweb
- Allow address creation in all cosmos networks @faboweb
- added little x back to action modal @jbibla
- [#3345](https://github.com/cosmos/lunie/issues/3345) New tutorial component @mariopino

### Changed

- [#3313](https://github.com/cosmos/lunie/issues/3313) Now when Linux users go to sign in with Ledger they get a warning message with a link to the Ledger documentation to fix connection issues @Bitcoinera
- [#3289](https://github.com/cosmos/lunie/pull/3289) Now PageValidator handles empty fields more uniformly, always displaying `--` @Bitcoinera
- [#3366](https://github.com/cosmos/lunie/pull/3366) Fix link in ActionModal for lunie browser extension  @Bitcoinera
- [#3349](https://github.com/cosmos/lunie/pull/3349) Now it is possible to also sign in with an Ethereum address @Bitcoinera
- [#3349](https://github.com/cosmos/lunie/pull/3349) Now the Undelegations component filters for only pending undelegations @Bitcoinera
- success screen icon is green instead of orange @jbibla
- delegation and undelegation are now "stake" and "unstake" @jbibla

### Fixed

- [#3354](https://github.com/cosmos/lunie/pull/3354) Fix session per network so it signs in to the current network @Bitcoinera
- [#3323](https://github.com/cosmos/lunie/pull/3323) Fixes the userTransactionAdded subscription and deletes the double TmLoadingComponent @Bitcoinera
- [#3359](https://github.com/cosmos/lunie/pull/3359) Fixes address undefined for the "To address" in multisends @Bitcoinera
- [#3350](https://github.com/cosmos/lunie/pull/3350) Remove field not present in API schema @colw
- [#3351](https://github.com/cosmos/lunie/pull/3351) A typo @colw
- Show failing txs in action modal @faboweb
- [#3096](https://github.com/cosmos/lunie/issues/3096) Fix redelegation to and from fields @mariopino
- [#3277](https://github.com/cosmos/lunie/issues/3277) Update proposals every 10 blocks @mariopino
- [#3328](https://github.com/cosmos/lunie/issues/3328) Fix error 404 in validator links from transactions in page block @mariopino
- [#3339](https://github.com/cosmos/lunie/issues/3339) Fix session modal validation triggers on closing @mariopino

### Repository

- Merge back master into develop before releasing @faboweb

## [1.0.155] - 2019-12-18

### Changed

- [#3313](https://github.com/cosmos/lunie/issues/3313) Now when Linux users go to sign in with Ledger they get a warning message with a link to the Ledger documentation to fix connection issues @Bitcoinera
- [#3289](https://github.com/cosmos/lunie/pull/3289) Now PageValidator handles empty fields more uniformly, always displaying `--` @Bitcoinera

### Fixed

- [#3323](https://github.com/cosmos/lunie/pull/3323) Fixes the userTransactionAdded subscription and deletes the double TmLoadingComponent @Bitcoinera
- Show failing txs in action modal @faboweb
- [#3277](https://github.com/cosmos/lunie/issues/3277) Update proposals every 10 blocks @mariopino

## [1.0.154] - 2019-12-16

### Added

- [#3271](https://github.com/cosmos/lunie/issues/3271) Now the stake on the validator will automatically update on PageValidator @Bitcoinera
- [#3260](https://github.com/cosmos/lunie/pull/3260) Few fixes to better integrate with the Livepeer network @Bitcoinera
- Show errors if transaction fail @faboweb
- added bitrise widgets to readme @jbibla
- [#3069](https://github.com/cosmos/lunie/issues/3069) Add intercom link to TmDataError component @mariopino

### Changed

- Reduce gas price to counter gas estimation increase in API @faboweb
- Use the url param for the API also for the transaction service @faboweb
- the proposal description length was unreasonably small, now it is much larger @jbibla
- switched the little x on the action modal to be a proper button @jbibla
- made the edit memo button a link for a cleaner send modal @jbibla
- added explanation and made error message clearer for new ledger updates @jbibla
- the networks page now lives in the mobile app footer instead of in the mobile menu - this is more consistent @jbibla

### Fixed

- [#3303](https://github.com/cosmos/lunie/pull/3303) Fix the continuous refreshing of the PageValidator component, which prevented from staking or doing any action at all @Bitcoinera
- [#3304](https://github.com/cosmos/lunie/pull/3304) Fix scrollbar around AppMenu and weird resizing of the Help-Feedback button @Bitcoinera
- [#3283](https://github.com/cosmos/lunie/pull/3283) Now the signin close button redirects directly to root (`/`) @Bitcoinera
- [#3255](https://github.com/cosmos/lunie/pull/3255) Hide menu when changing to block view from menu @colw
- Fix failing sends @faboweb
- Handle validator image being null @faboweb
- Show correct feature flag url for HID support under Windows @faboweb
- Consecutive transactions would fail as the sequence number wasn't updated @faboweb
- Use v2 library for cosmos hub mainnet @faboweb
- [#3205](https://github.com/cosmos/lunie/issues/3205) resolved keyboard and button issues on iOS forms @jbibla
- added special styles for the notch and bottom bar on iPhone X and 11 @jbibla
- the input suffix styles were broken on the delegation modal, but now they are fixed!  @jbibla
- [#3079](https://github.com/cosmos/lunie/issues/3079) Improve proposals in deposit period @mariopino
- [#3269](https://github.com/cosmos/lunie/issues/3269) Improve behaviour of validator names / images @mariopino
- [#3270](https://github.com/cosmos/lunie/issues/3270) Fix no validator found appears instead of Data loading @mariopino
- [#3292](https://github.com/cosmos/lunie/issues/3292) Fix TmDataLoading component registration in PageValidator @mariopino

## [1.0.153] - 2019-12-15

### Added

- [#3271](https://github.com/cosmos/lunie/issues/3271) Now the stake on the validator will automatically update on PageValidator @Bitcoinera
- [#3260](https://github.com/cosmos/lunie/pull/3260) Few fixes to better integrate with the Livepeer network @Bitcoinera
- Show errors if transaction fail @faboweb
- added bitrise widgets to readme @jbibla
- [#3069](https://github.com/cosmos/lunie/issues/3069) Add intercom link to TmDataError component @mariopino

### Changed

- Reduce gas price to counter gas estimation increase in API @faboweb
- Use the url param for the API also for the transaction service @faboweb
- the proposal description length was unreasonably small, now it is much larger @jbibla
- switched the little x on the action modal to be a proper button @jbibla
- made the edit memo button a link for a cleaner send modal @jbibla
- added explanation and made error message clearer for new ledger updates @jbibla
- the networks page now lives in the mobile app footer instead of in the mobile menu - this is more consistent @jbibla

### Fixed

- [#3303](https://github.com/cosmos/lunie/pull/3303) Fix the continuous refreshing of the PageValidator component, which prevented from staking or doing any action at all @Bitcoinera
- [#3304](https://github.com/cosmos/lunie/pull/3304) Fix scrollbar around AppMenu and weird resizing of the Help-Feedback button @Bitcoinera
- [#3283](https://github.com/cosmos/lunie/pull/3283) Now the signin close button redirects directly to root (`/`) @Bitcoinera
- [#3255](https://github.com/cosmos/lunie/pull/3255) Hide menu when changing to block view from menu @colw
- Fix failing sends @faboweb
- Show correct feature flag url for HID support under Windows @faboweb
- Consecutive transactions would fail as the sequence number wasn't updated @faboweb
- Use v2 library for cosmos hub mainnet @faboweb
- [#3205](https://github.com/cosmos/lunie/issues/3205) resolved keyboard and button issues on iOS forms @jbibla
- added special styles for the notch and bottom bar on iPhone X and 11 @jbibla
- the input suffix styles were broken on the delegation modal, but now they are fixed!  @jbibla
- [#3079](https://github.com/cosmos/lunie/issues/3079) Improve proposals in deposit period @mariopino
- [#3269](https://github.com/cosmos/lunie/issues/3269) Improve behaviour of validator names / images @mariopino
- [#3270](https://github.com/cosmos/lunie/issues/3270) Fix no validator found appears instead of Data loading @mariopino
- [#3292](https://github.com/cosmos/lunie/issues/3292) Fix TmDataLoading component registration in PageValidator @mariopino

## [1.0.152] - 2019-12-14

### Added

- [#3260](https://github.com/cosmos/lunie/pull/3260) Few fixes to better integrate with the Livepeer network @Bitcoinera
- Show errors if transaction fail @faboweb
- added bitrise widgets to readme @jbibla

### Changed

- Reduce gas price to counter gas estimation increase in API @faboweb
- Use the url param for the API also for the transaction service @faboweb
- the proposal description length was unreasonably small, now it is much larger @jbibla
- switched the little x on the action modal to be a proper button @jbibla
- made the edit memo button a link for a cleaner send modal @jbibla
- added explanation and made error message clearer for new ledger updates @jbibla
- the networks page now lives in the mobile app footer instead of in the mobile menu - this is more consistent @jbibla

### Fixed

- [#3283](https://github.com/cosmos/lunie/pull/3283) Now the signin close button redirects directly to root (`/`) @Bitcoinera
- [#3255](https://github.com/cosmos/lunie/pull/3255) Hide menu when changing to block view from menu @colw
- Fix failing sends @faboweb
- Show correct feature flag url for HID support under Windows @faboweb
- Consecutive transactions would fail as the sequence number wasn't updated @faboweb
- Use v2 library for cosmos hub mainnet @faboweb
- [#3205](https://github.com/cosmos/lunie/issues/3205) resolved keyboard and button issues on iOS forms @jbibla
- added special styles for the notch and bottom bar on iPhone X and 11 @jbibla
- the input suffix styles were broken on the delegation modal, but now they are fixed!  @jbibla
- [#3079](https://github.com/cosmos/lunie/issues/3079) Improve proposals in deposit period @mariopino
- [#3269](https://github.com/cosmos/lunie/issues/3269) Improve behaviour of validator names / images @mariopino
- [#3270](https://github.com/cosmos/lunie/issues/3270) Fix no validator found appears instead of Data loading @mariopino
- [#3292](https://github.com/cosmos/lunie/issues/3292) Fix TmDataLoading component registration in PageValidator @mariopino

## [1.0.151] - 2019-12-12

### Added

- [#3260](https://github.com/cosmos/lunie/pull/3260) Few fixes to better integrate with the Livepeer network @Bitcoinera
- added bitrise widgets to readme @jbibla

### Changed

- switched the little x on the action modal to be a proper button @jbibla
- made the edit memo button a link for a cleaner send modal @jbibla
- added explanation and made error message clearer for new ledger updates @jbibla
- the networks page now lives in the mobile app footer instead of in the mobile menu - this is more consistent @jbibla

### Fixed

- [#3283](https://github.com/cosmos/lunie/pull/3283) Now the signin close button redirects directly to root (`/`) @Bitcoinera
- [#3255](https://github.com/cosmos/lunie/pull/3255) Hide menu when changing to block view from menu @colw
- Fix failing sends @faboweb
- Show correct feature flag url for HID support under Windows @faboweb
- [#3270](https://github.com/cosmos/lunie/issues/3270) Fix no validator found appears instead of Data loading @mariopino

## [1.0.150] - 2019-12-09

### Added

- added bitrise widgets to readme @jbibla

### Fixed

- [#3255](https://github.com/cosmos/lunie/pull/3255) Hide menu when changing to block view from menu @colw
- Fix failing sends @faboweb
- Show correct feature flag url for HID support under Windows @faboweb

## [1.0.149] - 2019-12-06

### Added

- [#3180](https://github.com/cosmos/lunie/pull/3180) Use Lunie Transaction service to estimate an broadcast transactions @colw

### Changed

- show loading images before causing anxiety for user about the state of their portfolio @jbibla

### Code Improvements

- cleaned up bar styles to match new design and reduce code complexity @jbibla

### Repository

- For automatic releases increment patch version instead of prerelease version @faboweb

## [1.0.148] - 2019-12-05

### Added

- [#3199](https://github.com/cosmos/lunie/issues/3199) Now there is a close button also for mobile screen during the sign in flow @Bitcoinera
- [#3095](https://github.com/cosmos/lunie/issues/3095) Add the subscription to automatically update the user rewards @Bitcoinera
- defer loading intercom script @jbibla
- [#3078](https://github.com/cosmos/lunie/issues/3078) Improve design of Activity page and support multisend transactions @mariopino

### Changed

- [#3240](https://github.com/cosmos/lunie/issues/3240) Swithing to query batching @iambeone
- [#3247](https://github.com/cosmos/lunie/issues/3247) Use WebHID for Ledger on Windows and WebUSB for Ledger on OSX/Linux to improve stability @faboweb
- changed the image for lunie on open graph @jbibla

### Fixed

- Fix votes failing due to low gas estimate @faboweb
- [#3093](https://github.com/cosmos/lunie/issues/3093) Improve error control in PageProposal @mariopino
- [#3201](https://github.com/cosmos/lunie/issues/3201) Fix validators are not being resolved in blocks page @mariopino
- [#3237](https://github.com/cosmos/lunie/issues/3237) Workaround to fix wrong denom NDEFINED showed in Staking and Restaking transactions @mariopino

### Code Improvements

- Add again the withdraw-validator-commission to the list of message types in the messageTypes.js file @Bitcoinera

## [1.0.0-beta.147] - 2019-11-29

### Fixed

- [#3226](https://github.com/cosmos/lunie/issues/3226) Fixed url passed as parameter after refresing @iambeone
- [#3172](https://github.com/cosmos/lunie/issues/3172) Fixed menu scrolling up on mobile @faboweb
- Reverting the ledger library update @faboweb

## [1.0.0-beta.146] - 2019-11-29

### Fixed

- [#3218](https://github.com/cosmos/lunie/pull/3218) Fix small typo in delegations query @colw
- Hide balance header on page proposals @faboweb

## [1.0.0-beta.145] - 2019-11-28

### Added

- [#3173](https://github.com/cosmos/lunie/issues/3173) Now when it is started the app chooses either the first mainnet available or the local-testnet from the existing networks, directly connecting to one @Bitcoinera
- Added network icon for Regen @Bitcoinera

### Changed

- upgraded cosmos-keys and cosmos-ledger libraries @jbibla
- implement lazy loading, code splitting, and chunking for improved performance @jbibla

### Fixed

- Now the proposals page behaves properly, displaying a banner in case there are no proposals in the network saying "No Governance Proposals". Also removed PageContainer from PageProposals @Bitcoinera
- Updated Ledger lib to update existing bug @faboweb
- Refetching undelegations failed @faboweb
- [#3184](https://github.com/cosmos/lunie/issues/3184) signing in with an existing account was restricted to insecure mode but is now enabled in mobile @jbibla

### Deprecated

- removed moment.js locales because they are large and unused @jbibla

### Code Improvements

- [#3182](https://github.com/cosmos/lunie/issues/3182) I added "?ref=lunie" at the end of the outgoing links @Bitcoinera
- Removed references to Cosmos REST API (stargate) @faboweb

### Repository

- Switch to release apps from master instead of from the release branches @faboweb
- Disabling the e2e tests as they don't work consistantly @faboweb

## [1.0.0-beta.144] - 2019-11-22

### Added

- Added icons for Terra @faboweb

### Fixed

- [#3176](https://github.com/cosmos/lunie/pull/3176) Withdrawal was not working as message was empty @colw

## [1.0.0-beta.143] - 2019-11-21

### Added

- Added icons for Terra @faboweb

### Fixed

- [#3176](https://github.com/cosmos/lunie/pull/3176) Withdrawal was not working as message was empty @colw

## [1.0.0-beta.142] - 2019-11-20

### Added

- [#3074](https://github.com/cosmos/lunie/issues/3074) Now it is possible to navigate within the proposals themselves forwards and backwards @Bitcoinera
- [#3141](https://github.com/cosmos/lunie/pull/3141) Loading indidcator for proposal list @colw
- Added icons and splash screens for Android @faboweb
- Sign across Cosmos SDK v0 and Cosmos SDK v2 @faboweb

### Changed

- [#2982](https://github.com/cosmos/lunie/issues/2982) Now user gets signed out every time they switch networks @Bitcoinera
- [#3063](https://github.com/cosmos/lunie/issues/3063) Now Lunie remembers the last network you selected. Network persistency @Bitcoinera
- [#3133](https://github.com/cosmos/lunie/issues/3133) Now the networks page also has a loader @Bitcoinera
- [#3077](https://github.com/cosmos/lunie/issues/3077) fixed button to bottom on forms and addressed some strange scrolling behaviour @jbibla
- [#3101](https://github.com/cosmos/lunie/issues/3101) only load StatusBar on mobile devices to avoid console error in browsers @jbibla
- changed the material-icons package to only download iconfonts instead of all assets @jbibla
- session screens handle mobile and insecure modes properly @jbibla
- [#3144](https://github.com/cosmos/lunie/issues/3144) hid available ATOM when zero balance for mobile and reduced confusion on desktop @jbibla
- [#3115](https://github.com/cosmos/lunie/issues/3115) Hide tooltips on mobile app @mariopino
- [#3148](https://github.com/cosmos/lunie/issues/3148) Do not show cookie warn in mobile app @mariopino

### Fixed

- [#3145](https://github.com/cosmos/lunie/issues/3145) Fix the voting period dates displayed @Bitcoinera
- [#3128](https://github.com/cosmos/lunie/pull/3128) Mobile app header not showing and Networks showing in the mobile app menu @Bitcoinera
- [#3130](https://github.com/cosmos/lunie/issues/3130) Delegation rewards were not displaying in validator list @colw
- refetching from network only was failing @faboweb
- fixing failing e2e tests @faboweb
- [#3151](https://github.com/cosmos/lunie/pull/3151) removed package-lock.json to solve build issue in bitrise @jbibla
- mobile app config wasn't loaded properly in main.js @jbibla
- [#3119](https://github.com/cosmos/lunie/issues/3119) Fix scroll to top when open a new page that needs scroll @mariopino
- [#3131](https://github.com/cosmos/lunie/issues/3131) Don't show the loading screen when using search bar @mariopino
- [#3146](https://github.com/cosmos/lunie/issues/3146) Fix insecure mode handling @mariopino

## [1.0.0-beta.141] - 2019-11-18

### Changed

- [#3077](https://github.com/cosmos/lunie/issues/3077) fixed button to bottom on forms and addressed some strange scrolling behaviour @jbibla
- [#3101](https://github.com/cosmos/lunie/issues/3101) only load StatusBar on mobile devices to avoid console error in browsers @jbibla
- changed the material-icons package to only download iconfonts instead of all assets @jbibla

### Fixed

- [#3151](https://github.com/cosmos/lunie/pull/3151) removed package-lock.json to solve build issue in bitrise @jbibla

## [1.0.0-beta.140] - 2019-11-15

### Fixed

- Proposal would fail to load if not signed in @faboweb

## [1.0.0-beta.139] - 2019-11-14

### Added

- Allow setting of default network via environment variable (mainly for e2e tests) @faboweb
- [#3045](https://github.com/cosmos/lunie/issues/3045) Update the UI when a transaction of the user is successful @faboweb
- [#3076](https://github.com/cosmos/lunie/issues/3076) Resolve proposal proposer to moniker if it is a validator address @mariopino

### Changed

- Use Apollo subscription for connection indicator @faboweb

### Fixed

- Allow definition of a https graphql url in development mode @faboweb
- [#3094](https://github.com/cosmos/lunie/issues/3094) Fix bug in Proposals @mariopino

### Deprecated

- [#3127](https://github.com/cosmos/lunie/pull/3127) Delete a former duplicate of the material-icons stylesheet @Bitcoinera

### Code Improvements

- [###2918](https://github.com/cosmos/lunie/issues/##2918) material design icons are now served directly @Bitcoinera
- [#3021](https://github.com/cosmos/lunie/issues/3021) Change proposals to be queried via new API @faboweb

### Repository

- [#3048](https://github.com/cosmos/lunie/issues/3048) Sentry integration was added @iambeone
- Using lunie-backend for e2e tests @faboweb
- Updated the README.md @faboweb
- Added script to simplify e2e tests @faboweb

## [1.0.0-beta.138] - 2019-11-14

### Deprecated

- [#3127](https://github.com/cosmos/lunie/pull/3127) Delete a former duplicate of the material-icons stylesheet @Bitcoinera

### Code Improvements

- [###2918](https://github.com/cosmos/lunie/issues/##2918) material design icons are now served directly @Bitcoinera

## [1.0.0-beta.137] - 2019-11-12

### Added

- [#3107](https://github.com/cosmos/lunie/issues/3107) Improve mobile app development flow @mariopino
- [#3113](https://github.com/cosmos/lunie/issues/3113) Handle MOBILE_APP environment variable in vue.config.js, redirect 404 to index.html in serve:dist target @mariopino

### Fixed

- [#3106](https://github.com/cosmos/lunie/issues/3106) Fix buggy app menu behaviour in mobile when scroll down. @mariopino

## [1.0.0-beta.136] - 2019-11-11

### Repository

- [#3048](https://github.com/cosmos/lunie/issues/3048) Sentry integration was added @iambeone

## [1.0.0-beta.135] - 2019-11-08

### Repository

- [#3048](https://github.com/cosmos/lunie/issues/3048) Sentry integration was added @iambeone

## [1.0.0-beta.134] - 2019-11-07

### Repository

- [#3048](https://github.com/cosmos/lunie/issues/3048) Sentry integration was added @iambeone

## [1.0.0-beta.133] - 2019-11-03

### Added

- [#3054](https://github.com/cosmos/lunie/issues/3054) added proper icons and splash screens for iOS @jbibla

### Changed

- [#3054](https://github.com/cosmos/lunie/issues/3054) focusing on form inputs won't zoom the screen in anymore @jbibla
- [#3054](https://github.com/cosmos/lunie/issues/3054) on mobile, lunie logo doesn't go to marketing site anymore @jbibla
- [#3054](https://github.com/cosmos/lunie/issues/3054) hidden session and action-modal steps on mobile to account for size of screen and avoid forms breaking @jbibla

### Deprecated

- [#2895](https://github.com/cosmos/lunie/issues/2895) Remove unneeded caching code @mariopino

## [1.0.0-beta.132] - 2019-10-29

### Repository

- always set the encryption disclaimer for submitting the app to the ios app store @faboweb

## [1.0.0-beta.131] - 2019-10-24

### Repository

- always set the encryption disclaimer for submitting the app to the ios app store @faboweb

## [1.0.0-beta.130] - 2019-10-23

### Added

- [#2961](https://github.com/cosmos/lunie/issues/2961) Create a component to display a 24 words seed phrase showing the word number @mariopino

### Changed

- [#2894](https://github.com/cosmos/lunie/issues/2894) Refactor signin steps into separate screens, including a success screen. @colw @mariopino

## [1.0.0-beta.129] - 2019-10-16

### Repository

- [#978](https://github.com/cosmos/lunie/issues/978) Moved config.js to root directory @faboweb

## [1.0.0-beta.128] - 2019-10-08

### Added

- [#2821](https://github.com/cosmos/lunie/issues/2821) Use account list in explore mode with previously used addresses @mariopino

## [1.0.0-beta.127] - 2019-10-06

### Fixed

- Fix PageBlocks not loading @faboweb
- little fixes for maintenance bar, connected networkcomponent, and max button @jbibla
- release script for ios was targeting wrong file @jbibla

## [1.0.0-beta.126] - 2019-10-02

### Added

- [#1932](https://github.com/cosmos/lunie/issues/1932) Warn if user is trying to delegate to a jailed/tombstone validator @mariopino

### Fixed

- [#3006](https://github.com/cosmos/lunie/pull/3006) Network images were not showing @faboweb
- [#2938](https://github.com/cosmos/lunie/issues/2938) Prevent destination address to expand over its container on Send confirmation screen.  @mariopino

## [1.0.0-beta.125] - 2019-10-01

### Fixed

- We don't need to call these infos anymore as we have the info from the backend @faboweb
- [#2983](https://github.com/cosmos/lunie/issues/2983) Fix undefined validator moniker in redelegations @mariopino

### Repository

- [#3002](https://github.com/cosmos/lunie/pull/3002) Adding mobile release files and scripts @faboweb

## [1.0.0-beta.124] - 2019-09-19

### Changed

- Switched to http in local testnet environment @faboweb
- [#2302](https://github.com/cosmos/lunie/issues/2302) Show INACTIVE status if validator is either jailed or tombstoned @mariopino

### Repository

- Enable all features on "testnet" @faboweb

## [1.0.0-beta.123] - 2019-09-18

### Added

- [#2820](https://github.com/cosmos/lunie/issues/2820) Warn user if the current address is not in the extension account list, and disable sign button. @colw

## [1.0.0-beta.122] - 2019-09-17

### Fixed

- [#2898](https://github.com/cosmos/lunie/issues/2898) Uptime on PageValidator didn't show as percent @faboweb
- [#2965](https://github.com/cosmos/lunie/issues/2965) Change Set Max button style to secondary, fixed bug in warning message. @mariopino

### Code Improvements

- [#2988](https://github.com/cosmos/lunie/issues/2988) Removed Intercom ID at another place @faboweb
- [#2967](https://github.com/cosmos/lunie/issues/2967) Refactor cookie, maintenance and disconnected bar @mariopino

## [1.0.0-beta.121] - 2019-09-16

### Added

- [#2482](https://github.com/cosmos/lunie/issues/2482) Confirm closing a modal before opening a second @colw
- [#2504](https://github.com/cosmos/lunie/issues/2504) Warn user about staking, with option to switch types @colw
- [#2655](https://github.com/cosmos/lunie/issues/2655) Action modal back button @colw
- [#1771](https://github.com/cosmos/lunie/issues/1771) Group transactions by date @faboweb
- cleaned up forms and made some adjustments for the extension @jbibla
- added intercom @jbibla
- [#2858](https://github.com/cosmos/lunie/issues/2858) Add warning field to backend @mariopino

### Changed

- [#2973](https://github.com/cosmos/lunie/pull/2973) Remove experimental flag from network selector @faboweb
- [#2973](https://github.com/cosmos/lunie/pull/2973) Show local testnet in network selector @faboweb
- [#2969](https://github.com/cosmos/lunie/issues/2969) removed footer and other style improvements @jbibla
- unhide the browser extension option on session screens @jbibla

### Fixed

- [#2649](https://github.com/cosmos/lunie/issues/2649) Don't allow validator address at sign in @mariopino

### Code Improvements

- [#2973](https://github.com/cosmos/lunie/pull/2973) Use standard websockets for Tendermint @faboweb

### Repository

- Prevent checkin of code with lint warnings (before only errors) @faboweb

## [1.0.0-beta.120] - 2019-09-10

### Fixed

- [#2963](https://github.com/cosmos/lunie/issues/2963) Increase circleci testUnit test timeout from 120 to 180 seconds @mariopino

### Repository

- [#2929](https://github.com/cosmos/lunie/issues/2929) Test the browser extension before Lunie-core releases @faboweb

## [1.0.0-beta.119] - 2019-09-08

### Added

- [#2928](https://github.com/cosmos/lunie/pull/2928) Add Network page with a slection of different networks to select @colw
- [#2947](https://github.com/cosmos/lunie/pull/2947) Ability to filter validator list by name or jailed status @colw
- [#2670](https://github.com/cosmos/lunie/issues/2670) Add "max" button to amount fields #2670 @mariopino

### Changed

- change the lunie logo to include wordmark @jbibla

## [1.0.0-beta.118] - 2019-09-06

### Fixed

- [#2935](https://github.com/cosmos/lunie/issues/2935) Show no proposals message again @faboweb
- [#2940](https://github.com/cosmos/lunie/pull/2940) PageBlock was jumping between blocks @faboweb
- [#2940](https://github.com/cosmos/lunie/pull/2940) Monikers were not showing correctly for transactions @faboweb
- [#2940](https://github.com/cosmos/lunie/pull/2940) Fixed dupelicate keys in transaction list @faboweb

### Code Improvements

- [#2940](https://github.com/cosmos/lunie/pull/2940) Removed not used or unnecessary properties from blocks module @faboweb

## [1.0.0-beta.117] - 2019-09-05

### Added

- [#2671](https://github.com/cosmos/lunie/issues/2671) Show validator rank number in Validator list @mariopino

### Repository

- [#2944](https://github.com/cosmos/lunie/pull/2944) Remove S3 upload from CI @faboweb
- Update README to include docker compose as development dependendy. @mariopino

## [1.0.0-beta.116] - 2019-09-03

### Fixed

- Use correct query for feature detection in actionmodal @faboweb

## [1.0.0-beta.115] - 2019-09-03

### Changed

- [#2926](https://github.com/cosmos/lunie/pull/2926) Fetch validator information using graphql @colw
- [#2903](https://github.com/cosmos/lunie/issues/2903) Change to new logo @faboweb
- [#2904](https://github.com/cosmos/lunie/issues/2904) Allow to switch features and interactions dependend on network capabilities @faboweb

### Fixed

- [#2933](https://github.com/cosmos/lunie/pull/2933) Fix warnings from duplicate addresses in test values @colw
- [#2937](https://github.com/cosmos/lunie/pull/2937) Remove test warnings by updating test data and removing old fields. @colw

### Repository

- Fail if jest outputs a console.error @faboweb

## [1.0.0-beta.114] - 2019-08-30

### Fixed

- [#2925](https://github.com/cosmos/lunie/pull/2925) Adjust build bundle paths to allow for html5 deep linking @faboweb

## [1.0.0-beta.113] - 2019-08-29

### Changed

- Change to use html5 history mode for router @faboweb

## [1.0.0-beta.112] - 2019-08-28

### Added

- [#2912](https://github.com/cosmos/lunie/pull/2912) Warn Windows users about Nano S singing limitation @colw

### Repository

- [#2915](https://github.com/cosmos/lunie/pull/2915) Ability to run a speedy testnet to improve e2e tests @faboweb
- [#2915](https://github.com/cosmos/lunie/pull/2915) Make main validator of testnet greedy to reduce received rewards to 0 for predictability @faboweb
- [#2914](https://github.com/cosmos/lunie/pull/2914) Switched back to codecov @faboweb
- [#2914](https://github.com/cosmos/lunie/pull/2914) Disabled duplicate code detection in codeclimate @faboweb

## [1.0.0-beta.111] - 2019-08-26

### Fixed

- [#2908](https://github.com/cosmos/lunie/issues/2908) Redirect old routes to new routes @faboweb
- [#2910](https://github.com/cosmos/lunie/pull/2910) Fixed bad validator image sizing @faboweb

## [1.0.0-beta.110] - 2019-08-26

### Added

- [#2896](https://github.com/cosmos/lunie/pull/2896) Allow user to set graphql endpoint as a URL parametera @colw

### Changed

- [#2885](https://github.com/cosmos/lunie/issues/2885) Do not show ledger or extension sign-in options on mobile @colw
- [#2850](https://github.com/cosmos/lunie/pull/2850) Adjusted to new desktop menu @faboweb
- [#2850](https://github.com/cosmos/lunie/pull/2850) Menu on mobile is on the bottom @faboweb
- [#2850](https://github.com/cosmos/lunie/pull/2850) Removed store caching mechanism @faboweb

### Fixed

- [#2901](https://github.com/cosmos/lunie/pull/2901) Use latest chromedriver for local testing @colw

### Code Improvements

- [#2850](https://github.com/cosmos/lunie/pull/2850) Move most of the queries to run at application start @faboweb

### Repository

- [#2893](https://github.com/cosmos/lunie/pull/2893) Fixed preview on CircleCI @faboweb
- Added vetur html formatting rules to vscode config @faboweb
- this is needed for babel and jest to play nicely on my machine @jbibla

## [1.0.0-beta.109] - 2019-08-19

### Fixed

- [#2864](https://github.com/cosmos/lunie/issues/2864) Remove 'first seen' field from validator. Data not present. @colw

## [1.0.0-beta.108] - 2019-08-15

### Added

- Show generated avatars for validators without a profile image @faboweb

### Fixed

- [#2881](https://github.com/cosmos/lunie/pull/2881) Default validator images not showing @faboweb

## [1.0.0-beta.107] - 2019-08-13

### Added

- [#2869](https://github.com/cosmos/lunie/pull/2869) Fetch validator info using GraphQL @colw

### Security

- [#2875](https://github.com/cosmos/lunie/pull/2875) Allow minor upgrades in package.json @colw

### Deprecated

- [#2865](https://github.com/cosmos/lunie/issues/2865) Remove Sentry @colw

## [1.0.0-beta.106] - 2019-08-13

### Added

- Added infinite scroll to validator list @faboweb

### Changed

- [#2870](https://github.com/cosmos/lunie/pull/2870) Keep staking tabs in memory even when switching between them @colw

### Fixed

- [#2871](https://github.com/cosmos/lunie/pull/2871) Sort panel does not error on Network page @colw

### Code Improvements

- [#2867](https://github.com/cosmos/lunie/pull/2867) Remove some getters and convert to mapState @colw

## [1.0.0-beta.105] - 2019-08-07

### Code Improvements

- [#2846](https://github.com/cosmos/lunie/pull/2846) Refactor Transaction types and component rendering @colw

### Repository

- [#2860](https://github.com/cosmos/lunie/pull/2860) Switched to vue-cli-3 @faboweb

## [1.0.0-beta.104] - 2019-08-04	

 ### Changed	

 - SEO improvements, accessibility fixes, etc. @jbibla

## [1.0.0-beta.103] - 2019-08-03

### Changed

- Show 0 returns for non validating validators @faboweb
- improved proposal list and page proposal @jbibla

## [1.0.0-beta.102] - 2019-08-02

### Fixed

- Updated cosmos-api to include minting endpoints @faboweb

## [1.0.0-beta.101] - 2019-07-31

### Changed

- [#2848](https://github.com/cosmos/lunie/pull/2848) Only show one attribute on mobile list of validators @faboweb

## [1.0.0-beta.100] - 2019-07-30

### Added

- [#2847](https://github.com/cosmos/lunie/pull/2847) Added expected returns calculation to validators @faboweb

### Changed

- Show signin with extension if user has extension @faboweb
- [#2847](https://github.com/cosmos/lunie/pull/2847) Make validator row item clickable @faboweb

### Fixed

- [#2843](https://github.com/cosmos/lunie/issues/2843) The cache was not cleared on a sign in if already signed in @faboweb

### Deprecated

- [#2840](https://github.com/cosmos/lunie/pull/2840) Remove file and spec since it is for the extension @colw

## [1.0.0-beta.99] - 2019-07-22

### Added

- [#ext 76](https://github.com/cosmos/lunie/pull/ext 76) Adds conditional rendering to the back button is SessionFrame so that it can not show in the extension on certain pages @thebkr7

### Changed

- [#2839](https://github.com/cosmos/lunie/pull/2839) Add provided RPC and STARGATE URL's to Content-Security-Policy connect-src list @asoltys

### Fixed

- [#2835](https://github.com/cosmos/lunie/pull/2835) Errors from extension were not handled in async requests @faboweb

## [1.0.0-beta.98] - 2019-07-18

### Added

- Adds back buttons to TmSessionSignUp and TmSessionImport that are only shown in the extension @thebkr7
- [#2828](https://github.com/cosmos/lunie/pull/2828) Added disconnected bar and prevent infinite reconnect attempts @faboweb

### Repository

- [#2824](https://github.com/cosmos/lunie/pull/2824) Added browserstak for cross browser testing @faboweb

## [1.0.0-beta.97] - 2019-07-14

### Fixed

- [#2825](https://github.com/cosmos/lunie/pull/2825) Cancel send afer user rejects transaction @colw

### Security

- [#2829](https://github.com/cosmos/lunie/pull/2829) Updated lodash dependencies @faboweb

### Deprecated

- deleted a bunch of unused session code @jbibla

### Code Improvements

- [#2825](https://github.com/cosmos/lunie/pull/2825) Remove SessionApproval view, move to Extension @colw

## [1.0.0-beta.96] - 2019-07-12

### Added

- [#2807](https://github.com/cosmos/lunie/pull/2807) Include visual studio code config @colw
- [#2788](https://github.com/cosmos/lunie/issues/2788) Added success step to ActionModal @faboweb

### Repository

- Fixed postcss browserlist warning @faboweb

## [1.0.0-beta.95] - 2019-07-11

### Added

- [#2814](https://github.com/cosmos/lunie/pull/2814) Display accounts in sign on screen @colw
- [#2512](https://github.com/cosmos/lunie/issues/2512) Added step to actionmodal to show that Lunie has sent the tx and is waiting for confirmation @faboweb

### Fixed

- Fixed amounts in approval screen @faboweb

## [1.0.0-beta.94] - 2019-07-09

### Added

- Adds a button to SessionAccounts to Add Account and includes a test @thebkr7

### Code Improvements

- refactored AccountList for consistency across uses @jbibla

## [1.0.0-beta.93] - 2019-07-05

### Fixed

- Fix response handling of extension sign request @faboweb

### Code Improvements

- [#2801](https://github.com/cosmos/lunie/issues/2801) Refactors TableInvoice to receive bondDenom as props and updates tests @thebkr7
- [#ext-28](https://github.com/cosmos/lunie/issues/ext-28) Refactors so TableInvoice takes the total fee rather than taking two numbers as props and calculating it there. @thebkr7
- [#2785](https://github.com/cosmos/lunie/pull/2785) Refactors SessionApprove to pass TableInvoice the subtotal fee and amount of the transaction. TableInvoice was refactored in PR #2785 @thebkr7
- [#2784](https://github.com/cosmos/lunie/pull/2784) extension SessionAccounts displays real accounts and has Add Account button @thebkr7
- refactored session modals to use vue-router @jbibla

## [1.0.0-beta.92] - 2019-07-04

### Added

- 3 components for the Chrome Extension: Approve Transaction, Account, Backup Codes @thebkr7

### Fixed

- [#2636](https://github.com/cosmos/lunie/issues/2636) Handle bad API response for empty rewards and force update of rewards after withdraw @faboweb
- [#2800](https://github.com/cosmos/lunie/issues/2800) Fix PageProposal crashing if deep linked @faboweb

### Code Improvements

- Removed querying for totalRewards in favor of calculating those from validator rewards @faboweb

## [1.0.0-beta.91] - 2019-07-02

### Fixed

- [#2793](https://github.com/cosmos/lunie/issues/2793) Removed address confirmation for Ledger Nano @faboweb

## [1.0.0-beta.90] - 2019-07-01

### Fixed

- [#2766](https://github.com/cosmos/lunie/issues/2766) mobile improvements for session flow @jbibla

### Repository

- Removed publish step as not working and security critical @faboweb

## [1.0.0-beta.89] - 2019-06-27

### Changed

- [#2749](https://github.com/cosmos/lunie/issues/2749) Updated how delegation transactions addresses appear in the Transactions screen. Shortened address to match @thebkr7
- [#2674](https://github.com/cosmos/lunie/issues/2674) Max the fees to the available balance @faboweb

### Code Improvements

- Extracted local keystore from session module @faboweb
- Extracted session styles from session parent component @faboweb
- [#1742](https://github.com/cosmos/lunie/issues/1742) Removed old node mocks @faboweb

### Repository

- Disable indexing in testnet in secondary nodes as not needed to improve performance @faboweb

## [1.0.0-beta.88] - 2019-06-22

### Fixed

- [#2713](https://github.com/cosmos/lunie/issues/2713) Disabling the withdraw button until the necessary validator rewards have been loaded @faboweb

### Repository

- Skip pending check on the develop branch @faboweb

## [1.0.0-beta.87] - 2019-06-22

### Changed

- [#2234](https://github.com/cosmos/lunie/issues/2234) In forms pressing enter either submits or takes you to the next form element @thebkr7

### Fixed

- [#2743](https://github.com/cosmos/lunie/pull/2743) Fixes potential test failure when comparing dates @colw
- [#2738](https://github.com/cosmos/lunie/issues/2738) Load rewards of validators after withdraw @faboweb

### Code Improvements

- [#2735](https://github.com/cosmos/lunie/pull/2735) Refactored the previous commits to use Refs rather than passing functions for submiting forms @thebkr7
- [#2745](https://github.com/cosmos/lunie/pull/2745) Clean action modal template syntax @colw
- [#2741](https://github.com/cosmos/lunie/pull/2741) Refactored session views to be more independent @faboweb

## [1.0.0-beta.86] - 2019-06-20

### Fixed

- added git config to circleci config to stop failing mergebacks @jbibla

## [1.0.0-beta.85] - 2019-06-19

### Changed

- onboarding flow @jbibla

### Fixed

- Fixed depositing format related issues @faboweb

### Repository

- Fixed the "npm run start" command @faboweb

## [1.0.0-beta.84] - 2019-06-18

### Changed

- copy changes for withdrawal message @jbibla

## [1.0.0-beta.83] - 2019-06-17

### Fixed

- Proper loading of validator rewards @faboweb

### Repository

- Added config for codeclimate increasing lines per method allowed to 35 @faboweb

## [1.0.0-beta.82] - 2019-06-16

### Added

- [#2165](https://github.com/cosmos/lunie/issues/2165) Shows end date and time for Governance proposals @thebkr7

### Fixed

- [#2771](https://github.com/cosmos/lunie/pull/2771) Delegates were not loaded before attempting to calculate rewards @colw

### Code Improvements

- updated the cosmos-js module and renamed it to cosmos-api @faboweb

## [1.0.0-beta.81] - 2019-06-13

### Changed

- [#2164](https://github.com/cosmos/lunie/issues/2164) When an invalid validators address is entered a component lets them know and gives them the link to view all validators. @thebkr7

### Fixed

- [#2699](https://github.com/cosmos/lunie/issues/2699) Fixed the bug that was always displaying validators as active when expanded even if they were not @thebkr7
- [#2702](https://github.com/cosmos/lunie/pull/2702) Withdraw correctly from the top 5 rewards @colw

### Code Improvements

- [#2164](https://github.com/cosmos/lunie/issues/2164) Changing how an invalid validators address is handled. Now a page informs users that it is invalid and has a link to view all validators @thebkr7
- [#2164](https://github.com/cosmos/lunie/issues/2164) Refactored Vue Slots in TmPage and TmDataEmpty @thebkr7
- Extracted signer scripts into @lunie/cosmos-keys @faboweb
- [#2681](https://github.com/cosmos/lunie/pull/2681) Extracted the Ledger wrapper into a library @faboweb
- [#2666](https://github.com/cosmos/lunie/issues/2666) removed refresh buttons @jbibla

### Repository

- [#2347](https://github.com/cosmos/lunie/pull/2347) Updates Jest config so that the test coverage summary is printed out when run @thebkr7

## [1.0.0-beta.80] - 2019-06-11

### Changed

- [#2157](https://github.com/cosmos/lunie/issues/2157) Don't hide the create proposal button if signed out @thebkr7
- [#2684](https://github.com/cosmos/lunie/pull/2684) Don't hide the error on action modals after a timeout @faboweb
- [#2694](https://github.com/cosmos/lunie/issues/2694) removed redirects to homepage @jbibla

### Fixed

- [#2687](https://github.com/cosmos/lunie/issues/2687) fixed proposal creation @faboweb

### Code Improvements

- [#2683](https://github.com/cosmos/lunie/issues/2683) Created a function to throttle updates in the store @faboweb

## [1.0.0-beta.79] - 2019-06-04

### Fixed

- [#2663](https://github.com/cosmos/lunie/pull/2663) Add link to buy Ledger Nano S in about page. @colw
- [#2665](https://github.com/cosmos/lunie/pull/2665) Correctly update wallet balance on send to self @faboweb
- [#1234](https://github.com/cosmos/lunie/pull/1234) Keybase cache was not loaded for all validators @faboweb

### Security

- [#2676](https://github.com/cosmos/lunie/pull/2676) Update axios due to security issue @faboweb

### Deprecated

- [#2665](https://github.com/cosmos/lunie/pull/2665) Removed optimistic updates for delegation actions (all actions anyway wait for the tx inclusion into a block) @faboweb

### Code Improvements

- [#2231](https://github.com/cosmos/lunie/issues/2231) Added e2e tests for delegation actions @faboweb

## [1.0.0-beta.78] - 2019-05-28

### Added

- [#2619](https://github.com/cosmos/lunie/pull/2619) Warn user of pending period when undelegating tokens. @colw

### Fixed

- [#2657](https://github.com/cosmos/lunie/issues/2657) Display full transaction value and network fee, do not truncate. @colw

## [1.0.0-beta.77] - 2019-05-24

### Fixed

- [#2659](https://github.com/cosmos/lunie/issues/2659) Load all validators not just bonded once @faboweb

## [1.0.0-beta.76] - 2019-05-24

### Added

- [#2647](https://github.com/cosmos/lunie/pull/2647) Add option to withdraw from a single validator @colw

### Changed

- [#2647](https://github.com/cosmos/lunie/pull/2647) Global withdraw will select the top 5 rewards to withdraw @colw

### Fixed

- [#2654](https://github.com/cosmos/lunie/pull/2654) Fixed sign in e2e test not working because of a too fast click @faboweb
- [#2650](https://github.com/cosmos/lunie/pull/2650) Fixes optimistic update for sending tokens @faboweb

### Repository

- [#2654](https://github.com/cosmos/lunie/pull/2654) Added screenshots if e2e tests fail @faboweb
- [#2651](https://github.com/cosmos/lunie/pull/2651) Remove ga uid and sentry dsn from repo @faboweb
- [#2231](https://github.com/cosmos/lunie/issues/2231) Added e2e test for sending tokens @faboweb

## [1.0.0-beta.75] - 2019-05-21

### Added

- [#2532](https://github.com/cosmos/lunie/pull/2532) Added a sign in e2e test (to demo e2e tests) @faboweb

### Changed

- [#2618](https://github.com/cosmos/lunie/pull/2618) Refactor Transaction view to reduce code repetition @colw
- [#2642](https://github.com/cosmos/lunie/pull/2642) We now increase the gas simulated by 1.2 as recommended by the SDK team to avoid out of gas exceptions @faboweb

### Fixed

- [#2640](https://github.com/cosmos/lunie/issues/2640) Fixed false positives on tx inclusion @faboweb
- [#2643](https://github.com/cosmos/lunie/pull/2643) Don't query the ledger if using a local signer @faboweb

### Deprecated

- [#2626](https://github.com/cosmos/lunie/pull/2626) Removed delegation cart @faboweb

## [1.0.0-beta.74] - 2019-05-20

### Fixed

- [#2627](https://github.com/cosmos/lunie/issues/2627) Fix fee submission in cosmos-js @faboweb

## [1.0.0-beta.73] - 2019-05-19

### Fixed

- [#2630](https://github.com/cosmos/lunie/pull/2630) Fix undelegation message formats being outdated @faboweb

## [1.0.0-beta.72] - 2019-05-19

### Fixed

- [#2628](https://github.com/cosmos/lunie/pull/2628) Fix issue with productive bundling in downstream cosmos-js library @faboweb

## [1.0.0-beta.71] - 2019-05-18

### Fixed

- [#2624](https://github.com/cosmos/lunie/pull/2624) Fix keybase cache creation @faboweb
- [#2617](https://github.com/cosmos/lunie/pull/2617) Add white-space: normal to circle—default class @migueog

## [1.0.0-beta.70] - 2019-05-18

### Added

- [#2382](https://github.com/cosmos/lunie/pull/2382) Compatibility with Ledger Cosmos App 1.5 @faboweb
- [#1962 ](https://github.com/cosmos/lunie/issues/1962 ) Enforce approval of address for Ledger sign in @faboweb
- [#2560](https://github.com/cosmos/lunie/issues/2560) Added careers page @jbibla

### Changed

- [#2568](https://github.com/cosmos/lunie/pull/2568) Show amount of source stake available to delegate or redelgate @colw

### Fixed

- [#2614](https://github.com/cosmos/lunie/pull/2614) Dispaly correct atom value for banking transactions @colw
- [#2568](https://github.com/cosmos/lunie/pull/2568) Do not add stake to total when redelegating @colw
- [#2621](https://github.com/cosmos/lunie/pull/2621) Bring back withdraw button on european browsers @faboweb
- [#2570](https://github.com/cosmos/lunie/pull/2570) Load validators when linking to a validator directly @faboweb

## [1.0.0-beta.69] - 2019-05-17

### Added

- [#1735](https://github.com/cosmos/lunie/issues/1735) implement multi step action modals @migueog
- [#2589](https://github.com/cosmos/lunie/pull/2589) Set number of nodes run on local testnet via environment variable @colw

### Changed

- [#2579](https://github.com/cosmos/lunie/issues/2579) Move remaining Github specific files to .github folder @colw

### Fixed

- [#2378](https://github.com/cosmos/lunie/issues/2378) Do not show withdrawal button when user has no rewards avilable @colw
- [#2601](https://github.com/cosmos/lunie/pull/2601) add missing step lines @migueog
- [#2538](https://github.com/cosmos/lunie/issues/2538) Added sign out menu item to AppMenu.vue @migueog
- [#2592](https://github.com/cosmos/lunie/issues/2592) Add a &nbsp; to LiBankTransaction so that there is a space between From and the address @migueog

### Deprecated

- [#2580](https://github.com/cosmos/lunie/issues/2580) Remove docs folder @colw
- [#2582](https://github.com/cosmos/lunie/issues/2582) Remove unused theme JSON files @colw
- [#2597](https://github.com/cosmos/lunie/pull/2597) Remvoe onboarding code and realted assets @colw

## [1.0.0-beta.68] - 2019-05-15

### Fixed

- [#2587](https://github.com/cosmos/lunie/pull/2587) Keybase cache was not created @faboweb

## [1.0.0-beta.67] - 2019-05-14

### Changed

- [#2584](https://github.com/cosmos/lunie/pull/2584) Switched back to Lunie servers after fixing issues @faboweb

### Fixed

- [#2430](https://github.com/cosmos/lunie/issues/2430) Ensure proposal tallies sum to 100 percent @colw

## [1.0.0-beta.66] - 2019-05-13

### Changed

- [#2577](https://github.com/cosmos/lunie/pull/2577) Build for mainnet always to enable easier previews on PRs (circleci artifacts) @faboweb

### Fixed

- [#2577](https://github.com/cosmos/lunie/pull/2577) Cachebust CircleCI dependencies to fix ledger lib issues @faboweb

## [1.0.0-beta.65] - 2019-05-11

### Added

- [#2561](https://github.com/cosmos/lunie/issues/2561) added a maintenance bar for when there are issues @jbibla

## [1.0.0-beta.64] - 2019-05-11

### Added

- [#2382](https://github.com/cosmos/lunie/pull/2382) Compatibility with Ledger Cosmos App 1.5 @faboweb
- [#1962 ](https://github.com/cosmos/lunie/issues/1962 ) Enforce approval of address for Ledger sign in @faboweb
- [#2560](https://github.com/cosmos/lunie/issues/2560) Added careers page @jbibla

### Changed

- [#2568](https://github.com/cosmos/lunie/pull/2568) Show amount of source stake available to delegate or redelgate @colw

### Fixed

- [#2568](https://github.com/cosmos/lunie/pull/2568) Do not add stake to total when redelegating @colw
- [#2570](https://github.com/cosmos/lunie/pull/2570) Load validators when linking to a validator directly @faboweb
- [#1995](https://github.com/cosmos/lunie/issues/1995) Prevent users from signing in or creating a new account if their user agent is not Chrome @migueog

## [1.0.0-beta.63] - 2019-05-10

### Changed

- [#2565](https://github.com/cosmos/lunie/pull/2565) Requests now retry 3 times before they fail to accomodate stargate timeouts @faboweb

### Fixed

- [#2557](https://github.com/cosmos/lunie/pull/2557) Do not add undelegation amount to transaction subtotal @colw
- [#2563](https://github.com/cosmos/lunie/pull/2563) Temporaryly switching to cosmos nodes @faboweb

## [1.0.0-beta.62] - 2019-05-08

### Fixed

- [#2446](https://github.com/cosmos/lunie/issues/2446) Validate total invoice amount, including network fees. @colw
- [#2554](https://github.com/cosmos/lunie/issues/2554) Add missing footer to pages linked in footer @colw
- [#2551](https://github.com/cosmos/lunie/pull/2551) Removed validatorset calls as we don't need them and they caused issues @faboweb
- [#2551](https://github.com/cosmos/lunie/pull/2551) Removed keybase identities updates as they caused troubles and we deliver a cache with every release @faboweb

## [1.0.0-beta.61] - 2019-05-07

### Fixed

- [#2542](https://github.com/cosmos/lunie/pull/2542) Do not run style lint on dist folder @colw
- [#2543](https://github.com/cosmos/lunie/pull/2543) Switch code coverage to live-server @colw

## [1.0.0-beta.60] - 2019-05-05

### Fixed

- [#2539](https://github.com/cosmos/lunie/pull/2539) Delegations did not show on my delegations page @faboweb

## [1.0.0-beta.59] - 2019-05-03

### Added

- [#2189](https://github.com/cosmos/lunie/issues/2189) Escape key will close modal @colw

### Fixed

- [#2515](https://github.com/cosmos/lunie/issues/2515) Typo and logo's path update @gin
- [#2461](https://github.com/cosmos/lunie/issues/2461) Load all validators @faboweb
- [#2506](https://github.com/cosmos/lunie/issues/2506) Prepends https:// to links that do not include https:// or http:// @migueog

## [1.0.0-beta.58] - 2019-05-02

### Fixed

- [#2525](https://github.com/cosmos/lunie/pull/2525) Fix signin in with local account @faboweb

## [1.0.0-beta.57] - 2019-05-02

### Fixed

- [#2523](https://github.com/cosmos/lunie/pull/2523) Move back to own servers after outage @faboweb

## [1.0.0-beta.56] - 2019-05-02

### Fixed

- [#2521](https://github.com/cosmos/lunie/pull/2521) add nylira nodes to CSP @faboweb

## [1.0.0-beta.55] - 2019-05-02

### Fixed

- [#2519](https://github.com/cosmos/lunie/pull/2519) Cover outage by moving to nylira nodes @faboweb

## [1.0.0-beta.54] - 2019-05-02

### Added

- [#1797](https://github.com/cosmos/lunie/issues/1797) Added notification about cookies and error tracking @faboweb
- [#2517](https://github.com/cosmos/lunie/pull/2517) Readded the insecure flag to allow users to access their local wallets @faboweb

## [1.0.0-beta.53] - 2019-05-01

### Changed

- [#2509](https://github.com/cosmos/lunie/pull/2509) Switched to linting on push only @faboweb

### Fixed

- [#2513](https://github.com/cosmos/lunie/pull/2513) Remove local signer on mainnet @faboweb

## [1.0.0-beta.52] - 2019-04-30

### Fixed

- [#2500](https://github.com/cosmos/lunie/issues/2500) Fixed displaying voting power @faboweb
- [#2500](https://github.com/cosmos/lunie/issues/2500) Fixed displaying of self delegation ratio @faboweb
- [#2502](https://github.com/cosmos/lunie/pulls/2502) Fixed redelegation @faboweb
- [#2499](https://github.com/cosmos/lunie/pull/2499) Fix withdraw in europe number format @faboweb
- [#2493](https://github.com/cosmos/lunie/pull/2493) Throws an error if Ledger Cosmos App is outdated @faboweb

## [1.0.0-beta.51] - 2019-04-28

### Added

- [#2265](https://github.com/cosmos/lunie/issues/2265) Added memo to transactions list and input to send modal (without forced memo suffix) @faboweb

### Changed

- [#2495](https://github.com/cosmos/lunie/pull/2495) Added prettier for simple code formating @faboweb

## [1.0.0-beta.50] - 2019-04-28

### Changed

- [#2491](https://github.com/cosmos/lunie/pull/2491) Restructured the repository to simplify it @faboweb
- [#2455](https://github.com/cosmos/lunie/issues/2455) standardized numbers throughout lunie and reduced to 3 decimal points @jbibla

### Fixed

- [#2487](https://github.com/cosmos/lunie/pull/2487) Removed rounding in small numbers @faboweb
- [#2486](https://github.com/cosmos/lunie/issues/2486) transactions list items were broken @jbibla

## [1.0.0-beta.49] - 2019-04-26

### Fixed

- [#2487](https://github.com/cosmos/lunie/pull/2487) Remove rounding in small numbers @faboweb

## [1.0.0-beta.48] - 2019-04-25

### Fixed

- [#2475](https://github.com/cosmos/lunie/issues/2475) fixed delegation, redelegation, and undelegation issues @jbibla
- [#2476](https://github.com/cosmos/lunie/issues/2476) fixed redelegation errors @jbibla

### Security

- [#2463](https://github.com/cosmos/lunie/pull/2463) Added a CSP header to limit source of JS and connections content of the website can do @faboweb

## [1.0.0-beta.47] - 2019-04-24

### Fixed

- [#2475](https://github.com/cosmos/lunie/issues/2475) fixed delegation, redelegation, and undelegation issues @jbibla

### Security

- [#2463](https://github.com/cosmos/lunie/pull/2463) Added a CSP header to limit source of JS and connections content of the website can do @faboweb

## [1.0.0-beta.46] - 2019-04-23

### Fixed

- [#2470](https://github.com/cosmos/lunie/pull/2470) Fixed proposal displaying due to SDK update @faboweb

## [1.0.0-beta.45] - 2019-04-23

### Fixed

- [#2467](https://github.com/cosmos/lunie/pull/2467) Fixed sending by fixing the send body according to the SDK update @faboweb

## [1.0.0-beta.44] - 2019-04-21

### Fixed

- [#2431](https://github.com/cosmos/lunie/issues/2431) check for ledger on submit to avoid action modal failures @jbibla
- [#2413](https://github.com/cosmos/lunie/issues/2413) page validator uptime was not showing @jbibla

## [1.0.0-beta.43] - 2019-04-16

### Added

- [#2449](https://github.com/cosmos/lunie/pull/2449) added new circle ci badge to readme @jbibla

### Fixed

- [#2431](https://github.com/cosmos/lunie/issues/2431) check for ledger on submit to avoid action modal failures @jbibla
- [#2449](https://github.com/cosmos/lunie/issues/2449) explore mode should not ask for password in action modals @jbibla
- [#0](https://github.com/cosmos/lunie/issues/0) tm connected network still included the word testnet in the language @jbibla
- [#2445](https://github.com/cosmos/lunie/issues/2445) page validator label should be ATOM not uatom @jbibla
- [#2448](https://github.com/cosmos/lunie/issues/2448) proposal description is awkward @jbibla

## [1.0.0-beta.42] - 2019-04-08

### Fixed

- [#2435](https://github.com/cosmos/lunie/issues/2435) Fixed fee display for sending tokens @faboweb
- [#2435](https://github.com/cosmos/lunie/issues/2435) Fixed fee denom not being correct and therefor sending not working @faboweb
- [#2441](https://github.com/cosmos/lunie/pull/2441) Fixed account cache restoration @faboweb

## [1.0.0-beta.41] - 2019-04-08

### Fixed

- [#2353](https://github.com/cosmos/lunie/issues/2353) cleaned up many styling issues and resolved scroll issue @jbibla

## [1.0.0-beta.40] - 2019-04-06

### Added

- [#2434](https://github.com/cosmos/lunie/pull/2434) Automatic commit of changelog files to git @faboweb

### Changed

- [#2436](https://github.com/cosmos/lunie/pull/2436) Improved documentation on manual releases @faboweb
- [#2433](https://github.com/cosmos/lunie/pull/2433) Switch servers to Lunie servers @faboweb

## [1.0.0-beta.39] - 2019-04-06

### Added

- [#2424](https://github.com/cosmos/lunie/pull/2424) Lint files on every commit but only staged files @faboweb

### Fixed

- [#2427](https://github.com/cosmos/lunie/pull/2427) Fixed sign in with address not visible @faboweb

## [1.0.0-beta.38] - 2019-04-05

### Added

- [#2393](https://github.com/cosmos/lunie/issues/2393) Sign in with just an address for exploration @faboweb
- [#2419](https://github.com/cosmos/lunie/pull/2419) Merge master back to dev @faboweb

### Changed

- [#2423](https://github.com/cosmos/lunie/pull/2423) ActionModal doesn't close anymore when clicking outside @faboweb

## [1.0.0-beta.37] - 2019-04-04

### Changed

- [#2402](https://github.com/cosmos/lunie/pull/2402) Updated several dependencies + removed some + slimmed down tendermint-js @faboweb

### Fixed

- [#2413](https://github.com/cosmos/lunie/issues/2413) Fix uptime not displaying @faboweb
- [#2416](https://github.com/cosmos/lunie/pull/2416) Fixed stitching of changelog @faboweb

## [1.0.0-beta.36] - 2019-04-03

### Changed

- [#2409](https://github.com/cosmos/lunie/pull/2409) Enable web accounts per default on a testnet @faboweb

## [1.0.0-beta.35] - 2019-04-03

### Added
- [#2405](https://github.com/cosmos/lunie/pull/2405) Deploy master with testnet endpoints to the testnet bucket @faboweb
- [#2394](https://github.com/cosmos/lunie/pull/2394) Bundle keybase profiles to provide a fallback to users in case of API throttling @faboweb 

### Changed

- [#2331](https://github.com/cosmos/lunie/issues/2331) change format proposal tally @fedekunze
- [#2395](https://github.com/cosmos/lunie/pull/2395) Deployment configuration @mircea-c
- [#2398](https://github.com/cosmos/lunie/pull/2398) Switch to code climate for coverage reports
- [#2399](https://github.com/cosmos/lunie/pull/2399) Moved Sentry to own org @faboweb
- [#2287](https://github.com/cosmos/lunie/pull/2287) Use tags instead of commit hash @sabau

### Fixed

- [#2391](https://github.com/cosmos/lunie/pull/2391) Catching potential error while sending transactions @faboweb  @faboweb
- [#2400](https://github.com/cosmos/lunie/pull/2400) Fixed account creation with native crypto @faboweb
- [#2404](https://github.com/cosmos/lunie/pull/2404) Fix createReleasePR test @faboweb 

## [1.0.0-beta.34] - 2019-04-02

### Added

- [#2385](https://github.com/cosmos/lunie/pull/2385) Added a tool to handle changelog conflicts @faboweb

## [1.0.0-beta.33] - 2019-03-31

[Changed] [\#2288](https://github.com/cosmos/voyager/issues/2288) Poll for tx to be included in a block if it isn't right away @faboweb


## [1.0.0-beta.32] - 2019-03-30

[Changed] Naming of amount input to "Deposit" on ModalPropose @faboweb
[Fixed] [\#2359](https://github.com/cosmos/lunie/pull/2359) fixed spacing on transactions @faboweb
[Fixed] [\#2323](https://github.com/cosmos/lunie/issues/2323) fixed and added anchor to validator's website @fedekunze

## [1.0.0-beta.31] - 2019-03-29

[Fixed] [\#2375](https://github.com/cosmos/lunie/pull/2375) fixed predictable randomness on key generation @fedekunze

## [1.0.0-beta.30] - 2019-03-28

[Fixed] [\#2370](https://github.com/cosmos/lunie/pull/2370) Better inplace updates to validators so the information (like signing info) never hides again once it was once loaded @faboweb
[Fixed] [\#2370](https://github.com/cosmos/lunie/pull/2370) Pages now scroll back to the top on tab changes @faboweb
[Changed] [\#2360](https://github.com/cosmos/lunie/issues/2360) disabled token sending on the cosmos hub @faboweb
[Changed] Reduced keybase caching timeouts @faboweb

## [1.0.0-beta.29] - 2019-03-27

[Changed] [\#2337](https://github.com/cosmos/voyager/pull/2337) Show rewards in header on mobile @faboweb
[Changed] [\#2361](https://github.com/cosmos/lunie/pull/2361) Complete renaming of README to Lunie @sabau
[Fixed] [\#2358](https://github.com/cosmos/lunie/pull/2358) Fixed store cache retrieval on sign in @faboweb
[Fixed] [\#2250](https://github.com/cosmos/lunie/issues/2250) Fixed staking transactions invalid date @fedekunze


## [1.0.0-beta.28] - 2019-03-25

### Added

- [\#2238](https://github.com/cosmos/voyager/issues/2238) Show estimaded fees @fedekunze

### Changed

- Circleci config deployment job to deploy `lunie.io` and `beta.lunie.io`
- renamed to Lunie @faboweb

## [1.0.0-beta.27] - 2019-03-25

### Added

- [\#2149](https://github.com/cosmos/voyager/issues/2149) display multi-message transactions @fedekunze

### Fixed

- [\#2330](https://github.com/cosmos/voyager/pull/2330) Fixed rewards not updating as expected @faboweb
- [\#2330](https://github.com/cosmos/voyager/pull/2330) Fixed transactions not loading when refreshing on PageTransactions @faboweb
- Fixed rewards not showing @faboweb

## [1.0.0-beta.26] - 2019-03-22

### Changed

- [\#1337](https://github.com/cosmos/voyager/issues/1337) Updated modals tests acording to standard @fedekunze
- [\#2328](https://github.com/cosmos/voyager/pull/2328) Changed "Total Rewards" to "Pending Rewards" in the balance header @faboweb


## [1.0.0-beta.25] - 2019-03-21

### Changed

- [\#2303](https://github.com/cosmos/voyager/issues/2303) Hide amounts in header until they are fully loaded @faboweb

### Security

- [\#2309](https://github.com/cosmos/voyager/pull/2309) remove markdown parser to reduce vulnerability of xss @faboweb

### Fixed

- [\#2301](https://github.com/cosmos/voyager/issues/2301) throttle requests for keybase identities @faboweb
- [\#2272](https://github.com/cosmos/voyager/issues/2272) fixed showing uatoms instead of atoms @faboweb
- [\#2289](https://github.com/cosmos/voyager/pull/2289) reduced amount of requests to full node @fedekunze

## [1.0.0-beta.24] - 2019-03-20

### Fixed

- [\#2305](https://github.com/cosmos/voyager/issues/2305) fixed numbers showing wrong on redelegation and unbonding transactions @faboweb
- Misc. style fixes @jbibla
- Fixed Balance header styles and responsiveness @jbibla


## [1.0.0-beta.23] - 2019-03-19

### Fixed

- PageValidator isn't showing @faboweb

## [1.0.0-beta.22] - 2019-03-19

### Added

- [\#2228](https://github.com/cosmos/voyager/issues/2228) display balances of vesting accounts @faboweb

### Fixed

- [\#2267](https://github.com/cosmos/voyager/issues/2267) fixed sorting on validator table @jbibla
- [\#2278](https://github.com/cosmos/voyager/issues/2278) fixed commission calculation on validator table @jbibla


## [1.0.0-beta.21] - 2019-03-16

### Added

- [\#2228](https://github.com/cosmos/voyager/issues/2228) display balances of vesting accounts @faboweb
- [\#2230](https://github.com/cosmos/voyager/issues/2230) calculate fees and estimated transaction gas @fedekunze
- [\#2291](https://github.com/cosmos/voyager/pull/2291) master built against main net full node @sabau

### Fixed

- [\#2269](https://github.com/cosmos/voyager/pull/2269) Persist session type if signed in with ledger @faboweb
- [\#2273](https://github.com/cosmos/voyager/issues/2273) fixed atoms and uatoms conversion @fedekunze


## [1.0.0-beta.20] - 2019-03-15

### Fixed

- [\#2273](https://github.com/cosmos/voyager/issues/2273) fixed atoms and uatoms conversion @fedekunze

## [1.0.0-beta.19] - 2019-03-15

### Added

- [\#2263](https://github.com/cosmos/voyager/pull/2263) Added guide on how to connect via a local full node to any network @faboweb

### Changed

- [\#1337](https://github.com/cosmos/voyager/issues/1337) refactor unit tests: Page404, ShortBech32 @fedekunze
- [\#2255](https://github.com/cosmos/voyager/pull/2255) removed onboarding tutorial @fedekunze
- [\#2259](https://github.com/cosmos/voyager/issues/2259) removed PagePreferences @fedekunze

### Fixed

- Fix for inflation on our testnet
- [\#2257](https://github.com/cosmos/voyager/pull/2257) fixed console error on page validator if loading the page from URL @faboweb


## [1.0.0-beta.18] - 2019-03-14

### Fixed

- [#\2188](https://github.com/cosmos/voyager/issues/2188) Fixed issues with the way we were loading PageNetwork @jbibla
- [#\2246](https://github.com/cosmos/voyager/issues/2246) Fix from moniker not visible on withdraw txs @faboweb

### Added

- [\#1959](https://github.com/cosmos/voyager/issues/1959) display transactions on block page @fedekunze

### Changed

- Ignore changelog check on master @faboweb
- [#\2217](https://github.com/cosmos/voyager/issues/2217) Limit inputs to max precision @faboweb

## [1.0.0-beta.17] - 2019-03-13

### Changed

- [#\2210](https://github.com/cosmos/voyager/pull/2210) Faucet give money only to non-existent addresses @sabau
- release PR now adds PENDING.md to CHANGELOG.md @faboweb
- [#\2202](https://github.com/cosmos/voyager/pull/2202) Fix circle configuration for publishing @sabau
- [#\2236](https://github.com/cosmos/voyager/pull/2236) ES lint no tabs @sabau



## [1.0.0-beta.16] - 2019-03-11

### Added

- [\#2104](https://github.com/cosmos/voyager/issues/2104) fix transaction times @fedekunze
- [\#1805](https://github.com/cosmos/voyager/issues/1805) support all transaction types @fedekunze
- [#\2225](https://github.com/cosmos/voyager/pull/2225) local testnets now always have the same account with funds @faboweb
- [\#2224](https://github.com/cosmos/voyager/issues/2224) persist the signed in address @faboweb

### Changed

- [#\2202](https://github.com/cosmos/voyager/pull/2202) Fix circle configuration for publishing @sabau
- [#\2211](https://github.com/cosmos/voyager/pull/2211) simplified sidebar and mobile menu, cleaned up css, fixed tests @jbibla
- [#\2225](https://github.com/cosmos/voyager/pull/2225) Moved to SDK version 0.33.0 @faboweb
- [#\2154](https://github.com/cosmos/voyager/pull/2154) Added ledger button and style updates @jbibla

### Fixed

- [#\2202](https://github.com/cosmos/voyager/issues/2202) Fix number conversions @faboweb
- Misc. style fixes @jbibla
- [\#2104](https://github.com/cosmos/voyager/issues/2103) fix undelegation format changes @faboweb 
- [\#2192](https://github.com/cosmos/voyager/pull/2192) hide tm-balance on PageProposal and PagePreferences if signed out @faboweb

## [1.0.0-beta.15] - 2019-03-07

### Changed

- [\#2043](https://github.com/cosmos/voyager/issues/2043) removed no-balance modals on staking page @fedekunze
- [\#2161](https://github.com/cosmos/voyager/pull/2161) fixed status dot position @jbibla
- [\#2193](https://github.com/cosmos/voyager/issues/2193) hide seed import @faboweb
- [\#195](https://github.com/tendermint/devops/issues/195) updated Circle config with new wallet domain name

### Fixed

- [\#2195](https://github.com/cosmos/voyager/issues/2195) undelegation modal showing wrong amount @faboweb

## [1.0.0-beta.14] - 2019-03-06

### Fixed

- [\#2138](https://github.com/cosmos/voyager/issues/2138) Non breaking space not renderer correctly on hardware state indicator @faboweb
- [\#1211](https://github.com/cosmos/voyager/issues/1211) Fixed thrown error on page validator when validator wasn't loaded yet @faboweb
- [\#2128](https://github.com/cosmos/voyager/pull/2128) remove loading status on validator page when disconnected from the network @fedekunze

### Added

- [\#1306](https://github.com/cosmos/voyager/issues/1306) Withdraw fee distribution rewards @fedekunze
- [\#1875](https://github.com/cosmos/voyager/issues/1875) optimistic updates for proposal creation @faboweb
- [\#1876](https://github.com/cosmos/voyager/issues/1876) optimistic updates for depositing on proposals @faboweb

- [\#2183](https://github.com/cosmos/voyager/issues/2183) Loading block to network block loader @jbibla
- [\#1875](https://github.com/cosmos/voyager/issues/1875) optimistic updates for proposal creation @faboweb
- [\#1876](https://github.com/cosmos/voyager/issues/1876) optimistic updates for depositing on proposals @faboweb

### Changed

- [\#2128](https://github.com/cosmos/voyager/pull/2128) remove loading status on validator page when disconnected from the network @fedekunze
- [\#2170](https://github.com/cosmos/voyager/pull/2170) bug with card-signed-in and explorer mode @jbibla
- [\#2167](https://github.com/cosmos/voyager/pull/2167) fixed votes showing wrong tally @faboweb
- [\#2167](https://github.com/cosmos/voyager/pull/2167) fixed not being able to deposit less then 1 atom not possible @faboweb
- [\#2167](https://github.com/cosmos/voyager/pull/2167) fixed sorting of proposals @faboweb
- [\#1897](https://github.com/cosmos/voyager/issues/1897) made action modals smaller @jbibla
- [\#2179](https://github.com/cosmos/voyager/issues/2179) removed "to" field from undelegation action modal @jbibla

## [1.0.0-beta.13] - 2019-03-05

### Added

- [\#2148](https://github.com/cosmos/voyager/pull/2148) readded insecure mode @faboweb
- [\#2151](https://github.com/cosmos/voyager/pull/2151) A "You need to sign in" card component @faboweb
- [\#2152](https://github.com/cosmos/voyager/pull/2152) Feedback button to collect feedback from users on the page @faboweb

### Fixed

- [\#1982](https://github.com/cosmos/voyager/issues/1982) Session screens are proper modals @jbibla
- [\#2050](https://github.com/cosmos/voyager/pull/2050) forward to /404 on a not found block @faboweb
- Security issue with lodash dependency @faboweb

## [1.0.0-beta.12] - 2019-03-04

## [1.0.0-beta.11] - 2019-03-02

### Changed

- [\#1887](https://github.com/cosmos/voyager/issues/1887) Activating Google Analytics anonymized by default @faboweb
- [\#2098](https://github.com/cosmos/voyager/issues/2098) rename devMode url flag to insecure @faboweb
- [\#1884](https://github.com/cosmos/voyager/issues/1884) Readded the possibility of e2e tests @faboweb

### Fixed

- [\#2087](https://github.com/cosmos/voyager/issues/2087) More resilient scripts on Ec2 instances, added validators @sabau

## [1.0.0-beta.10] - 2019-03-01

### Added

- [\#135](https://github.com/cosmos/voyager/issues/135) Show fee distribution rewards @fedekunze @faboweb

### Changed 

- [\#2044](https://github.com/cosmos/voyager/issues/2044) convert uatoms to atoms @faboweb
- Refactored tests: LiProposal @jbibla

## [1.0.0-beta.9] - 2019-02-28

### Fixed

- querying delegations was caught in a loop @faboweb
- resetting forms when action modal closes @faboweb

### Changed

- [\#1982](https://github.com/cosmos/voyager/issues/1982) Session screens are proper modals @jbibla

- [\#1337](https://github.com/cosmos/voyager/issues/1337) Refactor tests: PageValidator @faboweb

## [1.0.0-beta.8] - 2019-02-27

### Added

- [\#1032](https://github.com/cosmos/voyager/issues/1032) added several events to google analytics @faboweb
- [\#1630](https://github.com/cosmos/voyager/issues/1630) added memo "Sent via Cosmos UI" to distinguish txs sent via UI @faboweb
- [\#2035](https://github.com/cosmos/voyager/issues/2035) Distribution vuex module @fedekunze
- [\#2088](https://github.com/cosmos/voyager/issues/2088) Faucet button @sabau

### Fixed

- Fixed delegations not loaded on validator lists @faboweb
- [\#2015](https://github.com/cosmos/voyager/issues/2015) fixed error that showed wrong message when Ledger's screensaver mode was on @fedekunze
- Reconnected event was not triggered after reconnection @faboweb
- [\#2094](https://github.com/cosmos/voyager/pull/2094) fix Toolbar @faboweb
- Fix Webpack Env variables @sabau

### Changed

- [\#1337](https://github.com/cosmos/voyager/issues/1337) Refactor tests: TableValidators, TabMyDelegations @jbibla @faboweb
- [\#1337](https://github.com/cosmos/voyager/issues/1337) Refactor tests: pool-module @jbibla
- [\#2023](https://github.com/cosmos/voyager/issues/2023) remove jsdoc @sabau
- [\#1944](https://github.com/cosmos/voyager/issues/1944) Updated `README` @fedekunze

## [1.0.0-beta.7] - 2019-02-26

### Changed

- disabled TmOnboarding by default @jbibla
- [\#1337](https://github.com/cosmos/voyager/issues/1337) Refactor tests: ToolBar, TmModalHelp, LiCoin, PageTransactions, UndelegationModal, TmOnboarding, TmSessionAccountDelete, TabValidators, keybase-module @jbibla @faboweb

## [1.0.0-beta.6] - 2019-02-23

### Added

- Enable dev mode from url param @faboweb

### Fixed

- Refactored tests: PageStaking, PanelSort, TabStakingParameters @faboweb
- Sign in with local key @faboweb
- [\#2024](https://github.com/cosmos/voyager/issues/2024) Fixed feature setting the rpc from url param @faboweb

## [1.0.0-beta.5] - 2019-02-22

### Changed

- Removed Vue error handling to bubble errors to the console, this doesn't effect users @faboweb
- Removed unused packages @sabau
- [\#1337](https://github.com/cosmos/voyager/issues/1337) Removed search bar @jbibla

### Fixed

- Validator page shows now correctly by avoiding async errors @faboweb
- Stylelint configuration and scripts work as expected (no longer in webpack) @jbibla
- page for /governance/:proposalId @sabau

## [1.0.0-beta.4] - 2019-02-21

### Added

- [\#1997](https://github.com/cosmos/voyager/issues/1997) clicking on the top left logo goes to root @faboweb

### Changed

- Refactored user and session modules @faboweb
- Made app header and menu states local @faboweb
- [\#1993](https://github.com/cosmos/voyager/issues/1993) disabled web wallet in production @faboweb
- [\#2031](https://github.com/cosmos/voyager/issues/2031) voyager now depends from cosmos/ledger-cosmos-js

### Fixed

- [\#1999](https://github.com/cosmos/voyager/issues/1999) fixed signing of governance txs due to upstream SDK fix @faboweb
- [\#2028](https://github.com/cosmos/voyager/issues/2028) fixed giant image on onboarding screen @jbibla

## [1.0.0-beta.3] - 2019-02-20

### Added

- [\#1920](https://github.com/cosmos/voyager/issues/1920) Add link to install Cosmos Ledger App @fedekunze
- [\#2000](https://github.com/cosmos/voyager/issues/2000) Add distribution endpoints support @fedekunze

### Changed

- [\#1936](https://github.com/cosmos/voyager/issues/1936) remove `prettier` to avoid overriding `eslint:vue` rules @sabau

### Fixed

- [\#1910](https://github.com/cosmos/voyager/issues/1910) clipboard works in all browsers @jbibla
- [\#1917](https://github.com/cosmos/voyager/issues/1917) Handle ledger disconnection before signing @fedekunze
- [\#1978](https://github.com/cosmos/voyager/issues/1978) Don't display error notifications after timeout on ledger session page @fedekunze
- [\#2016](https://github.com/cosmos/voyager/issues/2016) Display correct error message when rejecting a transaction with ledger @fedekunze

## [1.0.0-beta.2] - 2019-02-19

### Added

### Changed

- [\#1729](https://github.com/cosmos/voyager/issues/1729) Rename endpoint functions @fedekunze
- [\#1790](https://github.com/cosmos/voyager/issues/1790) Rename `lcdClient.js` to `api.js` @fedekunze
- [\#2002](https://github.com/cosmos/voyager/pull/2002) Fix boot process for remote nodes @sabau

### Fixed

- [\#1879](https://github.com/cosmos/voyager/issues/1879) Align tx props with new format from SDK @sabau

## [1.0.0-beta.1] - 2019-02-18

### Fixed

- [\#1958](https://github.com/cosmos/voyager/issues/1958) Kill all processes if one dies to not have dangling processes in development setups @faboweb
- Fix development warning overlaying the UI too much @faboweb

## [0.10003.4] - 2019-02-17

### Added

- Contract tests for `keys` endpoints in lcdClient. @NodeGuy
- Protected Gaia Lite process with a mutex to prevent locking error. @NodeGuy
- catching errors on cache encryption. @faboweb
- [\#1436](https://github.com/cosmos/voyager/issues/1436) governance endpoints and vuex module @fedekunze
- [\#1482](https://github.com/cosmos/voyager/issues/1482) Added ESLint errors: no-var. @sgobotta
- [\#1449](https://github.com/cosmos/voyager/issues/1449) shortNumber to num scripts for more readable numbers. @jbibla
- [\#1509](https://github.com/cosmos/voyager/issues/1509) fail tests on console.error and console.warn and fix related bugs. Plus added a way to simply opt out of failing tests on console usage. @faboweb
- [\#1464](https://github.com/cosmos/voyager/issues/1464) Added governance transactions to tx history page @fedekunze
- [\#1401](https://github.com/cosmos/voyager/issues/1401) Display governance proposals index. @fedekunze
- [\#1472](https://github.com/cosmos/voyager/issues/1472) Added mock functionality for redelegation @fedekunze + @faboweb
- [\#1402](https://github.com/cosmos/voyager/issues/1402) Proposal creation through modal @fedekunze + @NodeGuy + @jbibla
- [\#1501](https://github.com/cosmos/voyager/issues/1501) Vote on proposals through modal @fedekunze + @jbibla
- [\#1567](https://github.com/cosmos/voyager/pull/1567) Various refactors on `main`, `node` and `lcdClient`. @NodeGuy
- [\#1502](https://github.com/cosmos/voyager/issues/1502) A page for each proposal. @jbibla
- [\#1552](https://github.com/cosmos/voyager/issues/1522) Deposit on proposals through modal @fedekunze
- [\#1548](https://github.com/cosmos/voyager/issues/1548) Add mocked deposit for testing @fedekunze
- [\#1116](https://github.com/cosmos/voyager/issues/1116) Elaborate a bit about the release process. @NodeGuy
- [\#1568](https://github.com/cosmos/voyager/issues/1568) Add mocked submit proposal for testing @fedekunze
- [\#1388](https://github.com/cosmos/voyager/issues/1388) Added TmConnectedNetwork to session pages @jbibla
- [\#1564](https://github.com/cosmos/voyager/issues/1564) Add support to query governance proposals on `lcdClient(Mock).js` @fedekunze
- [\#1544](https://github.com/cosmos/voyager/issues/1544) Added eslint-plugin-vue for cleaner vue files @jbibla
- [\#1607](https://github.com/cosmos/voyager/issues/1607) Add tally endpoint to query voting results @fedekunze
- added build option for single os to electron bundle script @faboweb
- [\#1611](https://github.com/cosmos/voyager/issues/1611) added no testnet warning @faboweb
- [\#1573](https://github.com/cosmos/voyager/issues/1573) added remote error collection for several catched errors in Voyager @faboweb
- [\#1632](https://github.com/cosmos/voyager/pull/1632) added FAQ about broken symlink to networks folder @faboweb
- [\#1198](https://github.com/cosmos/voyager/pull/1198) added e2e tests for wallet and staking transactions @faboweb
- [\#1685](https://github.com/cosmos/voyager/pull/1685) added .idea to .gitignore @sabau
- [\#1578](https://github.com/cosmos/voyager/issues/1578) added e2e tests for submit governance proposals @fedekunze
- [\#1672](https://github.com/cosmos/voyager/issues/1672) added e2e tests for staking parameters tab @fedekunze
- [\#1533](https://github.com/cosmos/voyager/issues/1533) added handling of missing connection to the full node at several places. @faboweb
- [\#1648](https://github.com/cosmos/voyager/issues/1648) added governance parameters tab @fedekunze
- [\#1550](https://github.com/cosmos/voyager/issues/1550) added e2e tests for voting on governance proposals @fedekunze
- [\#1555](https://github.com/cosmos/voyager/issues/1555) added e2e tests for submitting a deposit on a governance proposal @fedekunze
- [\#1681](https://github.com/cosmos/voyager/issues/1681) Governance: Fixed voting starting date @sabau
- [\#1690](https://github.com/cosmos/voyager/issues/1690) Governance: Fixed error messages for maxLength @sabau
- [\#1690](https://github.com/cosmos/voyager/issues/1690) Feedbacks when Amount is not between valid thresholds @sabau
- Added compatibility to Gaia/SDK version 0.28.0-rc2 @faboweb
- [\#1673](https://github.com/cosmos/voyager/issues/1673) Documentation and single command to run one or all tests with fallback for end to end test @sabau
- [\#1683](https://github.com/cosmos/voyager/issues/1683) Governance: block voting twice for the same option @sabau
- [\#1774](https://github.com/cosmos/voyager/issues/1776) added specs for the TmFieldSeed update method and value watcher @coreycosman
- [\#1387](https://github.com/cosmos/voyager/issues/1387) Staking: Added list of undelegation transactions @sabau
- [\#1661](https://github.com/cosmos/voyager/issues/1661) Boot: multinode available for local-testnet @sabau
- [\#1748](https://github.com/cosmos/voyager/issues/1748) display governance parameters on tab @fedekunze
- [\#1660](https://github.com/cosmos/voyager/issues/1660) Add parameters and pool to store @fedekunze
- [\#1739](https://github.com/cosmos/voyager/issues/1739) Init jsDoc into project @sabau
- [\#1674](https://github.com/cosmos/voyager/issues/1674) Add PageProfile component with shared styles for validator and proposal profiles @jbibla
- [\#1806](https://github.com/cosmos/voyager/issues/1806) CircleCI security check in dependencies with yarn audit @sabau
- [\#1804](https://github.com/cosmos/voyager/issues/1804) Moved Voyager to the web @faboweb
- [\#1835](https://github.com/cosmos/voyager/issues/1835) allow user to use different signing methods @faboweb
- [\#1833](https://github.com/cosmos/voyager/issues/1833) Prerequisites to allow continuous integration @sabau
- [\#1338](https://github.com/cosmos/voyager/issues/1338) Add Ledger Nano S support for signing transactions @fedekunze
- [\#1869](https://github.com/cosmos/voyager/issues/1869) Added PageNetwork @jbibla
- [\#1894](https://github.com/cosmos/voyager/issues/1894) Added favicons for all the browsers and devices @jbibla
- [\#1865](https://github.com/cosmos/voyager/issues/1865) Added Vuex blocks module @sabau
- [\#1928](https://github.com/cosmos/voyager/issues/1928) Added Browserstack reference to README @sabau
- [\#1918](https://github.com/cosmos/voyager/issues/1918) added message to log in when sending transactions and the user is not authenticated @fedekunze
- [\#1866](https://github.com/cosmos/voyager/issues/1866) Added blocks to network page and a page for viewing individual blocks @jbibla
- [\#1911](https://github.com/cosmos/voyager/issues/1911) Upload code to Sentry for remote error analyzer @faboweb
- Added development mode warning @faboweb
- [\#1972](https://github.com/cosmos/voyager/pull/1972) Add auto PR cron job to circle ci @sabau
- [\#1990](https://github.com/cosmos/voyager/pull/1990) Added postcss plugins and enabled css linter @jbibla

### Changed

- Changed minor component of version number to match testnet version. @NodeGuy
- [\#1433](https://github.com/cosmos/voyager/issues/1433) Migrated to latest SDK commit 6bff7082607a2c36439f8b6218816878c41ca6af. @faboweb
- [\#1183](https://github.com/cosmos/voyager/issues/1183) Changed a bunch of JavaScript files to strict mode. @NodeGuy
- Updated contribution guidelines. @faboweb
- [\#1447](https://github.com/cosmos/voyager/issues/1447) Removed titles from all pages. @faboweb
- Updated PR template @fedekunze
- [\#1454](https://github.com/cosmos/voyager/issues/1454) Updated a bunch of words to (hopefully) be clearer. @jbibla
- [\#1473](https://github.com/cosmos/voyager/issues/1473) added "percent of vote" to validator in vuex module instead of in component @jbibla
- [\#1497](https://github.com/cosmos/voyager/issues/1451) Using an html table for table validators component @jbibla
- [\#1496](https://github.com/cosmos/voyager/issues/1496) display validator pub_key instead of operator_address on livalidator and validator profile @jbibla
- made running a local node easier by reducing it to 2 commands and presetting an account. @faboweb
- [\#1504](https://github.com/cosmos/voyager/issues/1504) updates @tendermint/UI library to 0.4.3 @faboweb
- [\#1410](https://github.com/cosmos/voyager/issues/1410) removed end undelegations as not needed in the SDK anymore
- [\#1543](https://github.com/cosmos/voyager/issues/1543) updated unit tests to use `describe` and `it` instead of `test` @fedekunze
- [\#1377](https://github.com/cosmos/voyager/issues/1377) deleted AppFooter page @fedekunze
- [\#1582](https://github.com/cosmos/voyager/issues/1582) proposals now use time instead of block number @fedekunze
- [\#1585](https://github.com/cosmos/voyager/issues/1585) updated style in coin balances from wallet page @fedekunze
- [\#1547](https://github.com/cosmos/voyager/issues/1547) removed unused media queries @jbibla
- [\#1547](https://github.com/cosmos/voyager/issues/1547) deleted archive directory of old components @jbibla
- removed unit tests from prepush hook @faboweb
- [\#1566](https://github.com/cosmos/voyager/issues/1566) putting querying errors in the store instead of showing notifications @faboweb
- [\#1612](https://github.com/cosmos/voyager/issues/1612) defined props types on components
- changed `err` to `error` because abbreviations are bad @faboweb
- [\#1609](https://github.com/cosmos/voyager/issues/1609) switched to css and html to onboard developers faster @faboweb
- [\#1594](https://github.com/cosmos/voyager/issues/1594) disable decimal amount transfers @fedekunze
- [\#1680](https://github.com/cosmos/voyager/issues/1680) updated `TmBalance` to receive tabs an array of objects to avoid conflicting routes @fedekunze
- [\#1638](https://github.com/cosmos/voyager/issues/1638) removed account password from the state and now user has to input it on every transaction @fedekunze
- [\#1655](https://github.com/cosmos/voyager/issues/1655) Text and Textarea fields trimmed @sabau
- [\#1686](https://github.com/cosmos/voyager/issues/1686) Changed proposals from array to object @sabau
- [\#1387](https://github.com/cosmos/voyager/issues/1387) Delegation: modifiers simplified, setUnbondingDelegations takes an array as input now as the name suggest and replace the current dictionary with a new one @sabau
- [\#1626](https://github.com/cosmos/voyager/issues/1626) upgraded from raven to sentry/browser @jbibla
- [\#1724](https://github.com/cosmos/voyager/issues/1724) set tabindex attribute to -1 for readonly denom on ModalProposals. tab navgiation now skips element @enyan94
- [\#1277](https://github.com/cosmos/voyager/issues/1277) change name of VmToolBar to ToolBar, update all snapshots and import statements @coreycosman
- [\#1432](https://github.com/cosmos/voyager/issues/1432) Moved @tendermint/UI components back into the Voyager repository @faboweb
- [\#1769](https://github.com/cosmos/voyager/issues/1769) Removed hardcoded parameters values @fedekunze
- [\#1694](https://github.com/cosmos/voyager/issues/1694) Improved the `README` @faboweb @fedekunze
- [\#1379](https://github.com/cosmos/voyager/issues/1379) Changed some tests so they don't display errors on the console to better identify real errors @faboweb
- [\#1792](https://github.com/cosmos/voyager/pull/1792) removed mocked demo mode @fedekunze
- [\#1720](https://github.com/cosmos/voyager/issues/1720) Time format from 12 to 24h @sabau
- [\#1802](https://github.com/cosmos/voyager/issues/1802) Enable prefer-const eslint rule @sabau
- [\#1688](https://github.com/cosmos/voyager/issues/1688) Moved from every page to TmPage the connected, loading, empty data and search features @sabau
- [\#1588](https://github.com/cosmos/voyager/issues/1588) 404 page updates @jbibla
- [\#1737](https://github.com/cosmos/voyager/issues/1737) Updates to validator and proposal pages @jbibla
- [\#1846](https://github.com/cosmos/voyager/issues/1846) Allow node endpoints to be set from the URL @faboweb
- [\#1221](https://github.com/cosmos/voyager/issues/1221) individual linter check on GitHub @faboweb
- [\#1855](https://github.com/cosmos/voyager/issues/1855) skip gaia build if already built that hash @sabau
- [\#1922](https://github.com/cosmos/voyager/issues/1922) removed font awesome @jbibla
- [\#1916](https://github.com/cosmos/voyager/pull/1916) redirect to session modal when user hasn't logged in @fedekunze
- [\#1836](https://github.com/cosmos/voyager/issues/1836) remove back button @fedekunze
- [\#1718](https://github.com/cosmos/voyager/issues/1718) Remove session as default @fedekunze
- [\#1948](https://github.com/cosmos/voyager/pull/1948) changed PR template @fedekunze
- [\#1946](https://github.com/cosmos/voyager/pull/1946) removed proposer_address raw hex @jbibla
- [\#1967](https://github.com/cosmos/voyager/pull/1967) bundle analyzer changed from dynamic to static report @sabau
- always upload coverage to prevent PRs not being able to be merged if a not required check doesn't pass @faboweb

### Fixed

* Fixed gaia binary not be found on linux and windows in development @faboweb
* [\#1419](https://github.com/cosmos/voyager/issues/1419) Restored "Amount" label to delegation modal. @NodeGuy
* Fixed upstream cross compilation issue from SDK @faboweb
* [\#1446](https://github.com/cosmos/voyager/issues/1446) and [\#1445](https://github.com/cosmos/voyager/issues/1445) Fixed sorting in validator tables. @NodeGuy
* [\#1487](https://github.com/cosmos/voyager/issues/1487) Fixed running of local testnet. @NodeGuy
* [\#1480](https://github.com/cosmos/voyager/issues/1480) Fixed "duplicate CONN" errors in E2E tests. @NodeGuy
* [\#1480](https://github.com/cosmos/voyager/issues/1480) Fixed false detection of node crash in e2e test start. @faboweb
* [\#1451](https://github.com/cosmos/voyager/issues/1451) Provide better sourcemaps to make debugging easier. @faboweb
* [\#1409](https://github.com/cosmos/voyager/issues/1409) Fixed disabled unbond and redelegation button when delegation amount was less than 1 @fedekunze
* [\#1500](https://github.com/cosmos/voyager/issues/1500) Fixed wrong optimistic updates to the atom balance after staking @faboweb @fedekunze
* [\#1517](https://github.com/cosmos/voyager/issues/1517) Fixed wrong account format used for querying selfBond @faboweb
* [\#1503](https://github.com/cosmos/voyager/issues/1503) Added e2e test for balance updates after delegation @faboweb
* [\#1131](https://github.com/cosmos/voyager/issues/1131) Display only error message on notifications @fedekunze
* [\#1440](https://github.com/cosmos/voyager/issues/1440) Fixed an error that prevented disconnecting from the RPC websocket if it wasn't defined @fedekunze
* [\#1460](https://github.com/cosmos/voyager/issues/1460) Removing release-candidate tag when publishing @faboweb
- Fixed gaia binary not be found on linux and windows in development @faboweb
- [\#1419](https://github.com/cosmos/voyager/issues/1419) Restored "Amount" label to delegation modal. @NodeGuy
- Fixed upstream cross compilation issue from SDK @faboweb
- [\#1446](https://github.com/cosmos/voyager/issues/1446) and [\#1445](https://github.com/cosmos/voyager/issues/1445) Fixed sorting in validator tables. @NodeGuy
- [\#1487](https://github.com/cosmos/voyager/issues/1487) Fixed running of local testnet. @NodeGuy
- [\#1480](https://github.com/cosmos/voyager/issues/1480) Fixed "duplicate CONN" errors in E2E tests. @NodeGuy
- [\#1480](https://github.com/cosmos/voyager/issues/1480) Fixed false detection of node crash in e2e test start. @faboweb
- [\#1451](https://github.com/cosmos/voyager/issues/1451) Provide better sourcemaps to make debugging easier. @faboweb
- [\#1409](https://github.com/cosmos/voyager/issues/1409) Fixed disabled unbond and redelegation button when delegation amount was less than 1 @fedekunze
- [\#1500](https://github.com/cosmos/voyager/issues/1500) Fixed wrong optimistic updates to the atom balance after staking @faboweb @fedekunze
- [\#1517](https://github.com/cosmos/voyager/issues/1517) Fixed wrong account format used for querying selfBond @faboweb
- [\#1503](https://github.com/cosmos/voyager/issues/1503) Added e2e test for balance updates after delegation @faboweb
- [\#1131](https://github.com/cosmos/voyager/issues/1131) Display only error message on notifications @fedekunze
- [\#1440](https://github.com/cosmos/voyager/issues/1440) Fixed an error that prevented disconnecting from the RPC websocket if it wasn't defined @fedekunze
- [\#1460](https://github.com/cosmos/voyager/issues/1460) Removing release-candidate tag when publishing @faboweb
- [\#1402](https://github.com/cosmos/voyager/issues/1402) Fixed minor issues in voting and deposit @fedekunze
- [\#1574](https://github.com/cosmos/voyager/issues/1574) Fixed typo on mocked governance txs that prevented the execution of the query @fedekunze
- [\#1575](https://github.com/cosmos/voyager/issues/1575) Fixed tags on governance transactions query @fedekunze
- [\#1590](https://github.com/cosmos/voyager/issues/1590) Fixed empty error notifications caused by latest SDK update @fedekunze
- [\#1596](https://github.com/cosmos/voyager/issues/1596) Fixed error that prevented from triggering updates after submitting a new proposal @fedekunze
- [\#1321](https://github.com/cosmos/voyager/issues/1321) Fixed styling on TmModal @jbibla
- [\#1617](https://github.com/cosmos/voyager/pull/1617) Fixed multiple warnings showing on transactions page @faboweb
- [\#1617](https://github.com/cosmos/voyager/pull/1617) Fixed my validators not showing @faboweb
- [\#1617](https://github.com/cosmos/voyager/pull/1617) Fixed send buttons not clickable @faboweb
- [\#1303](https://github.com/cosmos/voyager/issues/1303) Fixed spamming of setSubscription @faboweb
- [\#1603](https://github.com/cosmos/voyager/issues/1603) Fixed inactive sidebar links @jbibla
- [\#1614](https://github.com/cosmos/voyager/issues/1614) Fixed an error that prevented a proposal to be updated optimistically after a successful deposit or vote @fedekunze
- [\#1386](https://github.com/cosmos/voyager/issues/1386) Cleaned up on-boarding @jbibla
- [\#1640](https://github.com/cosmos/voyager/issues/1640) Hide the table proposals when there are no available ones @fedekunze
- [\#1640](https://github.com/cosmos/voyager/issues/1640) Fixed an error that prevented the search bar to be displayed using `Ctrl+F` @fedekunze
- Fixed testnet config build script @faboweb
- [\#1677](https://github.com/cosmos/voyager/issues/1677) Fixed inconsistent status colors on proposals @faboweb
- [\#1687](https://github.com/cosmos/voyager/issues/1687) Removing cached state if decrypting fails. @faboweb
- [\#1662](https://github.com/cosmos/voyager/issues/1662) Fixed wrong node version in readme @faboweb
  [\#1642](https://github.com/cosmos/voyager/issues/1642) Refactor table styles and fixed bad aligned headers @faboweb
- [\#1677](https://github.com/cosmos/voyager/issues/1677) Fixed inconsistent status colors on proposals @fedekunze
- [\#1696](https://github.com/cosmos/voyager/issues/1696) Fixed broken css variables @jbibla
- [\#1687](https://github.com/cosmos/voyager/issues/1687) Removing cached state if decrypting fails. @faboweb
- [\#1662](https://github.com/cosmos/voyager/issues/1662) Fixed wrong node version in readme @faboweb
- [\#1641](https://github.com/cosmos/voyager/issues/1641) Fixed styling of validator page (parameters on top and min-width) @faboweb
- [\#1667](https://github.com/cosmos/voyager/issues/1667) Fixed menu in PageSend + hover cursor for menu @sabau
- [\#1676](https://github.com/cosmos/voyager/issues/1676) Reduced minWidth css for ModalVote to have 2 buttons per line @sabau
- [\#1676](https://github.com/cosmos/voyager/issues/1670) Update balance in header after voting and depositing @faboweb
- [\#1572](https://github.com/cosmos/voyager/issues/1572) Fixed scroll bug when switching between tabs @jbibla
- [\#1749](https://github.com/cosmos/voyager/issues/1749) Fixed proposal tally update after voting @fedekunze
- [\#1765](https://github.com/cosmos/voyager/pull/1765) Fixed proposal deposit update after submitting a deposit @fedekunze
- [\#1791](https://github.com/cosmos/voyager/issue/1791) Fixed a problem with initializing the Voyager config dir @faboweb
- [\#1815](https://github.com/cosmos/voyager/issue/1815) Fixed getters for proposals denominator, reverted to 945803d586b83d65547cd16f4cd5994eac2957ea until interfaces are ready @sabau
- [\#1809](https://github.com/cosmos/voyager/issue/1809) Fixed optimistically updating the header on sending @faboweb
- [\#1791](https://github.com/cosmos/voyager/pull/1791) Fixed a problem with initializing the Voyager config dir @faboweb
- [\#1754](https://github.com/cosmos/voyager/pull/1754) Fixed form UX, UI and other miscellaneous styling issues @jbibla
- [\#1707](https://github.com/cosmos/voyager/issues/1707) Governance txs are now disabled if the user doesn't hold any min_deposit token @fedekunze
- [\#1815](https://github.com/cosmos/voyager/pull/1815) Fixed getters for proposals denominator, reverted to 945803d586b83d65547cd16f4cd5994eac2957ea until interfaces are ready @sabau
- Fixed build process @ƒaboweb
- [\#1818](https://github.com/cosmos/voyager/issues/1818) Fixed error on validator loading showing as no validators @faboweb
- Fixed error locations sucked up by Sentry @faboweb
- [\#1815](https://github.com/cosmos/voyager/pull/1785) Fixed small bug on preferences page @jbibla
- [\#1831](https://github.com/cosmos/voyager/issues/1831) Fixed websocket reconnection @faboweb
- [\#1850](https://github.com/cosmos/voyager/pull/1850) Snapshots aligned for unit tests @sabau
- [\#1859](https://github.com/cosmos/voyager/pull/1859) Fix security check in circleci @sabau
- [\#1892](https://github.com/cosmos/voyager/issues/1892) Fix TmSessionImport form validation @faboweb
- Fixed signing issues related to https://github.com/cosmos/cosmos-sdk/issues/3336 @faboweb
- [\#1896](https://github.com/cosmos/voyager/issues/1896) Correctly update balances if account is empty @faboweb
- Fix actionmodal validation @faboweb
- [\#1934](https://github.com/cosmos/voyager/pull/1934) Fix boot process @sabau
- [\#961](https://github.com/cosmos/voyager/issues/961) Mock timezone and keep moment as it is @sabau
- [\#961](https://github.com/cosmos/voyager/issues/961) Mock only the `now` function from Date module @sabau
- Fixed `yarn start` @ƒaboweb
- [\#1955](https://github.com/cosmos/voyager/issues/1955) Fixed local testnet setup @faboweb
- HOT FIX: unit tests failed due to merge @faboweb
- HOT FIX: we fixed develop (replaced contenthash with hash) @jbibla
- Bring back devMode @faboweb
- [\#1945](https://github.com/cosmos/voyager/issues/1945) Fixed governance parameters quorum description @fedekunze
- [\#1978](https://github.com/cosmos/voyager/pull/1978) Fixed dependency for security audit @sabau
- [\#1977](https://github.com/cosmos/voyager/issues/1977) Fixed ledger notification errors @fedekunze

## [0.10.7] - 2018-10-10

### Added

- Display staking parameters and pool @fedekunze
- TmBalance to transaction history page @jbibla

### Changed

- TmBalance no longer expects unbondedAtoms prop @jbibla
- updated delegates module tests @faboweb
- showing 10 decimal places where bonding denom balance is displayed @jbibla

### Fixed

- set width for validator stats to avoid styling bugs @jbibla
- Test setMockedConnector without starting an endless loop. @NodeGuy
- speed up of e2e tests removing an expected timeout happening on navigate @faboweb
- Use unique keys in validator lists. @NodeGuy

### Changed

- updates to how addresses are displayed and how they can be copied @jbibla

## [0.10.6] - 2018-10-04

### Fixed

- automatic release process bugs @NodeGuy

## [0.10.5] - 2018-10-04

### Changed

- tabs now live inside the balance header @jbibla

### Fixed

- automatic release process bugs @NodeGuy

## [0.10.4] - 2018-10-03

### Fixed

- automatic release process bugs @NodeGuy

## [0.10.3] - 2018-10-02

### Added

- Added staking transactions and fixed 100% height txs. Refactored modules/blockchain.js @okwme
- test if build Voyager actually starts @faboweb
- added new validator component @okwme
- simple loading indicator for page staking @faboweb
- Created new "My Stake" tab. @NodeGuy
- possibility to end unbonding transactions @faboweb
- add option in staking modal to redelegate tokens from previosly bonded validators @fedekunze
- close buttons to Staking modal @NodeGuy
- more tests for new staking modal @NodeGuy
- Add commission and uptime to LiValidator @fedekunze
- Delete old bonding page @fedekunze
- `watch` script for running unit tests @faboweb @NodeGuy
- added unstake modal @faboweb
- `watch` script for running unit tests @faboweb @NodeGuy

### Changed

- Refactored Addressbook. @NodeGuy
- Created new modal window for staking to a validator. @NodeGuy
- Added new validator profile page @faboweb
- cleaning up new validator profile page and balance header @jbibla
- Changed a bunch of JavaScript files to strict mode. @NodeGuy @faboweb
- Refactored submitDelegation. @NodeGuy
- prefer backquotes in code @ƒaboweb
- Refactord submitDelegation. @NodeGuy
- Improved network connectivity bar @jbibla
- refactored words around staking and delegation @jbibla
- the remote lcd and rpc endpoints can now be specified individually in the config.toml and via environment variables @faboweb
- most endpoints use the remote lcd directly to improve performance @faboweb
- Moved Vue error handling code from console_error_throw.js to main.js @NodeGuy

### Fixed

- Do not try to publish a release on every push to `develop`! @NodeGuy
- validator url on txs leading to explorer @faboweb
- fixed a lot of incorrect calculations & bugs on bond page @okwme @faboweb
- removed unnecessary watcher for filling the shopping cart from LiDelegate @faboweb
- delegations request would update state of next user after sign out sign in @ƒaboweb
- enable user to stake only after the request for his current delegations has returned @ƒaboweb
- cache undelegations @faboweb
- show error instead of breaking Voyager if reconnection fails @faboweb
- reconnection errors did not show up correctly in view @faboweb
- fixed crash when reconnecting @faboweb
- fixed crash when using an offline fixed node @faboweb
- layout bugs in PageStaking @NodeGuy
- all seeds offline -> added random new ones @ƒaboweb
- styling around LiValidators @jbibla
- deleted duplicated tx components `TmLiDelegationTransaction.vue` and `TmLiTransaction.vue` @fedekunze
- bugs in the automatic release process @NodeGuy

## [0.10.2] - 2018-08-29

### Changed

- moved about Window to be a native menu so it would display from the application toolbar at any time @faboweb

### Fixed

- use correct set of seed nodes @ƒaboweb
- validator page showed incorrect voting power @faboweb
- improves poor performance at start by throttling the updates of the cached store @faboweb
- Run lint test in CI. @NodeGuy
- current atoms in PageBond still showed old atoms right after staking @ƒaboweb
- fix showing undefined for bonding denom in staking sucess message @faboweb
- fix not showing a lock (I have stake with this one) on a validator if stake is less then 1 @faboweb
- fix showing wrong error on pagebond validation @okwme

## [0.10.1] - 2018-08-29

### Added

- added more information on validators page @faboweb
- added new balance header for wallet @okwme
- E2E environment for a multi validator setup @faboweb
- added dev tools @okwme

### Changed

- cache per network to not have side effects between networks @faboweb
- removed animation from TmLi @okwme
- publish script on CI now requires all tests to pass, so we are sure that the published Version runs @ƒaboweb
- disable interaction buttons if not connected to the network, so user do not expect working interaction @faboweb
- using a variable for determining staking denomination @jbibla
- changed ATOM to bondingDenom getter @okwme
- more bondingDenom and copy updates @jbibla
- restored loading animation on start @faboweb
- improved error message for gaia version imcompatibility in development @faboweb

### Fixed

- solved parsing error with decimals in delegators voting power @fedekunze
- now resetting most store information on signing out to not have side effects between sessions @faboweb
- fixed toggle bg color bug @okwme
- import seed focus bug @okwme
- fixed trying to subscribe to transaction rpc events multiple times (prevent unexpected side effects doing so) @faboweb
- Reduce CHANGELOG.md conflicts. @NodeGuy
- Refactored main process. @NodeGuy
- CircleCI no longer runs test during a push to `release`. @NodeGuy
- E2E tests not producing screenshots and not logging certain values @faboweb
- Wallet balances updating after staking @okwme
- Updated testnet build process @okwme
- Release process now creates Git tag during publish. @NodeGuy
- fixed link to wallet on tx index page @faboweb
- E2E tests now correctly logs everything (before it was only showing the last app start logs) @faboweb

## [0.9.4] - 2018-08-08

### Changed

- remove block explorer and monitor references @jbibla
- removed light theme option from preferences page @jbibla
- enabled staked balance on PageWallet in production @faboweb
- updated tendermint/ui to fix min max override in page send @okwme
- removed unused xmlhttprequest dependency @faboweb
- LCD staking endpoints @fedekunze @faboweb
- the way we show version numbers in the version modal @jbibla

### Added

- storing balance, tx history and delegations locally to serve an old state faster @faboweb
- added error message for missing network config @faboweb
- command for building local node @okwme
- showing staking transactions in history @faboweb

### Fixed

- delegations error message properly parsed @fedekunze
- testnets not properly available after download @faboweb
- Tell the main process when we switch to the mock network. @NodeGuy
- improved tooltip styling @jbibla
- Sort validators by "Your Votes" fixed @okwme
- Overflow bonding bar bug @okwme
- improved modal and wallet styling @jbibla

## [0.9.3] - 2018-08-02

### Fixed

- builds not updating testnet configurations if the gaia version doesn't change @faboweb

## [0.9.2] - 2018-07-30

### Changed

- button styling @jbibla
- Switched to Gaia-7004 @faboweb
- showing warning about out of range of atoms in bonding UI only once on top and renaming it @faboweb
- blocking login if not connected to a node to prevent errors @faboweb

### Fixed

- broken styles in light theme @jbibla
- slider in staking UI @faboweb
- error with empty accounts @faboweb

## [0.9.1] - 2018-07-27

### Added

- Added reload button to transaction history page @faboweb
- added page views for google analytics @faboweb

### Changed

- Showing uniq transactions by their hash in history @faboweb
- Extracted components into @tendermint/ui for use in explorer @okwme
- using new old testnet repo for getting genesis files @faboweb
- switched to Gaia-7003 @faboweb
- Message for empty account @faboweb

### Fixed

- fixed block explorer always showing "syncing" @faboweb
- fixed not pushing to master (caused by me ;P) @faboweb
- Publish script now builds release artifacts. @NodeGuy
- fixed tx subscription @faboweb
- fixed hanging if initial nodes are offline @faboweb
- Copy network configuration from Gaia during publish. @NodeGuy

### Added

- staking e2e tests @faboweb

## [0.8.2] - 2018-07-23

### Fixed

- fixed release process and documentation @faboweb
- Showing weird characters @faboweb

## [0.8.1] - 2018-07-23

### Added

- Indicate if a validator has been revoked in the Staking UI @mappum
- Information about current connection attempts @faboweb
- Release published on GitHub now including changes from CHANGELOG. @NodeGuy
- Added ESLint errors: no-undef and no-unused-vars. @NodeGuy
- Modal when a node doesn't signal any new blocks @faboweb
- Checking the SDK version of the node Voyager connects to against an expected SDK version for the network @faboweb
- Added post checkout yarn @okwme

### Changed

- Copy the network configuration only during local builds. @NodeGuy
- Ignoring the potential local-testnet folder that is used in the README for local testnets @faboweb
- Moved the changelog check to a GitHub status check @faboweb
- Moved to SDK v0.21.1 @faboweb
- Using vue-jest for transpiling in tests for better code coverage output @faboweb
- Default to gaia-7001 @okwme
- Changed `yarn testnet` to `yarn start` @okwme
- Updated colors throughout @jbibla
- Update network @okwme

### Fixed

- Voyager hanging after reloading in development mode @faboweb
- Bad Boy Back Button Back @okwme
- Unable to bond just to already bonded candidates @faboweb
- Staking tokens showing NaN @faboweb
- Staking page showing old shares after bonding @faboweb
- Made linting work on Windows. @NodeGuy
- Renamed some ni- class identifiers to tm- to be consistent @faboweb
- Fixed the theme switcher @faboweb
- Fixed various building bugs. @NodeGuy
- Development CLI tools handle exceptions better. @NodeGuy

## [0.7.1] - 2018-07-04

### Added

- Configs for the gaia-6002 testnet @faboweb
- Bot which returns money to sender in mock mode @mappum
- Introduced addressbook to store found peers and to select nodes round robin @faboweb
- Tutorial how to start a local node @faboweb
- Added versions to Preference Page @okwme
- Send confirmation popup @faboweb
- Checking known nodes round robin and signaling an error if none are available @faboweb
- Help menu with links to report a bug or view the log @faboweb
- build duration and input/output hashes to build process @NodeGuy

### Changed

- Use persistent peers and seeds from tendermint config @faboweb
- Updated loading icon and loading states @jbibla
- more components moved to `@tendermint/ui` @okwme
- Removed COSMOS_MOCKED flag @faboweb
- Improved readability and accessibility @jbibla
- Significant style and UI updates for dark and light themes @jbibla
- Doesn't show loading screen when validators are still stored @okwme
- Improved CI @faboweb
- Search bar fixed to top @okwme
- Hide block subscription errors @mappum
- Fixed css editing in devtools @faboweb
- Added history and disabled backbutton on no history @okwme
- Network configuration files are now taken from the SDK repo. @NodeGuy

### Fixed

- Fixed bug in yarn build:gaia @zramsay
- Increased version of localtestnet used for testing to match gaia @faboweb
- Fixed padding issue in main container @faboweb
- Unit tests work with new components @okwme
- Wait for LCD to start serving at app startup to prevent timing errors @mappum
- Fixed white flash on startup @okwme
- Fixed critical dependency warning @okwme
- Fixed theme bg bug @okwme
- Fixed sorting bug on staking page @okwme
- "About Cosmos Voyager" menu item is now responsive on Windows and Linux @mappum
- Fixed preference page style bug @okwme
- Fixed missing node-ip in connection indicator @faboweb
- Launch sequence for dev improved @okwme
- E2E test maybe fix @okwme
- Login in to restricted page bug @okwme
- Send with an empty wallet bug @okwme
- Readme formatting @okwme

## [0.7.0] - 2018-06-13

### Changes

- Disabled error reporting in development @faboweb
- Removed ci files from code coverage as they are badly testable @faboweb
- Update genesis.json when conflicts are detected @jbibla
- Hide IBC as it will not be ready for launch @faboweb
- Updated e2e tests to not rely on flags to run @okwme
- Not shrinking stacktrace anymore @faboweb
- Improved the visibility and readability of the current network connection. @nylira
- Updated electron to v2.0.2 @okwme
- The release builds now have more sensible names. @NodeGuy
- Transactions use the account number to prevent attacks @faboweb
- Building Voyager now builds Gaia if not found @NodeGuy

### Added

- Bech32 address validation @okwme
- Notification for dev error collection toggle behavior @okwme
- Added automatic releases @faboweb @NodeGuy
- Added staking functionality! @mappum
- Export all testing config on CI @faboweb

### Fixed

- Blocks not updating in block explorer when switching network @faboweb
- Fixed minor typo in README.md @nylira
- Tx bug where state wasn't updated @okwme
- Persisting e2e failure screenshots as artifact on circleci @faboweb
- Theme switching bug @okwme
- Electron dev tool version bug @okwme
- Update delegations also in the wallet view @faboweb
- The release builds forgot to include the network configuration. @NodeGuy
- Skip changelog update check on release branches @faboweb

## [0.6.2] - 2018-05-23

### Added

- Added linting check and unit tests to the git prepush hook @faboweb
- Added basic validation for wallet send @okwme
- Added COSMOS_MOCKED env variable to allow overwriting mocked mode from the command line @faboweb
- User will now be logged out if switching between mocked and live connector @faboweb
- recovery seed form validation & tests @okwme
- added tx view to block explorer @okwme

### Changed

- Simplify pull request and issue templates. @nylira
- Add CONTRIBUTING.md with contributing tips. @nylira
- Build process now builds for all three platforms at the same time. @NodeGuy
- The config.toml is now mocked to guarantee consistent unit tests @faboweb
- The binary is now accepted if it has the same minor version instead of the path version. @faboweb
- Hid staking button on wallet page @jbibla
- Increment version in package.json @jbibla
- Profile page now settings with forked ni-vue-field @okwme @nylira
- Added proper voyager logo to readme @jbibla
- Made search consistent @okwme
- Change gaia-2 to gaia-5001 in readme @jbibla
- Improved readme with better prerequisite instructions @nylira

### Fixes

- Error messages from main thread are now displayed correctly in the view @faboweb

### Fixed

- Re-enabled staking and transactions pages for mocked network. @nylira
- Revealed the password for the default account on the mocked network. @nylira
- Fixed not being able to reconnect to a live network if started in mocked mode. @faboweb

## [0.6.1] - 2018-05-22

### Changed

- Removed some defaults when building a release to reduce confusion. @NodeGuy
- CircleCI no times out after 5 mins to free workers from bad runs. @faboweb
- Fixed a bug where errors that occurred while sending a transaction would prevent further sends from succeeding. @mappum

### Fixed

- Reconnection when coming back from mocked connection works again @faboweb
- Fixed accounts not available after switching back from a mocked connection. @faboweb

## [0.6.0]

### Added

- Added a toggle to switch between a mocked blockchain connector and the live connector @faboweb
- A check for updating the changelog (also pre-push) @faboweb
- Added automatic Prettier formatting on commits @faboweb
- The build process now builds the Cosmos SDK from source code. @NodeGuy

### Changed

- Upgraded many dependencies. @NodeGuy
- Upgraded to new SDK. @mappum
- Improved design of light theme. @nylira
- Improved design on Windows. @nylira
- Disabled the changelog check on develop @faboweb

### Fixed

- Windows build now compresses `zip` file. @NodeGuy
- Fixed block explorer @faboweb
- An error showing after a reconnect @faboweb
- Fixed onboarding window appearing everytime @faboweb

## [0.5.0]

### Added

- The following file types are now formatted with [Prettier](https://prettier.io/): css, js, json, vue.
- Staked tokens are now shown on the wallet page.

### Changed

- If app crashes, a full page error is shown @faboweb
- New Voyager logo @nylira
- The application is now built in a Docker container for increased reproducibility.

## [0.4.4] - 2018-03-08

### Added

- Added `mvp-features.md` to documentation. @nylira
- Added full page error @nylira
- Added receive button and receive modal @jbibla
- The validator hash now has to be approved by the user for security @faboweb
- Transitioned to Docker for easier cross platform builds. @NodeGuy
- New light theme for day time Voyaging 😎 🚀 @nylira
- Users can now opt in or out of remote error collection. @faboweb
- Ability to send over IBC @mappum

### Changed

- The primary staking token is now set in configuration - Fermion during development, Atom for launch.

## [0.4.3] - 2018-02-05

### Changed

- Renamed Cosmos UI to Cosmos Voyager. @nylira
- Added Google Analytics for testnet versions @faboweb
- Added Sentry error reporting for testnet versions @faboweb
- Fixed reconnection issues @faboweb
- Made Windows builds deterministic @mappum
- Reduced size of OSX builds @mappum

## [0.4.2] - 2018-02-05

### Added

- Added back button to every page. @jbibla

### Changed

- Updated transaction history to be more clear and descriptive. @jbibla
- Improved delegate profile page to accommodate candidates and validators. @jbibla

## [0.4.1] - 2018-02-01

### Fixed

- Fix for Windows build crashing on startup. @faboweb

## [0.4.0] - 2018-02-01

### Added

- Added button styles for Success, Warning, and Danger states. @nylira
- Added support for image icons. @faboweb
- Added release documentation. @mappum

### Changed

- Improved primary button style. @nylira
- Fixed the cut-off text bug in buttons. @nylira
- Improves the `hover-bg` app variable color. @nylira
- Updated release script to use `tar-fs` instead of `tar-stream` to support symlinks. @nylira

### Removed

- Removed unused `sass-loader` node dependency. @nylira

## [0.3.1] - 2018-01-30

### Added

- Check to ensure gaia version is correct for the current network @mappum

### Changed

- Added a callback and console output when Vue app has finished loading to test build apps on successful startup. @faboweb
- Resolved notifications error on NiSessionLoading.vue. @nylira
- Resolved old saved prevAccountKey being used in NiSessionSignIn.vue. @nylira
- Improved performance of amountBonded in LiDelegate.vue./ @nylira
- Prevented user from going to PageBond if they don't have any atoms. @nylira
- Hid the bonding interface on PageDelegates if the user doesn't have any atoms. @nylira
- Improved error handling by shutting down the application when there are unhandled errors in the main thread. @faboweb

## [0.3.0] - 2018-01-15

### Added

- Added a changelog @jbibla.
