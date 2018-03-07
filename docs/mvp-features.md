# Voyager MVP Features
These features of Voyager are considered essential for MVP. They are required to be completed before we can launch the Cosmos Hub.

## Managing accounts

The user should be able to:

* Create an account with a new seed and address
* Import an account with a Cosmos seed
* Import an account with the seed contained in hardware (i.e. Ledger)
* Select which account they wish to sign into

## Sending & Receiving

The user should be able to:

* Receive atoms, photons, and other Cosmos tokens to their Cosmos address
* Send atoms, photons, and other Cosmos tokens (for a fee) to other Cosmos addresses
* View historical transactions sent to and from their Cosmos address
* Filter and search through past transactions

## Staking

The user should be able to:

* View a list of validators and validator candidates for the network
* Filter and sort through them by criteria like validator/delegate id, validator status, atoms staked, and more.
* Bond their atoms to one or more validators and candidates.
* View the number of atoms they currently have bonded.
* Unbonded atoms from one or more candidates.
* Earn photons as staking rewards
* Earn atoms via the targeted inflation rate

## Proposing & Voting

The user should be able to:

* View a list of current, pending, and closed proposals.
* View the details of a proposal like title, body, type, current votes, minDeposit, and time remaining until the proposal is closed.
* Have four vote options per proposal: Yes, No, No (With Force), Abstain
* Be able to create a new proposal with a title, body, and type (general or software upgrade). They will also be able to input a portion of a minDeposit to meet the activation threshold.
* Be able to help convert a pending proposal to an active proposal by adding to the minDeposit

## Exploring blocks

The user should be able to:

* View a constantly refreshed list of the most recently validated blocks on the network
* Search for blocks via block height
* View the details of a block, including precommits, signatures, and transactions
