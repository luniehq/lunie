# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2018-01-15
### Added
- Added a changelog @jolesbi.

## [0.3.1] - 2018-01-30
### 
* Check to ensure gaia version is correct for the current network @mappum

### Changed
* Resolved notifications error on NiSessionLoading.vue @nylira.
* Resolved old saved prevAccountKey being used in NiSessionSignIn.vue @nylira.
* Improved performance of amountBonded in LiDelegate.vue @nylira.
* Prevented user from going to PageBond if they don't have any atoms/fermions @nylira.
* Hid the bonding interface on PageDelegates if the user doesn't have any atoms @nylira.
